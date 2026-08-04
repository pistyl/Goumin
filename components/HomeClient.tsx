'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createPostAction, toggleReactionAction, createPrivateCircleAction, reportContentAction } from '@/app/actions';
import { User } from '@/lib/auth';

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

interface Circle {
  id: string;
  name: string;
  description: string;
}

interface HomeClientProps {
  user: User;
  circles: Circle[];
  posts: Post[];
}

export default function HomeClient({ user, circles, posts }: HomeClientProps) {
  const router = useRouter();
  const [activeCircle, setActiveCircle] = useState<string>('all');
  const [postContent, setPostContent] = useState('');
  const [isAnonym, setIsAnonym] = useState(false);
  const [targetCircle, setTargetCircle] = useState(circles[0]?.id || '');
  const [isPending, startTransition] = useTransition();

  // État de modération / alerte
  const [crisisAlert, setCrisisAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    contacts: { name: string; value: string }[];
    trustContact: string | null;
  } | null>(null);

  // Signalement
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  // Partage
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Création de cercle privé (Pro)
  const [showCreateCircle, setShowCreateCircle] = useState(false);
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleDesc, setNewCircleDesc] = useState('');
  const [circleError, setCircleError] = useState<string | null>(null);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    startTransition(async () => {
      const res = await createPostAction(targetCircle, postContent, isAnonym);
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
        setPostContent('');
      } else {
        setPostContent('');
        setIsAnonym(false);
        router.refresh();
      }
    });
  };

  const handleReact = (postId: string) => {
    startTransition(async () => {
      await toggleReactionAction(postId);
      router.refresh();
    });
  };

  const handleReport = (postId: string) => {
    if (!reportReason.trim()) return;
    startTransition(async () => {
      const res = await reportContentAction(postId, null, reportReason);
      if (res.success) {
        alert('Merci pour ton signalement. Notre équipe de modération va examiner cette publication sous 24h.');
        setReportingPostId(null);
        setReportReason('');
      } else {
        alert(res.error || 'Erreur lors du signalement.');
      }
    });
  };

  const handleShare = async (postId: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    const shareData = {
      title: 'Goumin',
      text: 'Découvre cette publication sur Goumin, l\'espace d\'entraide et soutien deuil amoureux',
      url: shareUrl
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Erreur lors du partage :', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setToastMessage('Lien de la publication copié !');
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err) {
        console.error('Erreur de copie dans le presse-papier :', err);
      }
    }
  };

  const handleCreateCircle = (e: React.FormEvent) => {
    e.preventDefault();
    setCircleError(null);

    startTransition(async () => {
      const res = await createPrivateCircleAction(newCircleName, newCircleDesc);
      if (res?.error) {
        setCircleError(res.error);
      } else {
        setShowCreateCircle(false);
        setNewCircleName('');
        setNewCircleDesc('');
        router.refresh();
      }
    });
  };

  // Filtrer les posts
  const filteredPosts = activeCircle === 'all' 
    ? posts 
    : posts.filter(post => post.circle_id === activeCircle);

  // Formater la date
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    return `Il y a ${diffDays} j`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Alerte de crise / modération automatique */}
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
              Fermer & respirer un coup
            </button>
          </div>
        </div>
      )}

      {/* Bannière d'accueil chaleureuse */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(129,140,248,0.08) 0%, rgba(236,72,153,0.04) 100%)',
        border: '1px solid var(--border-color)',
        padding: '16px'
      }}>
        <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: '700', marginBottom: '4px', lineHeight: '1.3' }}>
          Y a quoi dans ton cœur <span style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
            aujourd'hui ?
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '6px', color: '#f43f5e', flexShrink: 0 }}>
              <path d="M12 5c-1.7-2.7-5.5-2.7-7.3 0C3 7.7 3 12 7.5 16.5L12 21l4.5-4.5C21 12 21 7.7 19.3 5c-1.8-2.7-5.6-2.7-7.3 0z" />
              <path d="M12 5l-1 4 2 3-2 3 1 3" />
            </svg>
          </span>
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Ici c'est la famille, on parle de notre goumin sans honte. Dis-nous comment tu te sens ou réagis aux publications pour dire aux autres : « Je suis passé·e par là ».
        </p>
      </div>

      {/* Formulaire de publication */}
      <form onSubmit={handleCreatePost} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea 
          placeholder="Dépose ton goumin ici... Parle avec ton cœur (ex. en nouchi ou en français)..."
          className="input-field"
          style={{ minHeight: '90px', resize: 'none' }}
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          required
        />
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cercle :</label>
            <select 
              className="input-field custom-select" 
              style={{ width: 'auto', padding: '6px 32px 6px 12px', fontSize: '16px', borderRadius: '10px' }}
              value={targetCircle}
              onChange={(e) => setTargetCircle(e.target.value)}
            >
              {circles.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={isAnonym}
              onChange={(e) => setIsAnonym(e.target.checked)}
            />
            <span>Publier anonymement</span>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={isPending || !postContent.trim()} 
          className="btn btn-primary"
          style={{ padding: '10px 16px', fontSize: '14px' }}
        >
          {isPending ? 'Publication...' : 'Publier dans le cercle'}
        </button>
      </form>

      {/* Barre de filtrage des Cercles */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', fontWeight: '700' }}>Exploration des cercles</h4>
          
          {/* Création de cercle privé (Pro / Showcase Simple) */}
          {user.subscription_tier === 'pro' ? (
            <button 
              onClick={() => setShowCreateCircle(!showCreateCircle)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {showCreateCircle ? 'Fermer' : '+ Créer un cercle privé'}
            </button>
          ) : (
            <a 
              href="/pro" 
              style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              🔒 Créer un cercle privé (Pro)
            </a>
          )}
        </div>

        {/* Formulaire Cercle Privé (Pro uniquement) */}
        {showCreateCircle && user.subscription_tier === 'pro' && (
          <form onSubmit={handleCreateCircle} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px', background: 'rgba(129, 140, 248, 0.03)' }}>
            <h5 style={{ fontSize: '13px', fontWeight: 'bold' }}>Nouveau cercle privé d'entraide</h5>
            {circleError && <div style={{ color: '#f87171', fontSize: '12px' }}>{circleError}</div>}
            <input 
              type="text" 
              placeholder="Nom du cercle (ex: Relation toxique, L'oublier)" 
              className="input-field" 
              style={{ padding: '8px 12px', fontSize: '16px' }}
              value={newCircleName}
              onChange={(e) => setNewCircleName(e.target.value)}
              required
            />
            <input 
              type="text" 
              placeholder="Description courte..." 
              className="input-field" 
              style={{ padding: '8px 12px', fontSize: '16px' }}
              value={newCircleDesc}
              onChange={(e) => setNewCircleDesc(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px', fontSize: '12px' }}>
              Créer le cercle
            </button>
          </form>
        )}

        {/* Pilules de filtres */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'none' }}>
          <button 
            onClick={() => setActiveCircle('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid ' + (activeCircle === 'all' ? 'var(--primary)' : 'var(--border-color)'),
              background: activeCircle === 'all' ? 'rgba(129,140,248,0.1)' : 'transparent',
              color: activeCircle === 'all' ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            🌟 Tout voir
          </button>
          {circles.map(c => (
            <button 
              key={c.id}
              onClick={() => setActiveCircle(c.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid ' + (activeCircle === c.id ? 'var(--primary)' : 'var(--border-color)'),
                background: activeCircle === c.id ? 'rgba(129,140,248,0.1)' : 'transparent',
                color: activeCircle === c.id ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Fil de publications */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 10px auto', opacity: 0.4 }}>
              <path d="M2 22c1.25-3.87 3.96-6.99 7.42-8.57L12 12l2.58 1.43c3.46 1.58 6.17 4.7 7.42 8.57H2z"></path>
              <path d="M12 2v10"></path>
            </svg>
            <p style={{ marginTop: '10px', fontSize: '14px' }}>Aucune publication dans ce cercle pour le moment. Sois le premier à t'exprimer !</p>
          </div>
        ) : (
          filteredPosts.map(post => {
            const isPostReporting = reportingPostId === post.id;
            const circle = circles.find(c => c.id === post.circle_id);

            return (
              <div key={post.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Header du post */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

                  {circle && (
                    <span style={{
                      fontSize: '11px',
                      color: 'var(--primary)',
                      background: 'rgba(129, 140, 248, 0.06)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      border: '1px solid rgba(129, 140, 248, 0.1)'
                    }}>
                      {circle.name}
                    </span>
                  )}
                </div>

                {/* Contenu */}
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </p>

                {/* Actions (Réaction, Commentaires, Signalement) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px' }}>
                  
                  {/* Réaction principale "Passé·e par là" */}
                  <button 
                    onClick={() => handleReact(post.id)}
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
                      transition: 'all 0.2s ease',
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

                  {/* Commentaires */}
                  <a 
                    href={`/post/${post.id}`}
                    onClick={(e) => { e.preventDefault(); router.push(`/post/${post.id}`); }}
                    title="Commentaires"
                    style={{
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      fontSize: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>{post.comment_count}</span>
                  </a>

                  {/* Partager */}
                  <button 
                    onClick={() => handleShare(post.id)}
                    title="Partager"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                      <polyline points="16 6 12 2 8 6"></polyline>
                      <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(80px + env(safe-area-inset-bottom))',
          left: 0,
          right: 0,
          margin: '0 auto',
          width: 'max-content',
          background: 'rgba(17, 24, 39, 0.95)',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '24px',
          border: '1px solid var(--border-color)',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
