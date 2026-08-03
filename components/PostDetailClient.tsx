'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createCommentAction, toggleReactionAction, toggleCommentPassedHereAction, reportContentAction } from '@/app/actions';
import { User } from '@/lib/auth';

interface Comment {
  id: string;
  post_id: string;
  user_id: string | null;
  content: string;
  is_passed_here: boolean;
  status: string;
  created_at: string;
  username: string | null;
  subscription_tier: string | null;
}

interface Post {
  id: string;
  circle_id: string;
  user_id: string | null;
  content: string;
  is_anonym: boolean;
  status: string;
  created_at: string;
  username: string | null;
  subscription_tier: string | null;
  comment_count: number;
  reaction_count: number;
  user_reacted: boolean;
}

interface PostDetailClientProps {
  user: User;
  post: Post;
  comments: Comment[];
}

export default function PostDetailClient({ user, post, comments }: PostDetailClientProps) {
  const router = useRouter();
  const [commentContent, setCommentContent] = useState('');
  const [isPending, startTransition] = useTransition();

  // État de crise / modération auto
  const [crisisAlert, setCrisisAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    contacts: { name: string; value: string }[];
    trustContact: string | null;
  } | null>(null);

  // Signalement
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    startTransition(async () => {
      const res = await createCommentAction(post.id, commentContent);
      if (res?.error) {
        alert(res.error);
      } else if (res?.sensitive) {
        setCrisisAlert({
          show: true,
          title: res.resources.title,
          message: res.resources.message,
          contacts: res.resources.contacts,
          trustContact: res.trustContact
        });
        setCommentContent('');
      } else {
        setCommentContent('');
        router.refresh();
      }
    });
  };

  const handleReactPost = () => {
    startTransition(async () => {
      await toggleReactionAction(post.id);
      router.refresh();
    });
  };

  const handleTogglePassedHere = (commentId: string) => {
    startTransition(async () => {
      await toggleCommentPassedHereAction(commentId, post.id);
      router.refresh();
    });
  };

  const handleReportComment = (commentId: string) => {
    if (!reportReason.trim()) return;
    startTransition(async () => {
      const res = await reportContentAction(null, commentId, reportReason);
      if (res.success) {
        alert('Merci pour ton signalement. Ce commentaire va être examiné par la modération.');
        setReportingCommentId(null);
        setReportReason('');
      } else {
        alert(res.error || 'Erreur lors du signalement.');
      }
    });
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      
      {/* Alerte de crise */}
      {crisisAlert && crisisAlert.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(3, 2, 6, 0.95)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '440px',
            width: '100%',
            background: 'var(--sos-bg)',
            border: '2px solid var(--sos-primary)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(16, 185, 129, 0.25)',
            textAlign: 'center'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--sos-primary)" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 12px auto' }}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
            </svg>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '22px', fontWeight: 'bold', color: 'var(--sos-primary)', marginBottom: '12px' }}>
              {crisisAlert.title}
            </h3>
            <p style={{ color: 'var(--sos-text)', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
              {crisisAlert.message}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', marginBottom: '24px' }}>
              {crisisAlert.contacts.map((contact, i) => (
                <div key={i} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--sos-text-muted)', fontWeight: 'bold' }}>{contact.name}</div>
                  <div style={{ fontSize: '15px', color: '#fff', fontWeight: 'bold', marginTop: '2px' }}>{contact.value}</div>
                </div>
              ))}
              {crisisAlert.trustContact && (
                <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(251, 113, 133, 0.08)', border: '1px solid rgba(251, 113, 133, 0.15)' }}>
                  <div style={{ fontSize: '12px', color: '#fda4af', fontWeight: 'bold' }}>Ton Contact de Confiance</div>
                  <div style={{ fontSize: '15px', color: '#fff', fontWeight: 'bold', marginTop: '2px' }}>
                    <a href={`tel:${crisisAlert.trustContact}`} style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
                      </svg>
                      Appeler : {crisisAlert.trustContact}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <button 
              className="btn" 
              style={{ background: 'var(--sos-primary)', color: '#fff' }}
              onClick={() => setCrisisAlert(null)}
            >
              Fermer & respirer
            </button>
          </div>
        </div>
      )}

      {/* Bouton de retour */}
      <button 
        onClick={() => router.push('/')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '13px',
          cursor: 'pointer',
          alignSelf: 'flex-start',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 0'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Retour aux cercles</span>
      </button>

      {/* Contenu de la publication principale */}
      <div className="card" style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--primary)', background: 'rgba(255,255,255,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '13px', fontWeight: 'bold', color: post.is_anonym ? 'var(--text-muted)' : 'var(--primary)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginRight: '4px' }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            {post.is_anonym ? 'Anonyme' : post.username}
          </span>
          {!post.is_anonym && post.subscription_tier === 'pro' && (
            <span style={{ fontSize: '10px', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: '#000', padding: '1px 4px', borderRadius: '4px', fontWeight: 'bold' }}>PRO</span>
          )}
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• {formatTimeAgo(post.created_at)}</span>
        </div>

        <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text-main)', whiteSpace: 'pre-wrap', marginBottom: '14px' }}>
          {post.content}
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleReactPost}
            title="Passé·e par là"
            style={{
              background: post.user_reacted ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
              border: '1px solid ' + (post.user_reacted ? 'var(--secondary)' : 'var(--border-color)'),
              color: post.user_reacted ? 'var(--secondary)' : 'var(--text-muted)',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: post.user_reacted ? '600' : '400'
            }}
          >
            {post.user_reacted ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--secondary)" stroke="var(--secondary)" strokeWidth="2">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
              </svg>
            )}
            <span>{post.reaction_count}</span>
          </button>
        </div>
      </div>

      {/* Titre Commentaires */}
      <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', fontWeight: '700', margin: '4px 0' }}>
        Échanges ({comments.length})
      </h4>

      {/* Liste des commentaires */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
            Aucun échange pour le moment. Laisse un mot chaleureux pour l'aider.
          </div>
        ) : (
          comments.map(comment => {
            const isCommentReporting = reportingCommentId === comment.id;

            return (
              <div 
                key={comment.id} 
                className="card"
                style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  borderColor: comment.is_passed_here ? 'rgba(236, 72, 153, 0.3)' : 'var(--border-color)',
                  padding: '12px',
                  borderRadius: '12px',
                  marginLeft: '12px',
                  position: 'relative'
                }}
              >
                {/* Header commentaire */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginRight: '4px' }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      {comment.username}
                    </span>
                    {comment.subscription_tier === 'pro' && (
                      <span style={{ fontSize: '8px', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: '#000', padding: '1px 3px', borderRadius: '3px', fontWeight: 'bold' }}>PRO</span>
                    )}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatTimeAgo(comment.created_at)}</span>
                  </div>

                  {/* Bouton "Passé·e par là" spécifique sur commentaire */}
                  <button 
                    onClick={() => handleTogglePassedHere(comment.id)}
                    style={{
                      background: comment.is_passed_here ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
                      border: '1px solid ' + (comment.is_passed_here ? 'var(--secondary)' : 'rgba(255,255,255,0.05)'),
                      color: comment.is_passed_here ? 'var(--secondary)' : 'var(--text-muted)',
                      borderRadius: '12px',
                      padding: '2px 8px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                    </svg>
                    <span>Passé·e par là</span>
                  </button>
                </div>

                {/* Contenu commentaire */}
                <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-main)' }}>
                  {comment.content}
                </p>

                {/* Signalement commentaire */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button 
                    onClick={() => setReportingCommentId(reportingCommentId === comment.id ? null : comment.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(239, 68, 68, 0.5)',
                      fontSize: '10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    </svg>
                    <span>Signaler</span>
                  </button>
                </div>

                {/* Formulaire signalement commentaire */}
                {isCommentReporting && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    marginTop: '6px'
                  }}>
                    <input 
                      type="text" 
                      placeholder="Raison du signalement..." 
                      className="input-field"
                      style={{ padding: '6px', fontSize: '11px' }}
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn" 
                        style={{ padding: '4px 8px', fontSize: '10px', background: 'transparent', color: 'var(--text-muted)' }}
                        onClick={() => setReportingCommentId(null)}
                      >
                        Annuler
                      </button>
                      <button 
                        className="btn" 
                        style={{ padding: '4px 8px', fontSize: '10px', background: '#ef4444', color: '#fff', width: 'auto' }}
                        onClick={() => handleReportComment(comment.id)}
                      >
                        Signaler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Composer de message en bas d'écran (Sticky / Message Bar) */}
      <div style={{
        position: 'fixed',
        bottom: '68px', /* Juste au dessus de la bottom nav */
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(10, 9, 21, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid var(--border-color)',
        padding: '10px 16px',
        zIndex: 90,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)'
      }}>
        <form onSubmit={handleCreateComment} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Écris un message de soutien..." 
            className="input-field"
            style={{ borderRadius: '24px', padding: '10px 16px', fontSize: '13px' }}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            required
            disabled={isPending}
          />
          <button 
            type="submit" 
            disabled={isPending || !commentContent.trim()}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
              color: 'white',
              border: 'none',
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {isPending ? '...' : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(45deg) translate(-2px, 2px)' }}>
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
