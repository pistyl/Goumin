import React from 'react';
import { adminLoginAction } from '@/app/adminActions';
import { getCurrentAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Page({ searchParams }: { searchParams: { error?: string } }) {
  const admin = await getCurrentAdmin();
  if (admin) {
    redirect('/admin');
  }

  const error = searchParams?.error;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 50%, #151324 0%, #07060f 100%)',
      color: '#f3f4f6',
      fontFamily: 'var(--font-sans)',
      padding: '20px'
    }}>
      <div className="card animate-fade-in" style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '40px 30px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontFamily: 'var(--font-title)',
            fontSize: '28px',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #f97316 0%, #eab308 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
            marginBottom: '8px'
          }}>
            Goumin Admin
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
            Accès réservé aux administrateurs de la plateforme
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            color: '#f87171',
            padding: '12px 16px',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form action={adminLoginAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="username" style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
              Identifiant Administrateur :
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              placeholder="Pseudo admin"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                color: '#fff',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="password" style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
              Mot de passe :
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="••••••••"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                color: '#fff',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #eab308 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              marginTop: '10px',
              boxShadow: '0 8px 24px rgba(249, 115, 22, 0.25)',
              transition: 'all 0.25s ease'
            }}
          >
            Se connecter au Back-Office
          </button>
        </form>
      </div>
    </div>
  );
}
