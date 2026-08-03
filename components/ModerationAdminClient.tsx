'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminResolveReportAction } from '@/app/actions';

interface Report {
  id: string;
  reporter_username: string | null;
  post_id: string | null;
  comment_id: string | null;
  reason: string;
  status: string;
  created_at: string;
  post_content: string | null;
  comment_content: string | null;
  author_username: string | null;
}

interface ModerationAdminClientProps {
  reports: Report[];
}

export default function ModerationAdminClient({ reports }: ModerationAdminClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleResolve = (reportId: string, action: 'approve' | 'block') => {
    if (!confirm(`Confirmer l'action : ${action === 'approve' ? 'Approuver le contenu' : 'Bloquer le contenu'} ?`)) {
      return;
    }

    startTransition(async () => {
      const res = await adminResolveReportAction(reportId, action);
      if (res?.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    });
  };

  const pendingReports = reports.filter(r => r.status === 'pending');
  const processedReports = reports.filter(r => r.status !== 'pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
      
      <div>
        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>File de modération</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          Examine les publications et commentaires signalés par la communauté ou détectés automatiquement.
        </p>
      </div>

      {/* Signalements en attente */}
      <div>
        <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          En attente de traitement ({pendingReports.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {pendingReports.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 10px auto', opacity: 0.4 }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Aucun contenu à modérer. La communauté se porte bien !
            </div>
          ) : (
            pendingReports.map(report => {
              const isPost = !!report.post_id;
              const content = isPost ? report.post_content : report.comment_content;
              const typeLabel = isPost ? 'PUBLICATION' : 'COMMENTAIRE';

              return (
                <div 
                  key={report.id} 
                  className="card"
                  style={{
                    borderLeft: '4px solid #ef4444',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {/* Metadata */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontWeight: 'bold', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '2px 6px', borderRadius: '4px' }}>
                      {typeLabel}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Signalé par : <strong>{report.reporter_username || 'Système'}</strong>
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Date : {new Date(report.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Motif */}
                  <div style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.1)',
                    fontSize: '12px',
                    lineHeight: '1.4'
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginRight: '4px', verticalAlign: 'middle' }}>
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    </svg>
                    <strong>Motif :</strong> {report.reason}
                  </div>

                  {/* Contenu signalé */}
                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Auteur : 
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', margin: '0 4px', verticalAlign: 'middle' }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      {report.author_username || 'Anonyme'}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-main)', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                      "{content}"
                    </p>
                  </div>

                  {/* Actions de modération */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button
                      onClick={() => handleResolve(report.id, 'approve')}
                      disabled={isPending}
                      className="btn"
                      style={{
                        flex: 1,
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid var(--sos-primary)',
                        color: 'var(--sos-primary)',
                        padding: '8px',
                        fontSize: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Approuver</span>
                    </button>
                    <button
                      onClick={() => handleResolve(report.id, 'block')}
                      disabled={isPending}
                      className="btn"
                      style={{
                        flex: 1,
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                        color: '#f87171',
                        padding: '8px',
                        fontSize: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                      </svg>
                      <span>Bloquer</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Historique des signalements traités */}
      <div style={{ marginTop: '10px' }}>
        <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Signalements résolus ({processedReports.length})
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {processedReports.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '16px' }}>Aucun signalement résolu pour l'instant.</p>
          ) : (
            processedReports.map(report => (
              <div 
                key={report.id} 
                className="card"
                style={{
                  padding: '10px 12px',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.01)',
                  opacity: 0.6
                }}
              >
                <div>
                  <strong style={{ color: report.status === 'resolved' ? '#ef4444' : 'var(--sos-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {report.status === 'resolved' ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                        </svg>
                        <span>Bloqué</span>
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Classé sans suite</span>
                      </>
                    )}
                  </strong>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '10px' }}>
                    Auteur : {report.author_username || 'Anonyme'}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  ID : {report.id.substring(0, 8)}...
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
