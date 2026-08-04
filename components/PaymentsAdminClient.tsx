'use client';

import React, { useTransition } from 'react';
import { adminSimulateFailedPaymentRelance } from '@/app/adminActions';

interface Transaction {
  id: string;
  username: string;
  identifier: string;
  payment_method: string;
  unitech_payment_id: string;
  amount: number;
  status: string;
  created_at: string;
  ends_at: string;
}

interface PaymentsAdminClientProps {
  proCount: number;
  waveBalance: number;
  omBalance: number;
  transactions: Transaction[];
}

export default function PaymentsAdminClient({ proCount, waveBalance, omBalance, transactions }: PaymentsAdminClientProps) {
  const [isPending, startTransition] = useTransition();

  const handleRelance = (id: string, username: string) => {
    startTransition(async () => {
      const res = await adminSimulateFailedPaymentRelance(id);
      if (res?.error) {
        alert(res.error);
      } else {
        alert(`Relance de facturation envoyée avec succès à @${username} !`);
      }
    });
  };

  const totalBalance = waveBalance + omBalance;
  const mrr = proCount * 2000;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '28px', fontWeight: '800' }}>Abonnements & Transactions</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px' }}>
          Suivi financier, transactions UnitechPay en temps réel et relances d'impayés.
        </p>
      </div>

      {/* Stats Widgets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>ABONNÉS PRO ACTIFS</span>
          <strong style={{ fontSize: '28px', color: '#fbbf24', fontFamily: 'var(--font-title)' }}>{proCount}</strong>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Mise à jour immédiate</span>
        </div>

        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>REVENU MENSUEL ESTIMÉ (MRR)</span>
          <strong style={{ fontSize: '28px', color: '#fff', fontFamily: 'var(--font-title)' }}>{mrr.toLocaleString()} FCFA</strong>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>({proCount} × 2000 FCFA)</span>
        </div>

        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>SOLDE COMPTE WAVE</span>
          <strong style={{ fontSize: '28px', color: '#60a5fa', fontFamily: 'var(--font-title)' }}>{waveBalance.toLocaleString()} FCFA</strong>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Revenus Wave cumulés</span>
        </div>

        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>SOLDE ORANGE MONEY</span>
          <strong style={{ fontSize: '28px', color: '#fb923c', fontFamily: 'var(--font-title)' }}>{omBalance.toLocaleString()} FCFA</strong>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Revenus OM cumulés</span>
        </div>

      </div>

      {/* Transactions list card */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: '800' }}>Historique UnitechPay</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total: {transactions.length} transactions</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Opérateur</th>
                <th>Référence Paiement</th>
                <th>Montant</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    Aucune transaction enregistrée.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isOM = tx.payment_method.toLowerCase() === 'om' || tx.payment_method.toLowerCase() === 'orange_om';
                  const isFailed = tx.status === 'failed' || tx.status === 'expired' || tx.status === 'pending';

                  return (
                    <tr key={tx.id}>
                      <td><strong>@{tx.username}</strong></td>
                      <td>
                        <span style={{
                          color: isOM ? '#fb923c' : '#60a5fa',
                          fontWeight: 'bold',
                          fontSize: '13px'
                        }}>
                          {isOM ? 'Orange Money' : 'Wave'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        {tx.unitech_payment_id}
                      </td>
                      <td><strong>{tx.amount} FCFA</strong></td>
                      <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        {new Date(tx.created_at).toLocaleString('fr-FR')}
                      </td>
                      <td>
                        <span className={`admin-badge ${tx.status}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td>
                        {isFailed ? (
                          <button
                            onClick={() => handleRelance(tx.id, tx.username)}
                            disabled={isPending}
                            style={{
                              background: 'rgba(251, 146, 60, 0.1)',
                              border: '1px solid rgba(251, 146, 60, 0.25)',
                              borderRadius: '8px',
                              color: '#fb923c',
                              padding: '6px 12px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            Relancer
                          </button>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>Aucune requise</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
