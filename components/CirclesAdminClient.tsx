'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminManageCircleAction, adminPinPostAction } from '@/app/adminActions';

interface Circle {
  id: string;
  name: string;
  description: string;
  emoji: string;
  display_order: number;
  members_count: number;
  posts_7d: number;
  posts_30d: number;
  reports_count: number;
}

interface Post {
  id: string;
  circle_id: string;
  content: string;
  is_pinned: boolean;
  username: string;
  created_at: string;
}

interface CirclesAdminClientProps {
  initialCircles: Circle[];
  posts: Post[];
}

export default function CirclesAdminClient({ initialCircles, posts }: CirclesAdminClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form states
  const [circleId, setCircleId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('💬');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  
  // Filtering posts by circle
  const [selectedCircleFilter, setSelectedCircleFilter] = useState<string>('all');

  const resetForm = () => {
    setCircleId('');
    setName('');
    setDescription('');
    setEmoji('💬');
    setDisplayOrder(0);
    setFormMode('create');
  };

  const handleEditClick = (circle: Circle) => {
    setCircleId(circle.id);
    setName(circle.name);
    setDescription(circle.description);
    setEmoji(circle.emoji);
    setDisplayOrder(circle.display_order);
    setFormMode('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await adminManageCircleAction(
        circleId,
        name,
        description,
        emoji,
        displayOrder,
        formMode === 'create' ? 'create' : 'update'
      );
      if (res?.error) {
        alert(res.error);
      } else {
        alert(formMode === 'create' ? 'Cercle créé avec succès.' : 'Cercle mis à jour.');
        resetForm();
        router.refresh();
      }
    });
  };

  const handleArchive = (id: string) => {
    if (!confirm('Voulez-vous vraiment archiver ce cercle ?')) return;

    startTransition(async () => {
      const res = await adminManageCircleAction(id, '', '', '', 0, 'archive');
      if (res?.error) {
        alert(res.error);
      } else {
        alert('Cercle archivé avec succès.');
        router.refresh();
      }
    });
  };

  const handleTogglePin = (postId: string, currentPinStatus: boolean) => {
    startTransition(async () => {
      const res = await adminPinPostAction(postId, !currentPinStatus);
      if (res?.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    });
  };

  const filteredPosts = selectedCircleFilter === 'all' 
    ? posts 
    : posts.filter(p => p.circle_id === selectedCircleFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '28px', fontWeight: '800' }}>Gestion des cercles</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px' }}>
          Gère les thématiques communautaires et mets en avant (épingle) les messages importants.
        </p>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Side: Circles list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="admin-card">
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Cercles Actifs</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {initialCircles.map(circle => (
                <div 
                  key={circle.id} 
                  style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: 1, minWidth: '240px' }}>
                    <div style={{ fontSize: '24px', width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {circle.emoji}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>
                        {circle.name}
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginLeft: '8px' }}>
                          (ordre: {circle.display_order})
                        </span>
                      </h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.4', marginTop: '2px' }}>
                        {circle.description}
                      </p>
                    </div>
                  </div>

                  {/* Circle Stats */}
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', textAlign: 'center' }}>
                    <div>
                      <strong style={{ color: '#fff', display: 'block' }}>{circle.members_count}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Membres</span>
                    </div>
                    <div>
                      <strong style={{ color: '#fff', display: 'block' }}>{circle.posts_30d}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Posts (30j)</span>
                    </div>
                    <div>
                      <strong style={{ color: circle.reports_count > 0 ? '#ef4444' : '#10b981', display: 'block' }}>
                        {circle.reports_count}
                      </strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Signaux</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEditClick(circle)}
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleArchive(circle.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '6px 12px', borderRadius: '8px', color: '#ef4444', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Archiver
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Create/Edit Form */}
        <div className="admin-card">
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>
            {formMode === 'create' ? 'Nouveau Cercle' : 'Modifier le Cercle'}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Emoji / Icône :</label>
              <input 
                type="text" 
                value={emoji} 
                onChange={(e) => setEmoji(e.target.value)} 
                required
                className="admin-input" 
                style={{ fontSize: '20px', width: '60px', textAlign: 'center' }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Nom :</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required
                placeholder="ex. Rupture récente"
                className="admin-input" 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Description :</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required
                placeholder="Description du cercle..."
                className="admin-input" 
                style={{ minHeight: '80px', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Ordre d'affichage :</label>
              <input 
                type="number" 
                value={displayOrder} 
                onChange={(e) => setDisplayOrder(parseInt(e.target.value))} 
                required
                className="admin-input" 
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="admin-btn" style={{ flex: 1, justifyContent: 'center' }} disabled={isPending}>
                {formMode === 'create' ? 'Créer le cercle' : 'Enregistrer'}
              </button>
              {formMode === 'edit' && (
                <button type="button" onClick={resetForm} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 16px', fontSize: '13.5px', cursor: 'pointer' }}>
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

      </div>

      {/* Pin posts section */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: '800' }}>Gestion des messages épinglés</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', marginTop: '2px' }}>
              Épingle les publications importantes (ex: message de bienvenue ou institutionnel) en tête de fil.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Filtrer par cercle :</span>
            <select
              value={selectedCircleFilter}
              onChange={(e) => setSelectedCircleFilter(e.target.value)}
              style={{ background: '#0f0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
            >
              <option value="all">Tous les cercles</option>
              {initialCircles.map(c => (
                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Aucun message approuvé disponible dans ce cercle pour l'épinglage.
            </div>
          ) : (
            filteredPosts.map(post => (
              <div 
                key={post.id}
                style={{
                  background: 'rgba(255,255,255,0.01)',
                  border: post.is_pinned ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '20px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>@{post.username}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(post.created_at).toLocaleString('fr-FR')}</span>
                    {post.is_pinned && (
                      <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                        📌 Épinglé
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-main)', fontStyle: 'italic' }}>
                    "{post.content}"
                  </p>
                </div>

                <button
                  onClick={() => handleTogglePin(post.id, post.is_pinned)}
                  disabled={isPending}
                  style={{
                    background: post.is_pinned ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255,255,255,0.03)',
                    border: post.is_pinned ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    color: post.is_pinned ? '#fbbf24' : '#fff',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {post.is_pinned ? 'Désépingler' : 'Épingler'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
