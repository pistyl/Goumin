'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateStepAction, updateSettingsAction, logoutAction } from '@/app/actions';
import { User } from '@/lib/auth';
import { getMoonIcon } from './AppWrapper';

interface ProfileClientProps {
  user: User;
  stats: {
    postsCount: number;
    commentsCount: number;
    reactionsCount: number;
    journalCount: number;
  };
}

export default function ProfileClient({ user, stats }: ProfileClientProps) {
  const router = useRouter();
  const [trustContact, setTrustContact] = useState(user.trust_contact || '');
  const [isPendingSettings, startTransitionSettings] = useTransition();
  const [isPendingStep, startTransitionStep] = useTransition();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const seniorityDays = Math.max(1, Math.ceil(
    (new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
  ));

  const stepsList = [
    { name: 'Choc', label: 'Le choc et le déni', desc: "Tu as du mal à réaliser. C'est normal, ton cœur se protège. Prends ton temps." },
    { name: 'Colère', label: 'La colère', desc: "Tu ressens de la rancœur, de l'injustice. Exprime-la dans ton journal, ne la garde pas." },
    { name: 'Marchandage', label: 'Le marchandage', desc: "Tu repenses aux scénarios, tu as envie de réécrire l'histoire. C'est l'étape charnière." },
    { name: 'Tristesse', label: 'La tristesse', desc: "La réalité s'impose, les larmes coulent. C'est sain. Le deuil avance." },
    { name: 'Acceptation', label: 'L\'acceptation', desc: "La paix revient petit à petit. Tu penses à l'avenir avec espoir. Tu vas t'en sortir." }
  ];

  const currentStepObj = stepsList.find(s => s.name === user.current_step) || stepsList[0];

  const handleStepChange = (stepName: string) => {
    startTransitionStep(async () => {
      const res = await updateStepAction(stepName);
      if (res?.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    startTransitionSettings(async () => {
      const res = await updateSettingsAction(trustContact);
      if (res?.error) {
        alert(res.error);
      } else {
        setSuccessMsg('Paramètres enregistrés avec succès.');
        setTimeout(() => setSuccessMsg(null), 3000);
        router.refresh();
      }
    });
  };

  const handleLogout = async () => {
    if (confirm('Es-tu sûr·e de vouloir te déconnecter de Goumin ?')) {
      await logoutAction();
      window.location.reload();
    }
  };

  // Badges avec identifiant pour associer des icônes SVG
  const badges = [
    {
      id: 'new_start',
      name: 'Nouveau Départ',
      desc: 'Inscrit·e sur Goumin, prêt·e à guérir.',
      unlocked: true,
      proOnly: false
    },
    {
      id: 'supporter',
      name: 'Soutien Régulier',
      desc: 'A réagi ou commenté au moins 1 publication.',
      unlocked: stats.reactionsCount + stats.commentsCount > 0,
      proOnly: false
    },
    {
      id: 'writer',
      name: 'Parole Intime',
      desc: 'A écrit sa première entrée dans le journal privé.',
      unlocked: stats.journalCount > 0,
      proOnly: false
    },
    {
      id: 'pro_badge',
      name: 'Guerrier Pro',
      desc: 'Membre abonné Pro officiel.',
      unlocked: user.subscription_tier === 'pro',
      proOnly: true
    },
    {
      id: 'mindfulness',
      name: 'Paix Intérieure',
      desc: 'A rédigé au moins 5 entrées dans le journal.',
      unlocked: stats.journalCount >= 5 && user.subscription_tier === 'pro',
      proOnly: true
    }
  ];

  // Rendu des icônes vectorielles SVG pour les badges
  const getBadgeIcon = (id: string, size: number = 24) => {
    switch (id) {
      case 'new_start':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
            <path d="M12 6v6l4 2"></path>
          </svg>
        );
      case 'supporter':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        );
      case 'writer':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
          </svg>
        );
      case 'pro_badge':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"></path>
            <path d="M3 20h18"></path>
          </svg>
        );
      case 'mindfulness':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
        );
      default:
        return null;
    }
  };

  const getLockIcon = (size: number = 24) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
      
      {/* Profil Header */}
      <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(129, 140, 248, 0.08)',
          border: '2px solid var(--primary)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 0 15px var(--primary-glow)'
        }}>
          {getMoonIcon(user.current_step, 36)}
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '20px', fontWeight: '800' }}>
            {user.username}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
            Membre de la famille depuis {seniorityDays} jour{seniorityDays > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Section Étape Lunaire de Guérison */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', fontWeight: '700' }}>
          Parcours émotionnel
        </h4>
        
        {/* Étape courante */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', filter: 'drop-shadow(0 0 4px var(--moon-glow))' }}>
              {getMoonIcon(user.current_step, 24)}
            </span>
            <strong style={{ fontSize: '15px', color: 'var(--primary)' }}>{currentStepObj.label}</strong>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            {currentStepObj.desc}
          </p>
        </div>

        {/* Sélecteur de phase (Mise à jour interactive) */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Où en es-tu dans ton cœur aujourd'hui ? (Clique sur la lune pour mettre à jour)
          </label>
          <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '12px' }}>
            {stepsList.map(step => (
              <button
                key={step.name}
                type="button"
                onClick={() => handleStepChange(step.name)}
                disabled={isPendingStep}
                title={step.label}
                style={{
                  background: user.current_step === step.name ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'background 0.2s ease',
                  boxShadow: user.current_step === step.name ? '0 0 8px var(--moon-glow)' : 'none'
                }}
              >
                {getMoonIcon(step.name, 22)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Badges de reconnaissance */}
      <div className="card">
        <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
          Badges débloqués
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {badges.map(badge => (
            <div 
              key={badge.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '12px',
                background: badge.unlocked 
                  ? (badge.proOnly ? 'rgba(251, 191, 36, 0.05)' : 'rgba(129, 140, 248, 0.03)')
                  : 'rgba(255,255,255,0.01)',
                border: '1px solid ' + (
                  badge.unlocked 
                    ? (badge.proOnly ? 'rgba(251, 191, 36, 0.2)' : 'rgba(129, 140, 248, 0.15)')
                    : 'rgba(255,255,255,0.02)'
                ),
                opacity: badge.unlocked ? 1 : 0.4
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '26px', color: badge.unlocked ? (badge.proOnly ? '#fbbf24' : 'var(--primary)') : 'var(--text-muted)' }}>
                {badge.unlocked ? getBadgeIcon(badge.id, 24) : getLockIcon(24)}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ fontSize: '13px', color: badge.unlocked ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {badge.name}
                  </strong>
                  {badge.proOnly && (
                    <span style={{ fontSize: '9px', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', padding: '1px 4px', borderRadius: '4px', fontWeight: 'bold' }}>PRO</span>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{badge.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paramètres & Config du contact de confiance */}
      <div className="card">
        <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
          Paramètres du compte
        </h4>

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '8px', borderRadius: '8px', fontSize: '12px', textAlign: 'center', marginBottom: '10px' }}>
            ✓ {successMsg}
          </div>
        )}

        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Numéro du Contact de Confiance (pour le mode SOS)
            </label>
            <input 
              type="text" 
              placeholder="Ex: +221771234567" 
              className="input-field"
              style={{ padding: '10px 12px', fontSize: '16px' }}
              value={trustContact}
              onChange={(e) => setTrustContact(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '4px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked />
              <span>Recevoir des notifications de soutien</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked />
              <span>Garder mes statistiques de journal anonymes</span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isPendingSettings} 
            className="btn btn-primary"
            style={{ padding: '10px 12px', fontSize: '13px' }}
          >
            {isPendingSettings ? 'Enregistrement...' : 'Sauvegarder les paramètres'}
          </button>
        </form>

        <button 
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ marginTop: '16px', padding: '8px 12px', fontSize: '13px', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}
        >
          Déconnexion du compte
        </button>
      </div>

    </div>
  );
}
