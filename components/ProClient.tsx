'use client';

import React, { useState, useTransition } from 'react';
import { subscribeProAction } from '@/app/actions';
import { User } from '@/lib/auth';

interface ProClientProps {
  user: User;
}

// Icônes SVG modernes
const CrownIcon = ({ className, size = 56 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={{ color: '#fbbf24' }}
  >
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z" />
    <path d="M5 20h14" />
  </svg>
);

const BookOpenIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fbbf24' }}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const ChartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fbbf24' }}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const LockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fbbf24' }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fbbf24' }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const WaveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#60a5fa' }}>
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
  </svg>
);

const OrangeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fb923c' }}>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fbbf24', margin: '0 auto 14px' }}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z" />
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />
  </svg>
);

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
        window.location.href = res.paymentUrl;
      }
    });
  };

  const proFeatures = [
    {
      icon: <BookOpenIcon />,
      title: 'Journal intime illimité',
      desc: 'Écris toutes tes pensées sans restriction. Version gratuite limitée à 1 par jour.',
    },
    {
      icon: <ChartIcon />,
      title: "Statistiques & Suivi d'humeur",
      desc: "Accède à des graphiques détaillés pour suivre ta guérison émotionnelle jour après jour.",
    },
    {
      icon: <LockIcon />,
      title: 'Création de cercles privés',
      desc: 'Partage et entraide-toi dans des bulles intimes réservées uniquement aux membres invités.',
    },
    {
      icon: <ShieldIcon />,
      title: 'Badge officiel Pro',
      desc: 'Affiche fièrement ton statut doré à côté de ton pseudo sur toute la plateforme.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px', paddingBottom: '40px' }}>
      
      {/* Styles CSS Injectés pour les animations et interactions fluides */}
      <style>{`
        @keyframes crownPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.4)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 25px rgba(251, 191, 36, 0.75)); }
        }
        @keyframes pageSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .crown-animate {
          animation: crownPulse 3.5s infinite ease-in-out;
        }
        .pro-container {
          animation: pageSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .feature-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 20px;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .feature-card:hover {
          transform: translateY(-3px);
          background: rgba(251, 191, 36, 0.025);
          border-color: rgba(251, 191, 36, 0.25);
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
        }
        .payment-tab {
          flex: 1;
          padding: 16px 12px;
          border-radius: 16px;
          border: 2px solid transparent;
          background: rgba(255, 255, 255, 0.02);
          color: rgba(255, 255, 255, 0.7);
          font-weight: 700;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          transition: all 0.25s ease;
        }
        .payment-tab.wave.active {
          border-color: #4f46e5;
          background: rgba(79, 70, 229, 0.08);
          color: #fff;
          box-shadow: 0 0 15px rgba(79, 70, 229, 0.25);
        }
        .payment-tab.om.active {
          border-color: #ea580c;
          background: rgba(234, 88, 12, 0.08);
          color: #fff;
          box-shadow: 0 0 15px rgba(234, 88, 12, 0.25);
        }
        .payment-tab:hover:not(.active) {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }
        .pro-btn {
          background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
          color: #07060f !important;
          font-weight: 800;
          padding: 16px;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          font-size: 15px;
          transition: all 0.25s ease;
          box-shadow: 0 8px 24px rgba(217, 119, 6, 0.35);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
        }
        .pro-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(217, 119, 6, 0.5);
          filter: brightness(1.05);
        }
        .pro-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .pro-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div className="pro-container" style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
        
        {/* Header Premium */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div className="crown-animate" style={{ display: 'inline-block' }}>
            <CrownIcon size={64} />
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-title)', 
            fontSize: '32px', 
            fontWeight: '900', 
            background: 'linear-gradient(135deg, #ffe082 0%, #fbbf24 50%, #d97706 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            Goumin Pro
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '380px', margin: '0 auto', lineHeight: '1.5' }}>
            Soutiens le projet et débloque les meilleurs outils pour avancer sereinement dans ta reconstruction émotionnelle.
          </p>
        </div>

        {isPro ? (
          /* Écran Pro Actif */
          <div className="card animate-fade-in" style={{ 
            border: '1px solid rgba(251, 191, 36, 0.3)', 
            background: 'radial-gradient(circle at top right, rgba(251,191,36,0.06) 0%, rgba(255,255,255,0.01) 100%)', 
            textAlign: 'center', 
            padding: '36px 20px',
            borderRadius: '24px',
            boxShadow: '0 15px 40px rgba(0,0,0,0.5)'
          }}>
            <SparklesIcon />
            <strong style={{ fontSize: '20px', color: '#fbbf24', display: 'block', marginBottom: '10px', fontFamily: 'var(--font-title)' }}>
              Accès Pro Activé !
            </strong>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '340px', margin: '0 auto' }}>
              Tu es désormais un membre pilier de la communauté Goumin. Profite de tous tes avantages illimités et merci pour ta générosité. 💛
            </p>
          </div>
        ) : (
          /* Liste des Fonctionnalités & Formulaire d'abonnement */
          <>
            {/* Liste des Avantages moderne */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {proFeatures.map((feat, idx) => (
                <div key={idx} className="feature-card animate-fade-in" style={{ animationDelay: `${idx * 0.08}s` }}>
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.04)', 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '14px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {feat.icon}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>{feat.title}</h4>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Formulaire de Paiement Intuitif */}
            <form onSubmit={handleSubscribe} className="card animate-fade-in" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '18px', 
              borderRadius: '24px', 
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.00) 100%)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Abonnement Mensuel
                </span>
                <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: '800', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  Activer Goumin Pro
                  <span style={{ fontSize: '15px', color: '#fbbf24', fontWeight: '900' }}>2000 FCFA <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ mois</span></span>
                </h4>
              </div>

              {error && (
                <div style={{ 
                  background: 'rgba(239, 68, 68, 0.08)', 
                  border: '1px solid rgba(239, 68, 68, 0.2)', 
                  color: '#f87171', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  fontSize: '13px', 
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Sélecteur de méthode de paiement visuel */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>
                  Opérateur Mobile Money :
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setMethod('wave')}
                    className={`payment-tab wave ${method === 'wave' ? 'active' : ''}`}
                  >
                    <WaveIcon />
                    Wave
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('om')}
                    className={`payment-tab om ${method === 'om' ? 'active' : ''}`}
                  >
                    <OrangeIcon />
                    Orange Money
                  </button>
                </div>
              </div>

              {/* Champ numéro de téléphone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                  Numéro de téléphone associé au compte :
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: +221 77 123 45 67" 
                  className="input-field"
                  style={{ borderRadius: '14px', padding: '12px 16px', fontSize: '16px' }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>

              <button 
                type="submit" 
                disabled={isPending} 
                className="pro-btn"
                style={{ marginTop: '6px' }}
              >
                {isPending ? (
                  <>
                    <span style={{ 
                      width: '18px', 
                      height: '18px', 
                      border: '2.5px solid rgba(7,6,15,0.2)', 
                      borderTopColor: '#07060f', 
                      borderRadius: '50%', 
                      display: 'inline-block',
                      animation: 'pulse-sos 1s infinite linear' // reuse pulse animation as a loader
                    }} />
                    Initialisation...
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCardIcon />
                    <span>S'abonner via {method === 'wave' ? 'Wave' : 'Orange Money'}</span>
                  </div>
                )}
              </button>
              
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.5' }}>
                Abonnement sans engagement. Résiliable en 1 clic dans ton profil. Transaction sécurisée cryptée par UnitechPay.
              </p>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
