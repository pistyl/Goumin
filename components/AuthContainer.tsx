'use client';

import React, { useState, useTransition } from 'react';
import { signUpAction, loginAction } from '@/app/actions';

interface AuthContainerProps {
  circles: { id: string; name: string; description: string }[];
}

export default function AuthContainer({ circles }: AuthContainerProps) {
  const [screen, setScreen] = useState<'splash' | 'signup' | 'signup_circles' | 'login'>('splash');
  
  // États de saisie locale pour l'inscription (Étape 1)
  const [username, setUsername] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGoToSignUp = (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    setScreen('signup');
  };

  const handleGoToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    setScreen('login');
  };

  const handleGoToSplash = (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    setScreen('splash');
  };

  const handleSignUpContinue = (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!username.trim() || !identifier.trim() || !password.trim()) {
      setError('Remplis toutes les cases pour créer ton profil, s\'il te plaît.');
      return;
    }
    
    if (password.length < 4) {
      setError('Le mot de passe doit faire au moins 4 caractères.');
      return;
    }
    
    setScreen('signup_circles');
  };

  const handleSocialClick = (platform: string) => {
    alert(`La connexion via ${platform} sera disponible en V2. Utilise ton identifiant et mot de passe pour le moment ! 🧡`);
  };

  // Soumission du formulaire d'inscription
  const handleSignUpSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await signUpAction(null, formData);
      if (res?.error) {
        setError(res.error);
        setScreen('signup'); // ramener à l'étape 1 en cas d'erreur
      }
      // Note : Si succès, redirect('/') est déclenché côté serveur dans signUpAction, 
      // ce qui recharge et redirige l'application de façon fluide.
    });
  };

  // Soumission du formulaire de connexion
  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await loginAction(null, formData);
      if (res?.error) {
        setError(res.error);
      }
      // Note : Si succès, redirect('/') est déclenché côté serveur dans loginAction.
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh', justifyContent: 'center', padding: '10px 0' }}>
      
      {/* 1. ÉCRAN SPLASH / INTRO (Gauche dans la maquette) */}
      {screen === 'splash' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '30px', margin: '40px 0' }}>
          
          {/* Logo brillant orange style maquette */}
          <div style={{
            position: 'relative',
            width: '90px',
            height: '90px',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 10px 30px rgba(249, 115, 22, 0.15)',
            transform: 'rotate(15deg)',
            marginBottom: '10px'
          }}>
            <div style={{ transform: 'rotate(-15deg)' }}>
              <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 6C17.64 6 6 17.64 6 32C6 46.36 17.64 58 32 58C46.36 58 58 46.36 58 32" stroke="url(#logo-grad)" strokeWidth="6" strokeLinecap="round" />
                <path d="M22 24C22 17 32 12 32 20C32 28 20 28 20 36C20 44 32 46 32 38" stroke="url(#logo-grad)" strokeWidth="6" strokeLinecap="round" />
                <defs>
                  <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#eab308" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 50%)',
              borderRadius: '24px',
              pointerEvents: 'none'
            }} />
          </div>

          <div>
            <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '32px', fontWeight: '800', background: 'linear-gradient(135deg, #f97316 0%, #eab308 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
              Goumin support
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginTop: '12px', padding: '0 20px' }}>
              La plateforme communautaire mobile-first pour surmonter les chagrins d'amour entre pairs. Ici, pas de clinique, juste de l'entraide chaleureuse. 🧡
            </p>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            <button onClick={handleGoToSignUp} className="btn btn-primary">
              S'inscrire
            </button>
            <button onClick={handleGoToLogin} className="btn btn-secondary">
              J'ai déjà un compte
            </button>
          </div>
        </div>
      )}

      {/* 2. FORMULAIRE DE CONNEXION INDÉPENDANT (Milieu dans la maquette) */}
      {screen === 'login' && (
        <form onSubmit={handleLoginSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>👤</span>
              <strong style={{ fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: 'bold' }}>
                Se connecter
              </strong>
            </div>
            <button 
              onClick={handleGoToSplash}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
            >
              Retour
            </button>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '12px', borderRadius: '12px', fontSize: '13px', textAlign: 'center' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Pseudo, Email ou Téléphone
              </label>
              <input 
                name="identifier" 
                type="text" 
                placeholder="Entre ton identifiant..." 
                className="input-field"
                required
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Mot de passe
                </label>
                <a 
                  href="#forgot" 
                  onClick={(e) => { e.preventDefault(); alert("En V1, contacte l'administrateur pour réinitialiser ton accès. 😉"); }}
                  style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <input 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                className="input-field"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isPending} 
              className="btn btn-primary"
              style={{ marginTop: '10px' }}
            >
              {isPending ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>

          {/* Social Sign-In */}
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0', fontSize: '11px', color: 'var(--text-muted)' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              <span>OU CONTINUER AVEC</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => handleSocialClick('Apple')}
                className="btn btn-secondary"
                style={{ flex: 1, borderRadius: '16px', padding: '12px 10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-.1 3.81.22 1.25.5 2.23 1.66 2.8 2.67-2.61 1.53-2.2 4.9 1 5.92-1.12 2.16-2.5 4.41-3.69 5.91zM15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.6.69-1.12 1.84-.98 2.95 1.1.08 2.21-.57 2.91-1.38z" />
                </svg>
                <span>Apple</span>
              </button>
              <button 
                type="button" 
                onClick={() => handleSocialClick('Google')}
                className="btn btn-secondary"
                style={{ flex: 1, borderRadius: '16px', padding: '12px 10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Google</span>
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Pas encore de compte ?{' '}
                <a href="#signup" onClick={handleGoToSignUp} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>
                  S'inscrire
                </a>
              </span>
            </div>
          </div>
        </form>
      )}

      {/* 3. FORMULAIRE D'INSCRIPTION INDÉPENDANT (Droite dans la maquette) */}
      {(screen === 'signup' || screen === 'signup_circles') && (
        <form onSubmit={handleSignUpSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>✨</span>
              <strong style={{ fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: 'bold' }}>
                Inscription
              </strong>
            </div>
            <button 
              onClick={handleGoToSplash}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
            >
              Retour
            </button>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '12px', borderRadius: '12px', fontSize: '13px', textAlign: 'center' }}>
              ⚠️ {error}
            </div>
          )}

          {/* ÉTAPE 1: RENSEIGNEMENTS DU PROFIL */}
          <div style={{ display: screen === 'signup' ? 'flex' : 'none', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Pseudo (Ton pseudo communautaire stable)
              </label>
              <input 
                name="username" 
                type="text" 
                placeholder="Ex: Dakar_Boy" 
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={screen === 'signup'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Email ou Numéro de Téléphone
              </label>
              <input 
                name="identifier" 
                type="text" 
                placeholder="Ex: monadresse@mail.com ou +22177..." 
                className="input-field"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required={screen === 'signup'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Mot de passe
              </label>
              <input 
                name="password" 
                type="password" 
                placeholder="Créer ton mot de passe..." 
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={screen === 'signup'}
              />
            </div>

            <button 
              type="button" 
              onClick={handleSignUpContinue}
              className="btn btn-primary"
              style={{ marginTop: '10px' }}
            >
              Continuer
            </button>

            {/* Separator & Switch */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                <span>OU CONTINUER AVEC</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => handleSocialClick('Apple')}
                  className="btn btn-secondary"
                  style={{ flex: 1, borderRadius: '16px', padding: '12px 10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-.1 3.81.22 1.25.5 2.23 1.66 2.8 2.67-2.61 1.53-2.2 4.9 1 5.92-1.12 2.16-2.5 4.41-3.69 5.91zM15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.6.69-1.12 1.84-.98 2.95 1.1.08 2.21-.57 2.91-1.38z" />
                  </svg>
                  <span>Apple</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => handleSocialClick('Google')}
                  className="btn btn-secondary"
                  style={{ flex: 1, borderRadius: '16px', padding: '12px 10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Google</span>
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Déjà inscrit ?{' '}
                  <a href="#login" onClick={handleGoToLogin} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>
                    Se connecter
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* ÉTAPE 2: CHOIX DES CERCLES */}
          <div style={{ display: screen === 'signup_circles' ? 'flex' : 'none', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 'bold' }}>🌓 Étape finale : Cercles d'entraide</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Choisis tes cercles</span>
            </div>

            {/* Inputs cachés de l'étape 1 pour la transmission form standard */}
            <input type="hidden" name="username" value={username} />
            <input type="hidden" name="identifier" value={identifier} />
            <input type="hidden" name="password" value={password} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {circles.map(circle => (
                <label 
                  key={circle.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <input 
                    type="checkbox" 
                    name="circles" 
                    value={circle.id} 
                    defaultChecked 
                    style={{ marginTop: '4px' }}
                  />
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-main)' }}>{circle.name}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'block', marginTop: '4px', lineHeight: '1.4' }}>
                      {circle.description}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                type="button" 
                onClick={() => setScreen('signup')}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Retour
              </button>
              <button 
                type="submit" 
                disabled={isPending} 
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {isPending ? 'Création...' : 'Finaliser & Entrer 🚀'}
              </button>
            </div>
          </div>

        </form>
      )}

    </div>
  );
}
