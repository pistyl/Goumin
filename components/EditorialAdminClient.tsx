'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminPublishProContentAction } from '@/app/adminActions';

interface ProContent {
  id: string;
  type: string;
  title: string;
  content: string;
  audio_url: string;
  publish_at: string;
  created_at: string;
}

interface EditorialAdminClientProps {
  initialContents: ProContent[];
}

export default function EditorialAdminClient({ initialContents }: EditorialAdminClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState<'citation' | 'audio' | 'text'>('citation');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [publishAt, setPublishAt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      alert('Veuillez remplir le titre.');
      return;
    }

    startTransition(async () => {
      const res = await adminPublishProContentAction(
        type,
        title,
        content,
        audioUrl,
        publishAt
      );

      if (res?.error) {
        alert(res.error);
      } else {
        alert('Contenu exclusif Pro publié avec succès !');
        setTitle('');
        setContent('');
        setAudioUrl('');
        setPublishAt('');
        router.refresh();
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '28px', fontWeight: '800' }}>Contenu Éditorial Pro</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px' }}>
          Publie et planifie des chroniques audio, des textes inspirants et des citations de soutien pour les abonnés Goumin Pro.
        </p>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start', flexWrap: 'wrap' }}>
        
        {/* Form panel */}
        <div className="admin-card">
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>
            Publier un nouveau contenu exclusif
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Type de contenu :</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {(['citation', 'audio', 'text'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      border: type === t ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                      background: type === t ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255,255,255,0.02)',
                      color: type === t ? '#fff' : 'var(--text-muted)',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {t === 'citation' ? '💬 Citation' : t === 'audio' ? '🎙️ Chronique Audio' : '📝 Article Textuel'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Titre :</label>
              <input
                type="text"
                placeholder={type === 'citation' ? 'ex. Citation de réconfort du jour' : type === 'audio' ? 'ex. Épisode 1 : Traverser le choc' : 'ex. Les 5 clés de la reconstruction'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="admin-input"
              />
            </div>

            {type !== 'audio' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Contenu :</label>
                <textarea
                  placeholder="Écrivez le texte ou la citation ici..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="admin-input"
                  style={{ minHeight: '120px', resize: 'none' }}
                />
              </div>
            )}

            {type === 'audio' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Description de l'audio :</label>
                <textarea
                  placeholder="De quoi parle cet épisode..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="admin-input"
                  style={{ minHeight: '80px', resize: 'none' }}
                />
              </div>
            )}

            {type === 'audio' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Lien / URL du fichier audio :</label>
                <input
                  type="text"
                  placeholder="ex. https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  required
                  className="admin-input"
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Date et heure de publication (Optionnel) :</label>
              <input
                type="datetime-local"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
                className="admin-input"
              />
            </div>

            <button type="submit" className="admin-btn" style={{ justifyContent: 'center', marginTop: '10px' }} disabled={isPending}>
              Publier le contenu exclusif Pro
            </button>
          </form>
        </div>

        {/* Existing contents list */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: '800' }}>Contenus publiés & programmés</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
            {initialContents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
                Aucun contenu éditorial publié pour le moment.
              </div>
            ) : (
              initialContents.map(c => {
                const isFuture = new Date(c.publish_at) > new Date();

                return (
                  <div
                    key={c.id}
                    style={{
                      background: 'rgba(255,255,255,0.01)',
                      border: isFuture ? '1px solid rgba(234, 179, 8, 0.25)' : '1px solid rgba(255,255,255,0.04)',
                      borderRadius: '16px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        background: c.type === 'citation' ? 'rgba(251, 191, 36, 0.15)' : c.type === 'audio' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(96, 165, 250, 0.15)',
                        color: c.type === 'citation' ? '#fbbf24' : c.type === 'audio' ? '#10b981' : '#60a5fa',
                        fontSize: '9px',
                        fontWeight: '800',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        textTransform: 'uppercase'
                      }}>
                        {c.type}
                      </span>

                      {isFuture ? (
                        <span style={{ color: '#fb923c', fontSize: '11px', fontWeight: 'bold' }}>
                          ⏳ Programmé : {new Date(c.publish_at).toLocaleDateString('fr-FR')}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                          Publié le {new Date(c.publish_at).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>

                    <strong style={{ color: '#fff', fontSize: '14.5px' }}>{c.title}</strong>
                    {c.content && (
                      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: '1.4' }}>
                        "{c.content.slice(0, 120)}{c.content.length > 120 ? '...' : ''}"
                      </p>
                    )}
                    {c.type === 'audio' && c.audio_url && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10b981' }}>
                        <span>🔊</span>
                        <span style={{ fontFamily: 'monospace' }}>{c.audio_url.slice(0, 40)}...</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
