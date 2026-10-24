'use client';

import React from 'react';
import { usePwa } from './PwaContext';

export default function PwaInstallModal() {
  const { showInstallModal, setShowInstallModal, isIos, isAndroid } = usePwa();

  if (!showInstallModal) return null;

  return (
    <div
      className="pwa-modal-backdrop"
      onClick={() => setShowInstallModal(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(4, 3, 9, 0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'pwaFadeIn 0.25s ease-out',
      }}
    >
      <div
        className="pwa-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'linear-gradient(165deg, rgba(28, 20, 48, 0.95) 0%, rgba(13, 11, 26, 0.98) 100%)',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(236, 72, 153, 0.2)',
          padding: '24px',
          color: '#f3f4f6',
          position: 'relative',
          animation: 'pwaSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Bouton fermeture */}
        <button
          onClick={() => setShowInstallModal(false)}
          aria-label="Fermer"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: 'var(--text-muted)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          ✕
        </button>

        {/* En-tête */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <img
            src="/images/icon.png"
            alt="Goumin Icon"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              objectFit: 'cover',
              boxShadow: '0 0 18px rgba(236, 72, 153, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          />
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '19px',
                fontWeight: '700',
                color: '#fff',
                marginBottom: '2px',
              }}
            >
              Installer Goumin
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Application web progressive (PWA)
            </p>
          </div>
        </div>

        {/* Avantages */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            marginBottom: '20px',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e2e8f0' }}>
            <span style={{ color: '#ec4899', fontSize: '16px' }}>⚡</span>
            <span>Accès 1-clic direct</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e2e8f0' }}>
            <span style={{ color: '#a855f7', fontSize: '16px' }}>🔒</span>
            <span>Discret & intime</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e2e8f0' }}>
            <span style={{ color: '#10b981', fontSize: '16px' }}>📱</span>
            <span>Plein écran natif</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e2e8f0' }}>
            <span style={{ color: '#f59e0b', fontSize: '16px' }}>🚀</span>
            <span>Ultra fluide</span>
          </div>
        </div>

        {/* Instructions selon la plateforme */}
        {isIos ? (
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#fce7f3', marginBottom: '12px' }}>
              Comment installer sur iPhone / iPad :
            </div>
            <ol
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                paddingLeft: '0',
                listStyle: 'none',
                marginBottom: '22px',
                fontSize: '13px',
                lineHeight: '1.5',
              }}
            >
              <li
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <span
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  1
                </span>
                <span>
                  Appuie sur le bouton <strong>Partager</strong>{' '}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      padding: '2px 6px',
                      fontSize: '12px',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                      <polyline points="16 6 12 2 8 6"></polyline>
                      <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                    Partager
                  </span>{' '}
                  en bas dans Safari.
                </span>
              </li>

              <li
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <span
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  2
                </span>
                <span>
                  Fais défiler la liste vers le bas et sélectionne{' '}
                  <strong style={{ color: '#fff' }}>« Sur l'écran d'accueil »</strong> (icône ➕).
                </span>
              </li>

              <li
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <span
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  3
                </span>
                <span>
                  Touche <strong style={{ color: '#fff' }}>« Ajouter »</strong> en haut à droite. Goumin est installé !
                </span>
              </li>
            </ol>
          </div>
        ) : isAndroid ? (
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#fce7f3', marginBottom: '12px' }}>
              Comment installer sur Android :
            </div>
            <ol
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                paddingLeft: '0',
                listStyle: 'none',
                marginBottom: '22px',
                fontSize: '13px',
                lineHeight: '1.5',
              }}
            >
              <li
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <span
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  1
                </span>
                <span>
                  Appuie sur le menu de ton navigateur (les <strong>3 points verticaux ⋮</strong> en haut à droite).
                </span>
              </li>

              <li
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <span
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  2
                </span>
                <span>
                  Sélectionne <strong style={{ color: '#fff' }}>« Installer l'application »</strong> ou{' '}
                  <strong style={{ color: '#fff' }}>« Ajouter à l'écran d'accueil »</strong>.
                </span>
              </li>

              <li
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <span
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  3
                </span>
                <span>
                  Confirme pour retrouver l'icône Goumin parmi tes applications.
                </span>
              </li>
            </ol>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#fce7f3', marginBottom: '12px' }}>
              Comment installer sur votre ordinateur ou navigateur :
            </div>
            <ol
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                paddingLeft: '0',
                listStyle: 'none',
                marginBottom: '22px',
                fontSize: '13px',
                lineHeight: '1.5',
              }}
            >
              <li
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <span
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  1
                </span>
                <span>
                  Dans la barre d'adresse du navigateur (Chrome / Edge), repère l'icône{' '}
                  <strong style={{ color: '#fff' }}>« Installer Goumin »</strong> (icône d'écran ou flèche) à droite.
                </span>
              </li>

              <li
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <span
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  2
                </span>
                <span>
                  Ou ouvre le menu ⋮ du navigateur et clique sur{' '}
                  <strong style={{ color: '#fff' }}>« Installer Goumin »</strong>.
                </span>
              </li>
            </ol>
          </div>
        )}

        {/* Bouton fermeture / validation */}
        <button
          onClick={() => setShowInstallModal(false)}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '12px 20px',
            borderRadius: '14px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          J'ai compris
        </button>
      </div>

      <style jsx global>{`
        @keyframes pwaFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes pwaSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
