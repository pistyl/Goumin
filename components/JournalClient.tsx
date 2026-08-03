'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createJournalEntryAction } from '@/app/actions';
import { User } from '@/lib/auth';

interface JournalEntry {
  id: string;
  prompt: string;
  content: string;
  mood_score: number;
  created_at: string;
}

interface JournalClientProps {
  user: User;
  entries: JournalEntry[];
  dailyPrompt: string;
}

// Icônes d'expressions faciales vectorielles en SVG pour remplacer les émojis
export const getMoodIconSvg = (score: number, size: number = 20, color: string = 'currentColor') => {
  switch (score) {
    case 1: // Triste / Au plus bas
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M16 17s-1.5-2-4-2-4 2-4 2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      );
    case 2: // Colère
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M16 17s-1.5-2-4-2-4 2-4 2"></path>
          <path d="M8 9l2 1"></path>
          <path d="M16 9l-2 1"></path>
        </svg>
      );
    case 3: // Neutre
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="15" x2="16" y2="15"></line>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      );
    case 4: // En guérison
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
          <path d="M16 5l3 3M19 5l-3 3" opacity="0.6"></path>
        </svg>
      );
    case 5: // Apaisé·e
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 13.5s1.5 2.5 4 2.5 4-2.5 4-2.5"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      );
    default:
      return null;
  }
};

