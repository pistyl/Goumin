'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/lib/auth';

interface SosClientProps {
  user: User;
}

export default function SosClient({ user }: SosClientProps) {
  const [breathingText, setBreathingText] = useState('Inspire...');
  const [isBreathing, setIsBreathing] = useState(true);
  const [letterText, setLetterText] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [letterBurned, setLetterBurned] = useState(false);
  
  // Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');

  useEffect(() => {
    if (!isBreathing) return;

    let cycle = 0;
    const interval = setInterval(() => {
      cycle = (cycle + 1) % 2;
      setBreathingText(cycle === 0 ? 'Inspire...' : 'Expire...');
    }, 3000);

    return () => clearInterval(interval);
  }, [isBreathing]);

  const handleBurnLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterText.trim()) return;

    setIsBurning(true);
    setTimeout(() => {
      setIsBurning(false);
      setLetterBurned(true);
      setLetterText('');
    }, 2500);
  };

  const toggleAudio = () => {
    const audioEl = document.getElementById('sos-audio-player') as HTMLAudioElement;
    if (audioEl) {
      if (isPlayingAudio) {
        audioEl.pause();
      } else {
        audioEl.play().catch(e => console.log('Audio playback block:', e));
      }
      setIsPlayingAudio(!isPlayingAudio);
    }
  };

  // Icônes vectorielles SVG pour le mode SOS
  const phoneIcon = (size: number = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
    </svg>
  );

  const flameIcon = (size: number = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
    </svg>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', color: 'var(--sos-text)', paddingBottom: '30px' }}>
      
      <style>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(0.85);
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
            background: rgba(16, 185, 129, 0.1);
          }
          50% {
            transform: scale(1.15);
            box-shadow: 0 0 50px rgba(16, 185, 129, 0.6);
            background: rgba(16, 185, 129, 0.3);
          }
        }
        .breathing-bubble {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 2px solid var(--sos-primary);
          display: flex;
          justifyContent: center;
          align-items: center;
          font-family: var(--font-title);
          font-weight: bold;
          font-size: 16px;
          color: #fff;
          margin: 10px 0;
          animation: breathe 6s infinite ease-in-out;
        }
        .breathing-bubble.paused {
          animation-play-state: paused;
        }
        @keyframes burn {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
            filter: sepia(0) saturate(1) brightness(1);
          }
          30% {
            transform: scale(0.95) rotate(1deg);
            filter: sepia(0.5) saturate(2) brightness(1.2) drop-shadow(0 0 10px #f59e0b);
          }
          70% {
            transform: scale(0.6) rotate(-2deg);
            opacity: 0.5;
            filter: sepia(1) saturate(5) brightness(0.8) drop-shadow(0 0 30px #ef4444);
          }
          100% {
            transform: scale(0) rotate(5deg);
            opacity: 0;
            filter: brightness(0);
          }
        }
        .burning-effect {
          animation: burn 2.5s forwards ease-in;
        }
      `}</style>

      {/* Titre */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '26px', fontWeight: '800', color: 'var(--sos-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span>Mode SOS</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
          </svg>
        </h2>
        <p style={{ color: 'var(--sos-text-muted)', fontSize: '13px', marginTop: '4px', lineHeight: '1.4' }}>
          Goumin fort sur toi ? Respire un coup. Ce mode est gratuit et accessible à tous, à tout moment.
        </p>
      </div>

      {/* Section 1 : Respiration Guidée */}
      <div className="card" style={{
        background: 'rgba(16, 185, 129, 0.03)',
        borderColor: 'rgba(16, 185, 129, 0.12)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px',
        padding: '20px'
      }}>
        <h4 style={{ fontSize: '14px', color: 'var(--sos-text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>
          Respiration guidée
        </h4>
        
        <div className={`breathing-bubble ${!isBreathing ? 'paused' : ''}`}>
          {isBreathing ? breathingText : 'Pause'}
        </div>

        <button 
          onClick={() => setIsBreathing(!isBreathing)}
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--sos-text)',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          {isBreathing ? 'Mettre en pause' : 'Démarrer'}
        </button>
      </div>

      {/* Section 2 : Appel d'un contact de confiance */}
      <div className="card" style={{
        background: 'rgba(16, 185, 129, 0.03)',
        borderColor: 'rgba(16, 185, 129, 0.12)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <h4 style={{ fontSize: '14px', color: 'var(--sos-text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>
          Lien d'urgence
        </h4>
        
        {user.trust_contact ? (
          <a 
            href={`tel:${user.trust_contact}`}
            className="btn"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {phoneIcon(16)}
            Appeler ton contact de confiance ({user.trust_contact})
          </a>
        ) : (
          <div style={{ textAlign: 'center', padding: '10px' }}>
            <p style={{ fontSize: '12px', color: 'var(--sos-text-muted)', marginBottom: '8px' }}>
              Tu n'as pas encore configuré de contact de confiance dans tes paramètres.
            </p>
            <a 
              href="/profile" 
              style={{ color: 'var(--sos-primary)', fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline' }}
            >
              Ajouter un contact maintenant
            </a>
          </div>
        )}
      </div>

      {/* Section 3 : Audio Apaisant (Lecteur audio) */}
      <div className="card" style={{
        background: 'rgba(16, 185, 129, 0.03)',
        borderColor: 'rgba(16, 185, 129, 0.12)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignItems: 'center'
      }}>
        <div style={{ alignSelf: 'flex-start' }}>
          <h4 style={{ fontSize: '14px', color: 'var(--sos-text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Audio apaisant
          </h4>
          <span style={{ fontSize: '11px', color: 'var(--sos-text-muted)' }}>Un mot doux et une musique calme pour relâcher la pression</span>
        </div>

        <audio id="sos-audio-player" src={audioUrl} loop />

        <button 
          onClick={toggleAudio}
          className="btn"
          style={{
            background: isPlayingAudio ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: isPlayingAudio ? '1px solid #ef4444' : '1px solid var(--sos-primary)',
            color: isPlayingAudio ? '#f87171' : 'var(--sos-text)',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isPlayingAudio ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginRight: '6px' }}>
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
              <span>Mettre l'audio en pause</span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginRight: '6px' }}>
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
              <span>Écouter un audio apaisant</span>
            </>
          )}
        </button>
      </div>

      {/* Section 4 : Lettre non envoyée */}
      <div className="card" style={{
        background: 'rgba(16, 185, 129, 0.03)',
        borderColor: 'rgba(16, 185, 129, 0.12)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div>
          <h4 style={{ fontSize: '14px', color: 'var(--sos-text-muted)', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Lettre non envoyée</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </h4>
          <p style={{ fontSize: '11px', color: 'var(--sos-text-muted)', marginTop: '2px', lineHeight: '1.3' }}>
            Une envie irrépressible de lui écrire ? Écris tout ici : tes colères, tes pleurs, tes reproches. Ne l'envoie pas. À la place, brûle-la symboliquement.
          </p>
        </div>

        {letterBurned ? (
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '16px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--sos-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 12px auto' }}>
              <path d="M22 2L11 13"></path>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            <strong style={{ fontSize: '14px', display: 'block', color: 'var(--sos-primary)', marginBottom: '4px' }}>
              La lettre a été brûlée.
            </strong>
            <p style={{ fontSize: '12px', color: 'var(--sos-text-muted)', lineHeight: '1.4' }}>
              C'est fait, tu t'es libéré·e de ce poids. Laisse s'en aller ce qui doit partir. Courage, ça va passer.
            </p>
            <button 
              className="btn btn-secondary" 
              style={{ marginTop: '12px', padding: '6px 12px', fontSize: '12px', borderColor: 'rgba(16, 185, 129, 0.3)', color: 'var(--sos-text)' }}
              onClick={() => setLetterBurned(false)}
            >
              Écrire une autre lettre
            </button>
          </div>
        ) : (
          <form onSubmit={handleBurnLetter} className={isBurning ? 'burning-effect' : ''} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <textarea
              placeholder="Écris tout ce que tu as sur le cœur sans limites..."
              className="input-field"
              style={{
                minHeight: '120px',
                resize: 'none',
                background: 'rgba(4, 16, 12, 0.6)',
                borderColor: 'rgba(16, 185, 129, 0.2)',
                color: 'var(--sos-text)'
              }}
              value={letterText}
              onChange={(e) => setLetterText(e.target.value)}
              disabled={isBurning}
              required
            />
            <button 
              type="submit" 
              className="btn" 
              style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              disabled={isBurning || !letterText.trim()}
            >
              {isBurning ? (
                <>
                  {flameIcon(16)}
                  <span>Combustion en cours...</span>
                </>
              ) : (
                <>
                  {flameIcon(16)}
                  <span>Brûler cette lettre</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
