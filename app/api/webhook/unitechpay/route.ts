import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhookSignature, creditMerchantBalance } from '@/lib/unitechpay';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-unitechpay-signature') || req.headers.get('authorization')?.replace('Bearer ', '') || '';

    // 1. Validation de la signature HMAC-SHA256
    const isValid = verifyWebhookSignature(rawBody, signature);
    const isDev = process.env.NODE_ENV !== 'production' || process.env.UNITECHPAY_API_KEY === 'test_unitech_api_key_goumin';
    
    if (!isValid && !isDev) {
      return NextResponse.json({ error: 'Signature invalide.' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // Extraction des champs de la transaction selon les spécifications UnitechPay v1.2.0 et anciennes versions
    const { transaction_id, reference, status, method, amount, metadata } = payload;
    
    // Le statut peut être 'success' (ancienne version) ou 'completed' (v1.2.0)
    const isCompleted = status === 'success' || status === 'completed' || payload.event === 'payment_completed';

    if (!isCompleted) {
      return NextResponse.json({ success: true, message: 'Statut de transaction non complété ou ignoré.' });
    }

    const payRef = reference || transaction_id;
    if (!payRef) {
      return NextResponse.json({ error: 'Identifiant de transaction (reference/transaction_id) manquant.' }, { status: 400 });
    }

    // Récupérer le userId associé à cette transaction
    let userId = metadata?.userId;
    if (!userId) {
      const subRes = await db.query(
        `SELECT user_id FROM subscriptions WHERE unitech_payment_id = $1`,
        [String(payRef)]
      );
      if (subRes.rows.length > 0) {
        userId = subRes.rows[0].user_id;
      }
    }

    if (!userId) {
      console.warn(`Webhook UnitechPay : Impossible de trouver l'utilisateur pour la référence ${payRef}`);
      return NextResponse.json({ error: `Utilisateur introuvable pour la référence ${payRef}` }, { status: 404 });
    }

    // 2. Promotion de l'utilisateur au tier Pro en base
    await db.query(
      `UPDATE users SET subscription_tier = 'pro' WHERE id = $1`,
      [userId]
    );

    // 3. Création ou mise à jour de l'abonnement en statut actif
    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setDate(startsAt.getDate() + 30); // 30 jours

    // Vérifier si cette transaction existe déjà sous le statut actif
    const checkSub = await db.query(
      `SELECT id, status FROM subscriptions WHERE unitech_payment_id = $1`,
      [String(payRef)]
    );

    if (checkSub.rows.length === 0) {
      await db.query(
        `INSERT INTO subscriptions (user_id, payment_method, status, unitech_payment_id, amount, starts_at, ends_at) 
         VALUES ($1, $2, 'active', $3, $4, $5, $6)`,
        [userId, method || 'wave', String(payRef), amount || 2000, startsAt, endsAt]
      );
      // Créditer le solde marchand
      await creditMerchantBalance(method || 'wave', amount || 2000);
    } else {
      const sub = checkSub.rows[0];
      if (sub.status !== 'active') {
        await db.query(
          `UPDATE subscriptions SET status = 'active', starts_at = $1, ends_at = $2, amount = $3 WHERE id = $4`,
          [startsAt, endsAt, amount || 2000, sub.id]
        );
        // Créditer le solde marchand
        await creditMerchantBalance(method || 'wave', amount || 2000);
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook traité avec succès.' });
  } catch (error: any) {
    console.error('Webhook UnitechPay handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
