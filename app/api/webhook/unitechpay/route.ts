import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhookSignature, creditMerchantBalance } from '@/lib/unitechpay';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-unitechpay-signature') || req.headers.get('authorization')?.replace('Bearer ', '') || '';

    // 1. Validation de la signature HMAC-SHA256 (la clé API ou webhook secret sert de secret)
    const isValid = verifyWebhookSignature(rawBody, signature);

    // En production, nous exigeons la signature. En mode test/développement local sans clé valide,
    // on accepte pour pouvoir tester l'intégration via des requêtes de test simulées si désiré.
    const isDev = process.env.NODE_ENV !== 'production' || process.env.UNITECHPAY_API_KEY === 'test_unitech_api_key_goumin';
    
    if (!isValid && !isDev) {
      return NextResponse.json({ error: 'Signature invalide.' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // Extraction des champs de la transaction selon les spécifications UnitechPay
    const { transaction_id, status, method, amount, metadata } = payload;
    const userId = metadata?.userId;

    if (!userId || status !== 'success') {
      return NextResponse.json({ success: true, message: 'Webhook ignoré ou incomplet.' });
    }

    // 2. Promotion de l'utilisateur au tier Pro en base
    await db.query(
      `UPDATE users SET subscription_tier = 'pro' WHERE id = $1`,
      [userId]
    );

    // 3. Création ou mise à jour de l'abonnement
    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setDate(startsAt.getDate() + 30); // 30 jours

    // Vérifier si cette transaction existe déjà
    const checkSub = await db.query(
      `SELECT id FROM subscriptions WHERE unitech_payment_id = $1`,
      [transaction_id]
    );

    if (checkSub.rows.length === 0) {
      await db.query(
        `INSERT INTO subscriptions (user_id, payment_method, status, unitech_payment_id, amount, starts_at, ends_at) 
         VALUES ($1, $2, 'active', $3, $4, $5, $6)`,
        [userId, method, transaction_id, amount || 2000, startsAt, endsAt]
      );

      // 4. Créditer le solde du marchand selon le mode de paiement (Wave ou Orange Money)
      await creditMerchantBalance(method, amount || 2000);
    }

    return NextResponse.json({ success: true, message: 'Webhook traité avec succès.' });
  } catch (error: any) {
    console.error('Webhook UnitechPay handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
