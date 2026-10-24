'use client';

import React, { useState, useEffect } from 'react';
import { usePwa } from './PwaContext';

interface PwaInstallButtonProps {
  variant?: 'header' | 'card' | 'banner' | 'button';
  className?: string;
  style?: React.CSSProperties;
}

export default function PwaInstallButton({
  variant = 'button',
  className = '',
  style = {},
}: PwaInstallButtonProps) {
  const { isInstalled, promptInstall, canPromptDirectly, isIos } = usePwa();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = sessionStorage.getItem('goumin_pwa_banner_dismissed');
      if (dismissed === 'true') {
        setBannerDismissed(true);
      }
    }
  }, []);

  const handleDismissBanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBannerDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('goumin_pwa_banner_dismissed', 'true');
    }
  };

  // 1. Bouton Header
  if (variant === 'header') {
    if (isInstalled) return null;

    return (
      <button
        onClick={promptInstall}
        className={`pwa-header-btn ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(168, 85, 247, 0.25) 100%)',
          border: '1px solid rgba(236, 72, 153, 0.45)',
          color: '#ffffff',
          padding: '6px 11px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 0 12px rgba(236, 72, 153, 0.25)',
          transition: 'all 0.2s ease',
          fontFamily: 'var(--font-sans)',
          ...style,
        }}
        title="Installer l'application Goumin sur votre appareil"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 3px rgba(236, 72, 153, 0.8))' }}
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span className="pwa-header-btn-text">Installer</span>
      </button>
    );
  }

  // 2. Carte complète (Profil / Paramètres)
  if (variant === 'card') {
    if (isInstalled) {
      return (
        <div
          className="card"
          style={{
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '16px 18px',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            ...style,
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
              flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#34d399', marginBottom: '2px' }}>
              Application installée (PWA active)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Tu utilises Goumin directement depuis ton écran d'accueil avec une expérience plein écran dédiée.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="card"
        style={{
          background: 'linear-gradient(145deg, rgba(236, 72, 153, 0.07) 0%, rgba(168, 85, 247, 0.04) 100%)',
          border: '1px solid rgba(236, 72, 153, 0.25)',
          padding: '18px',
          borderRadius: '18px',
          ...style,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
              border: '1px solid rgba(236, 72, 153, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </div>
          <div>
            <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '15px', fontWeight: '700', color: '#fff' }}>
              Installer l'application Goumin
            </h4>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Accès instantané & mode plein écran
            </p>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '14px' }}>
          Installe Goumin sur ton écran d'accueil pour y accéder en un clic, profiter d'une discrétion totale et naviguer de manière fluide sans barre de navigateur.
        </p>

        <button
          onClick={promptInstall}
          className="btn btn-primary"
          style={{
            padding: '11px 16px',
            fontSize: '13px',
            width: '100%',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Installer l'application sur mon appareil</span>
        </button>
      </div>
    );
  }

  // 3. Bannière pour le haut de page / flux
  if (variant === 'banner') {
    if (isInstalled || bannerDismissed) return null;

    return (
      <div
        className="pwa-feed-banner"
        onClick={promptInstall}
        style={{
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.14) 0%, rgba(168, 85, 247, 0.1) 100%)',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          borderRadius: '16px',
          padding: '12px 14px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          transition: 'transform 0.15s ease, border-color 0.2s',
          ...style,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <img
            src="/images/icon.png"
            alt="Goumin"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              objectFit: 'cover',
              boxShadow: '0 0 10px rgba(236, 72, 153, 0.4)',
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Installe l'app Goumin
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Pour un accès direct et discret
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span
            style={{
              background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
              color: '#fff',
              fontSize: '11px',
              fontWeight: '700',
              padding: '6px 10px',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(236, 72, 153, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Installer
          </span>
          <button
            onClick={handleDismissBanner}
            aria-label="Ignorer la bannière"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '14px',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // 4. Bouton autonome standard
  if (isInstalled) {
    return (
      <div
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#34d399',
          fontSize: '12px',
          fontWeight: '600',
          ...style,
        }}
      >
        <span>✓ Déjà installée</span>
      </div>
    );
  }

  return (
    <button
      onClick={promptInstall}
      className={`btn btn-primary ${className}`}
      style={{
        padding: '12px 18px',
        fontSize: '14px',
        borderRadius: '14px',
        cursor: 'pointer',
        ...style,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      <span>Installer l'application PWA</span>
    </button>
  );
}
