'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@/lib/auth';

interface AppWrapperProps {
  children: React.ReactNode;
  user: User | null;
}

// Fonction utilitaire pour dessiner une icône de lune vectorielle lisse en SVG
export const getMoonIcon = (step: string, size: number = 22, color?: string) => {
  const moonColor = color || "var(--moon-color)";
  switch (step) {
    case 'Choc':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          <circle cx="12" cy="12" r="8" fill="rgba(255,255,255,0.03)" />
        </svg>
      );
    case 'Colère':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          <path d="M12 3a9 9 0 1 0 9 9 9.75 9.75 0 0 1-9-9z" fill={moonColor} stroke={moonColor} strokeWidth="0.5" />
        </svg>
      );
    case 'Marchandage':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          <path d="M12 3v18a9 9 0 0 0 0-18z" fill={moonColor} />
          <circle cx="12" cy="12" r="8" stroke={moonColor} strokeWidth="2" />
        </svg>
      );
    case 'Tristesse':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          <path d="M12 3a9 9 0 1 0 9 9c0-4.5-3.5-9-9-9z" fill={moonColor} />
          <circle cx="12" cy="12" r="8" stroke={moonColor} strokeWidth="2" />
        </svg>
      );
    case 'Acceptation':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={moonColor} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          <circle cx="12" cy="12" r="8" stroke={moonColor} strokeWidth="2" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
};

export default function AppWrapper({ children, user }: AppWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Déterminer si on est sur l'écran SOS pour appliquer le thème vert calme
  const isSosPage = pathname === '/sos';


  return (
    <div 
      className="app-container" 
      style={isSosPage ? {
        backgroundColor: 'var(--sos-bg)',
        color: 'var(--sos-text)',
        borderColor: 'rgba(16, 185, 129, 0.12)'
      } : {}}
    >
      {/* Header global */}
      <header style={isSosPage ? {
        background: 'rgba(4, 16, 12, 0.8)',
        borderColor: 'rgba(16, 185, 129, 0.12)'
      } : {}}>
        <div className="logo" style={isSosPage ? {
          background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        } : {}}>
          Goumin
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
            <span style={{ color: isSosPage ? 'var(--sos-text-muted)' : 'var(--text-muted)' }}>
              {user.username}
            </span>
            <span 
              title={`Étape actuelle : ${user.current_step}`}
              style={{ display: 'flex', alignItems: 'center', filter: isSosPage ? 'drop-shadow(0 0 4px var(--sos-primary-glow))' : 'drop-shadow(0 0 4px var(--moon-glow))' }}
            >
              {getMoonIcon(user.current_step, 18, isSosPage ? 'var(--sos-primary)' : undefined)}
            </span>
            {user.subscription_tier === 'pro' && (
              <span 
                style={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                  color: '#07060f',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                PRO
              </span>
            )}
          </div>
        )}
      </header>

      {/* Main content */}
      <main style={{ flex: 1, padding: '20px' }}>
        {children}
      </main>


      {/* Barre de navigation basse */}
      {user && (
        <nav className="bottom-nav" style={isSosPage ? {
          background: 'rgba(4, 16, 12, 0.9)',
          borderColor: 'rgba(16, 185, 129, 0.12)'
        } : {}}>
          
          <a 
            href="/" 
            onClick={(e) => { e.preventDefault(); router.push('/'); }}
            className={`nav-item ${pathname === '/' ? 'active' : ''}`}
            style={pathname === '/' && isSosPage ? { color: 'var(--sos-primary)' } : {}}
          >
            <span className="nav-icon" style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </span>
            <span>Cercles</span>
          </a>
          
          <a 
            href="/journal" 
            onClick={(e) => { e.preventDefault(); router.push('/journal'); }}
            className={`nav-item ${pathname === '/journal' ? 'active' : ''}`}
            style={pathname === '/journal' && isSosPage ? { color: 'var(--sos-primary)' } : {}}
          >
            <span className="nav-icon" style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </span>
            <span>Journal</span>
          </a>
          
          <a 
            href="/sos" 
            onClick={(e) => { e.preventDefault(); router.push('/sos'); }}
            className={`nav-item ${pathname === '/sos' ? 'active' : ''}`}
            style={pathname === '/sos' && isSosPage ? { color: 'var(--sos-primary)' } : {}}
          >
            <span className="nav-icon" style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </span>
            <span>SOS</span>
          </a>
          
          <a 
            href="/pro" 
            onClick={(e) => { e.preventDefault(); router.push('/pro'); }}
            className={`nav-item ${pathname === '/pro' ? 'active' : ''}`}
            style={pathname === '/pro' && isSosPage ? { color: 'var(--sos-primary)' } : {}}
          >
            <span className="nav-icon" style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"></path>
                <path d="M3 20h18"></path>
              </svg>
            </span>
            <span>Passer Pro</span>
          </a>
          
          <a 
            href="/profile" 
            onClick={(e) => { e.preventDefault(); router.push('/profile'); }}
            className={`nav-item ${pathname === '/profile' ? 'active' : ''}`}
            style={pathname === '/profile' && isSosPage ? { color: 'var(--sos-primary)' } : {}}
          >
            <span className="nav-icon" style={{ display: 'flex', justifyContent: 'center' }}>
              {getMoonIcon(user.current_step, 20)}
            </span>
            <span>Profil</span>
          </a>
          
        </nav>
      )}
    </div>
  );
}