export default function JournalClient({ user, entries, dailyPrompt }: JournalClientProps) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [moodScore, setMoodScore] = useState(3);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPro = user.subscription_tier === 'pro';

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setErrorMessage(null);

    startTransition(async () => {
      const res = await createJournalEntryAction(dailyPrompt, content, moodScore);
      if (res?.error) {
        if (res.error === 'limit_reached') {
          setErrorMessage(res.message || 'Limite atteinte');
        } else {
          setErrorMessage(res.error);
        }
      } else {
        setContent('');
        setMoodScore(3);
        router.refresh();
      }
    });
  };

  const getMoodLabel = (score: number) => {
    switch (score) {
      case 1: return 'Au plus bas';
      case 2: return 'En colère';
      case 3: return 'Neutre';
      case 4: return 'En guérison';
      case 5: return 'Apaisé·e';
      default: return 'Neutre';
    }
  };

  const isOlderThan7Days = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays > 7;
  };

  const chartEntries = [...entries].reverse().slice(-10);
  
  const svgWidth = 400;
  const svgHeight = 150;
  const padding = 25;
  const chartWidth = svgWidth - padding * 2;
  const chartHeight = svgHeight - padding * 2;

  const points = chartEntries.map((entry, idx) => {
    const x = padding + (idx / Math.max(chartEntries.length - 1, 1)) * chartWidth;
    const y = padding + chartHeight - ((entry.mood_score - 1) / 4) * chartHeight;
    return { x, y, score: entry.mood_score, date: new Date(entry.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // Icônes SVG génériques
  const lockIcon = (size: number = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );

  const calendarIcon = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginRight: '5px', verticalAlign: 'middle' }}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
      
      {/* Introduction */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '24px', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span>Journal Intime</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.4' }}>
          Écris ce que tu ressens. Cet espace est 100% privé, personne d'autre ne peut lire tes mots.
        </p>
      </div>

      {/* Formulaire de l'entrée du jour */}
      <form onSubmit={handleSaveEntry} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ background: 'rgba(129, 140, 248, 0.05)', padding: '12px', borderRadius: '10px', borderLeft: '3px solid var(--primary)' }}>
          <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            Pensée du jour
          </span>
          <strong style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.4' }}>
            {dailyPrompt}
          </strong>
        </div>

        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '12px',
            textAlign: 'center'
          }}>
            {errorMessage === 'limit_reached' ? (
              <div>
                <span>{errorMessage}</span>
                <a href="/pro" style={{ color: '#fbbf24', fontWeight: 'bold', marginLeft: '6px', textDecoration: 'underline' }}>Passer en Pro</a>
              </div>
            ) : (
              errorMessage
            )}
          </div>
        )}

        <textarea
          placeholder="Raconte tes pensées ici sans fard..."
          className="input-field"
          style={{ minHeight: '120px', resize: 'none' }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={isPending}
        />

        {/* Sélecteur d'humeur */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Comment te sens-tu ? : <strong style={{ color: 'var(--text-main)' }}>{getMoodLabel(moodScore)}</strong>
          </label>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setMoodScore(score)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: '10px',
                  border: '1px solid ' + (moodScore === score ? 'var(--primary)' : 'var(--border-color)'),
                  background: moodScore === score ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  color: moodScore === score ? 'var(--primary)' : 'var(--text-muted)'
                }}
              >
                {getMoodIconSvg(score, 22)}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={isPending} className="btn btn-primary">
          {isPending ? 'Enregistrement...' : 'Sauvegarder mon entrée'}
        </button>
      </form>

      {/* Statistiques d'humeur (Graphique) */}
      <div className="card">
        <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            Courbe émotionnelle
          </span>
          {!isPro && (
            <span style={{ fontSize: '9px', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>PRO</span>
          )}
        </h4>

        {isPro ? (
          chartEntries.length < 2 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Sauvegarde au moins 2 entrées pour voir l'évolution de ton humeur.
            </div>
          ) : (
            <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
              <svg width={svgWidth} height={svgHeight} style={{ overflow: 'visible' }}>
                {[1, 2, 3, 4, 5].map((level) => {
                  const y = padding + chartHeight - ((level - 1) / 4) * chartHeight;
                  return (
                    <g key={level}>
                      <line 
                        x1={padding} 
                        y1={y} 
                        x2={svgWidth - padding} 
                        y2={y} 
                        stroke="rgba(255,255,255,0.05)" 
                        strokeWidth="1"
                        strokeDasharray="4"
                      />
                      <g style={{ transform: `translate(${padding - 18}px, ${y - 8}px)` }}>
                        {getMoodIconSvg(level, 16, 'var(--text-muted)')}
                      </g>
                    </g>
                  );
                })}

                <polyline
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  points={polylinePoints}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {points.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="5"
                      fill="#0a0915"
                      stroke="var(--primary)"
                      strokeWidth="2.5"
                    />
                    <text
                      x={p.x}
                      y={svgHeight - 4}
                      fill="var(--text-muted)"
                      fontSize="8"
                      textAnchor="middle"
                    >
                      {p.date}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )
        ) : (
          /* Version floutée pour non-abonné (Vitrine Pro) */
          <div style={{ position: 'relative', overflow: 'hidden', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ filter: 'blur(4px)', opacity: 0.2, width: '100%', pointerEvents: 'none', display: 'flex', justifyContent: 'center' }}>
              <svg width={svgWidth} height={svgHeight}>
                <polyline fill="none" stroke="var(--primary)" strokeWidth="3" points="25,125 100,50 175,100 250,30 325,90 375,40" />
                <circle cx="25" cy="125" r="5" fill="var(--primary)" />
                <circle cx="100" cy="50" r="5" fill="var(--primary)" />
                <circle cx="175" cy="100" r="5" fill="var(--primary)" />
                <circle cx="250" cy="30" r="5" fill="var(--primary)" />
                <circle cx="325" cy="90" r="5" fill="var(--primary)" />
                <circle cx="375" cy="40" r="5" fill="var(--primary)" />
              </svg>
            </div>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'rgba(10, 9, 21, 0.6)',
              textAlign: 'center',
              padding: '0 20px'
            }}>
              <span style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>{lockIcon(24)}</span>
              <strong style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px' }}>
                Statistiques de progression émotionnelle
              </strong>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Suis ta guérison jour après jour grâce à un graphique de progression.
              </p>
              <a href="/pro" className="btn btn-pro" style={{ padding: '6px 12px', fontSize: '12px', width: 'auto' }}>
                Activer le Mode Pro
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Historique du journal */}
      <div>
        <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', fontWeight: '700', marginBottom: '10px' }}>
          Historique de tes écrits
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Ton historique est vide. Écris ta première entrée ci-dessus !
            </div>
          ) : (
            entries.map(entry => {
              const locked = !isPro && isOlderThan7Days(entry.created_at);
              const date = new Date(entry.created_at).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });

              return (
                <div 
                  key={entry.id} 
                  className="card"
                  style={{
                    background: locked ? 'rgba(255, 255, 255, 0.01)' : 'var(--bg-card)',
                    borderStyle: locked ? 'dashed' : 'solid',
                    borderColor: locked ? 'rgba(255,255,255,0.04)' : 'var(--border-color)',
                    padding: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize', display: 'flex', alignItems: 'center' }}>
                      {calendarIcon} {date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center' }} title={getMoodLabel(entry.mood_score)}>
                      {getMoodIconSvg(entry.mood_score, 18, 'var(--primary)')}
                    </span>
                  </div>

                  <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-main)', marginBottom: '6px', lineHeight: '1.4' }}>
                    {entry.prompt}
                  </strong>

                  {locked ? (
                    <div style={{
                      background: 'rgba(10, 9, 21, 0.4)',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.02)',
                      textAlign: 'center',
                      marginTop: '6px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        {lockIcon(14)}
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Entrée archivée</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        En mode gratuit, l'historique est limité à 7 jours.
                      </p>
                      <a href="/pro" style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>
                        Débloquer avec le Mode Pro 👑
                      </a>
                    </div>
                  ) : (
                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-glow)', whiteSpace: 'pre-wrap' }}>
                      {entry.content}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
