import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { creditMerchantBalance } from '@/lib/unitechpay';
import { getCurrentUser } from '@/lib/auth';

interface SuccessPageProps {
  searchParams: {
    transaction_id?: string;
    userId?: string;
    method?: string;
  };
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  const transactionId = searchParams.transaction_id;
  const targetUserId = searchParams.userId || user.id;
  const method = searchParams.method || 'wave';

  if (transactionId) {
    try {
      // 1. Mettre à jour l'utilisateur en mode Pro
      await db.query(
        `UPDATE users SET subscription_tier = 'pro' WHERE id = $1`,
        [targetUserId]
      );

      // 2. Insérer l'abonnement actif dans la table subscriptions
      const startsAt = new Date();
      const endsAt = new Date();
      endsAt.setDate(startsAt.getDate() + 30); // 30 jours d'abonnement

      // Vérifier si cette transaction existe déjà pour éviter les doublons
      const existingSub = await db.query(
        `SELECT id FROM subscriptions WHERE unitech_payment_id = $1`,
        [transactionId]
      );

      if (existingSub.rows.length === 0) {
        await db.query(
          `INSERT INTO subscriptions (user_id, payment_method, status, unitech_payment_id, amount, starts_at, ends_at) 
           VALUES ($1, $2, 'active', $3, 2000, $4, $5)`,
          [targetUserId, method, transactionId, startsAt, endsAt]
        );

        // 3. Mettre à jour le solde marchand UnitechPay de test
        await creditMerchantBalance(method, 2000);
      }
    } catch (err) {
      console.error('Error processing simulation success:', err);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center', padding: '40px 10px' }}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 12px auto', filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.3))' }}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
      </svg>
      
      <div>
        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '26px', fontWeight: '800', color: '#fbbf24', marginBottom: '8px' }}>
          Paiement réussi !
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
          Félicitations, ton abonnement **Goumin Pro** est activé. Tu as désormais accès au journal illimité, aux statistiques d'humeur et à la création de cercles d'entraide privés !
        </p>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-color)',
        padding: '16px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '360px',
        textAlign: 'left',
        fontSize: '13px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Transaction ID:</span>
          <strong style={{ fontFamily: 'monospace' }}>{transactionId || 'Simulation'}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Montant :</span>
          <strong>2000 FCFA</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Opérateur :</span>
          <strong style={{ textTransform: 'uppercase' }}>{method === 'om' ? 'Orange Money' : 'Wave'}</strong>
        </div>
      </div>

      <a href="/" className="btn btn-primary" style={{ width: '100%', maxWidth: '280px', textDecoration: 'none' }}>
        Retourner à l'accueil
      </a>
    </div>
  );
}
