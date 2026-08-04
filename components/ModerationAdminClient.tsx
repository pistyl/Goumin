'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminResolveReportAction } from '@/app/adminActions';
import { checkSensitiveContent } from '@/lib/moderation';

interface Report {
  id: string;
  reporter_username: string;
  post_id: string | null;
  comment_id: string | null;
  reason: string;
  status: string;
  created_at: string;
  post_content: string | null;
  comment_content: string | null;
  author_username: string;
  author_id: string | null;
  author_previous_reports_count: number;
}

interface ModerationAdminClientProps {
  reports: Report[];
  adminUsername: string;
}

export default function ModerationAdminClient({ reports, adminUsername }: ModerationAdminClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'community' | 'auto_detect'>('community');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [suspensionDays, setSuspensionDays] = useState<number>(7);

  const handleResolve = (
    reportId: string,
    action: 'dismiss' | 'block' | 'warn' | 'suspend' | 'ban',
    days?: number
  ) => {
    let actionLabel = '';
    switch (action) {
      case 'dismiss': actionLabel = 'Ignorer le signalement'; break;
      case 'block': actionLabel = 'Supprimer le contenu'; break;
      case 'warn': actionLabel = 'Avertir l\'utilisateur'; break;
      case 'suspend': actionLabel = `Suspendre l'utilisateur (${days || 7} jours)`; break;
      case 'ban': actionLabel = 'Bannir l\'utilisateur définitivement'; break;
    }

    if (!confirm(`Confirmer l'action : ${actionLabel} ?`)) {
      return;
    }

    startTransition(async () => {
      const res = await adminResolveReportAction(reportId, action, days);
      if (res?.error) {
        alert(res.error);
      } else {
        setSelectedReportId(null);
        router.refresh();
      }
    });
  };

  // Process and sort reports
  const pendingReports = reports.filter(r => r.status === 'pending');
  const processedReports = reports.filter(r => r.status !== 'pending');

  const enhancedPending = pendingReports.map(report => {
    const content = report.post_content || report.comment_content || '';
    const isSensitive = checkSensitiveContent(content) || report.reason.includes('Dépistage');
    return { ...report, isSensitive, content };
  });

  // Sort: sensitive/crisis reports float to the absolute top
  const sortedPending = enhancedPending.sort((a, b) => {
    if (a.isSensitive && !b.isSensitive) return -1;
    if (!a.isSensitive && b.isSensitive) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Separate into Community reports and Auto-Detected reports
  const communityReports = sortedPending.filter(r => !r.reason.includes('Dépistage') && r.reporter_username !== 'Système');
  const autoDetectReports = sortedPending.filter(r => r.reason.includes('Dépistage') || r.reporter_username === 'Système');

  const displayReports = activeTab === 'community' ? communityReports : autoDetectReports;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '28px', fontWeight: '800' }}>File de modération</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px' }}>
            Traite les contenus signalés et assure la sécurité émotionnelle des utilisateurs.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '24px' }}>
        <button
          onClick={() => setActiveTab('community')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'community' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'community' ? '#fff' : 'var(--text-muted)',
            padding: '12px 6px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Signalements Communautaires ({communityReports.length})
        </button>
        <button
          onClick={() => setActiveTab('auto_detect')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'auto_detect' ? '3px solid #ef4444' : '3px solid transparent',
            color: activeTab === 'auto_detect' ? '#fff' : 'var(--text-muted)',
            padding: '12px 6px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Auto-Détection & Détresse ({autoDetectReports.length})
          {autoDetectReports.length > 0 && (
            <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
              CRISE
            </span>
          )}
        </button>
      </div>

      {/* Reports Queue */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {displayReports.length === 0 ? (
          <div className="admin-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px', opacity: 0.3 }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>File de modération vide</h3>
            <p style={{ fontSize: '13.5px' }}>Aucun signalement en attente dans cet onglet.</p>
          </div>
        ) : (
          displayReports.map(report => {
            const isPost = !!report.post_id;
            
            return (
              <div
                key={report.id}
                className="admin-card animate-fade-in"
                style={{
                  borderLeft: report.isSensitive ? '4px solid #ef4444' : '4px solid rgba(255,255,255,0.1)',
                  background: report.isSensitive ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)' : 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                
                {/* Badge alert headers */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: isPost ? 'rgba(249, 115, 22, 0.15)' : 'rgba(96, 165, 250, 0.15)',
                      color: isPost ? '#f97316' : '#60a5fa',
                      fontSize: '10px',
                      fontWeight: '800',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase'
                    }}>
                      {isPost ? 'Publication' : 'Commentaire'}
                    </span>
                    {report.isSensitive && (
                      <span style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        fontSize: '10px',
                        fontWeight: '900',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        🚨 Prioritaire : Mots-clés de Détresse
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Signalé le {new Date(report.created_at).toLocaleString('fr-FR')}
                  </span>
                </div>

                {/* Content grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '30px', flexWrap: 'wrap' }}>
                  
                  {/* Left Column: Content detail */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <p style={{ fontSize: '14.5px', lineHeight: '1.6', color: '#fff', fontStyle: 'italic' }}>
                        "{report.content}"
                      </p>
                    </div>

                    <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Auteur : <strong style={{ color: '#fff' }}>@{report.author_username}</strong>
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Motif : <strong style={{ color: '#fff' }}>{report.reason}</strong>
                      </span>
                      {report.reporter_username !== 'Système' && (
                        <span style={{ color: 'var(--text-muted)' }}>
                          Signalé par : <strong style={{ color: '#fff' }}>@{report.reporter_username}</strong>
                        </span>
                      )}
                    </div>

                    {/* Resources Dispatched alert box (for auto detect) */}
                    {report.isSensitive && (
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.06)',
                        border: '1px solid rgba(16, 185, 129, 0.15)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px'
                      }}>
                        <span style={{ fontSize: '16px' }}>🛡️</span>
                        <div>
                          <strong style={{ fontSize: '12.5px', color: '#34d399', display: 'block' }}>Ressources d'aide transmises automatiquement</strong>
                          <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.4', display: 'block', marginTop: '2px' }}>
                            SMS de détresse envoyé contenant les urgences médicales (1515) et la gendarmerie (17). Suivi humain de modération requis.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Author metrics & Mod actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    
                    {/* User History */}
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Historique de l'auteur
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                        <span>Signalements antérieurs résolus :</span>
                        <strong style={{
                          color: report.author_previous_reports_count > 0 ? '#ef4444' : '#10b981',
                          background: report.author_previous_reports_count > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {report.author_previous_reports_count}
                        </strong>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px' }}>
                      <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Actions Administratives
                      </h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                          onClick={() => handleResolve(report.id, 'dismiss')}
                          disabled={isPending}
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '10px',
                            color: '#f3f4f6',
                            padding: '8px',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          Ignorer
                        </button>
                        <button
                          onClick={() => handleResolve(report.id, 'block')}
                          disabled={isPending}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '10px',
                            color: '#f87171',
                            padding: '8px',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          Supprimer
                        </button>
                      </div>

                      <button
                        onClick={() => handleResolve(report.id, 'warn')}
                        disabled={isPending}
                        style={{
                          background: 'rgba(251, 146, 60, 0.1)',
                          border: '1px solid rgba(251, 146, 60, 0.2)',
                          borderRadius: '10px',
                          color: '#fb923c',
                          padding: '10px',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        ⚠️ Supprimer & Avertir l'auteur
                      </button>

                      {/* Expandable Suspension picker */}
                      {selectedReportId === report.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '10px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Durée de suspension :</span>
                          <select
                            value={suspensionDays}
                            onChange={(e) => setSuspensionDays(parseInt(e.target.value))}
                            style={{ background: '#0f0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px', color: '#fff', fontSize: '12px' }}
                          >
                            <option value={1}>1 Jour</option>
                            <option value={3}>3 Jours</option>
                            <option value={7}>7 Jours</option>
                            <option value={30}>30 Jours</option>
                          </select>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                            <button
                              onClick={() => handleResolve(report.id, 'suspend', suspensionDays)}
                              style={{ flex: 1, background: '#fb923c', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                              Confirmer
                            </button>
                            <button
                              onClick={() => setSelectedReportId(null)}
                              style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '11.5px', cursor: 'pointer' }}
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedReportId(report.id);
                            setSuspensionDays(7);
                          }}
                          disabled={isPending}
                          style={{
                            background: 'rgba(251, 146, 60, 0.15)',
                            border: '1px solid rgba(251, 146, 60, 0.25)',
                            borderRadius: '10px',
                            color: '#fb923c',
                            padding: '10px',
                            fontSize: '12.5px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          ⏳ Supprimer & Suspendre
                        </button>
                      )}

                      <button
                        onClick={() => handleResolve(report.id, 'ban')}
                        disabled={isPending}
                        style={{
                          background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                          border: 'none',
                          borderRadius: '10px',
                          color: '#fff',
                          padding: '10px',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                        }}
                      >
                        ⛔ Supprimer & Bannir définitivement
                      </button>

                    </div>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
