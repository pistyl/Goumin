'use client';

import React, { useState, useTransition } from 'react';
import { subscribeProAction } from '@/app/actions';
import { User } from '@/lib/auth';

interface ProClientProps {
  user: User;
}

export default function ProClient({ user }: ProClientProps) {
  const [method, setMethod] = useState<'wave' | 'om'>('wave');
  const [phone, setPhone] = useState(user.identifier || '');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isPro = user.subscription_tier === 'pro';

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await subscribeProAction(method, phone);
      if (res?.error) {
        setError(res.error);
      } else if (res?.paymentUrl) {
        // Rediriger vers l'interface de paiement UnitechPay (ou page de simulation en dev)
        window.location.href = res.paymentUrl;
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
      
      {/* En-tête */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '26px', fontWeight: '800', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Goumin Pro 👑
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', lineHeight: '1.4' }}>
          Accompagnement premium, historique illimité et outils exclusifs de reconstruction émotionnelle pour 2000 FCFA / mois.
        </p>
      </div>

      {isPro ? (
        <div className="card" style={{ border: '2px solid #fbbf24', background: 'rgba(251,191,36,0.05)', textAlign: 'center', padding: '24px 16px' }}>
          <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>✨</span>
          <strong style={{ fontSize: '16px', color: '#fbbf24', display: 'block', marginBottom: '8px' }}>
            Tu es membre Goumin Pro !
          </strong>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Merci pour ton soutien et ta confiance. Tu as un accès illimité à toutes les fonctionnalités de l'application. Courage dans ton parcours de reconstruction. 💛
          </p>
        </div>
      ) : (
        <>
          {/* Tableau des fonctionnalités */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 10px', color: 'var(--text-main)', fontWeight: 'bold' }}>Fonctionnalité</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>Gratuit</th>
                  <th style={{ padding: '12px 10px', color: '#fbbf24', fontWeight: 'bold' }}>Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: '500' }}>Cercles d'entraide</td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>Illimité</td>
                  <td style={{ padding: '12px 10px', color: '#fbbf24' }}>Illimité</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: '500', color: 'var(--sos-primary)' }}>🆘 Mode SOS complet</td>
                  <td style={{ padding: '12px 10px', color: 'var(--sos-primary)' }}>Toujours gratuit</td>
                  <td style={{ padding: '12px 10px', color: 'var(--sos-primary)' }}>Toujours gratuit</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: '500' }}>Journal intime</td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>1 / jour (7j hist.)</td>
                  <td style={{ padding: '12px 10px', color: '#fbbf24' }}>Illimité</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: '500' }}>Suivi d'humeur graphique</td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>Non</td>
                  <td style={{ padding: '12px 10px', color: '#fbbf24' }}>Oui (Statistiques)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: '500' }}>Créer des cercles privés</td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>Non</td>
                  <td style={{ padding: '12px 10px', color: '#fbbf24' }}>Oui</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: '500' }}>Badges exclusifs</td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>Basiques</td>
                  <td style={{ padding: '12px 10px', color: '#fbbf24' }}>Basiques + Pro 👑</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Formulaire de paiement */}
          <form onSubmit={handleSubscribe} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              💳 Activer mon abonnement (2000 FCFA / mois)
            </h4>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '10px', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Méthode de paiement */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Mode de paiement mobile :
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setMethod('wave')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '2px solid ' + (method === 'wave' ? '#1d4ed8' : 'var(--border-color)'),
                    background: method === 'wave' ? 'rgba(29,78,216,0.1)' : 'rgba(255,255,255,0.02)',
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}
                >
                  🌊 Wave
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('om')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '2px solid ' + (method === 'om' ? '#ea580c' : 'var(--border-color)'),
                    background: method === 'om' ? 'rgba(234,88,12,0.1)' : 'rgba(255,255,255,0.02)',
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}
                >
                  🍊 Orange Money
                </button>
              </div>
            </div>

            {/* Numéro de téléphone */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Numéro de téléphone associé au compte mobile
              </label>
              <input 
                type="text" 
                placeholder="Ex: +221 77 123 45 67" 
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <button 
              type="submit" 
              disabled={isPending} 
              className="btn btn-pro"
              style={{ marginTop: '6px' }}
            >
              {isPending ? 'Initialisation...' : `S'abonner via ${method === 'wave' ? 'Wave' : 'Orange Money'} (2000 FCFA)`}
            </button>
            
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.4' }}>
              Abonnement mensuel récurrent, sans engagement. Résiliation en 1 clic dans ton profil. Facturé de manière sécurisée par UnitechPay.
            </p>
          </form>
        </>
      )}

    </div>
  );
}
