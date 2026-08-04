'use client';

import React, { useState } from 'react';
import { adminLogoutAction } from '@/app/adminActions';
import { usePathname, useRouter } from 'next/navigation';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  adminUsername: string;
}

export default function AdminLayoutClient({ children, adminUsername }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      name: 'Tableau de Bord',
      path: '/admin',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      )
    },
    {
      name: 'File de Modération',
      path: '/admin/moderation',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    },
    {
      name: 'Utilisateurs',
      path: '/admin/users',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      name: 'Cercles',
      path: '/admin/circles',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
        </svg>
      )
    },
    {
      name: 'Abonnements',
      path: '/admin/payments',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      )
    },
    {
      name: 'Contenu Pro',
      path: '/admin/editorial',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0b0a11', fontFamily: 'var(--font-sans)', color: '#f3f4f6', width: '100%' }}>
      
      {/* Styles globaux pour le tableau de bord admin */}
      <style>{`
        .admin-sidebar {
          width: 260px;
          background: #0f0d1a;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          padding: 24px;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        .admin-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .admin-menu-item:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.03);
        }
        .admin-menu-item.active {
          color: #fff;
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 179, 8, 0.1) 100%);
          border: 1px solid rgba(249, 115, 22, 0.25);
        }
        .admin-content {
          flex: 1;
          padding: 30px;
          overflow-y: auto;
          max-height: 100vh;
        }
        .admin-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 24px;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .admin-table th {
          padding: 14px 16px;
          color: rgba(255, 255, 255, 0.4);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .admin-table td {
          padding: 16px;
          font-size: 13.5px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }
        .admin-input {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 10px 14px;
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .admin-input:focus {
          border-color: var(--primary);
        }
        .admin-btn {
          background: linear-gradient(135deg, #f97316 0%, #eab308 100%);
          border: none;
          color: #fff;
          font-weight: 700;
          padding: 10px 18px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 13.5px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: filter 0.2s ease;
        }
        .admin-btn:hover {
          filter: brightness(1.1);
        }
        .admin-badge {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 4px 8px;
          border-radius: 8px;
        }
        .admin-badge.active { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .admin-badge.suspended { background: rgba(251, 146, 60, 0.1); color: #fb923c; }
        .admin-badge.banned { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .admin-badge.pro { background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.2); }
        .admin-badge.simple { background: rgba(255, 255, 255, 0.05); color: rgba(255, 255, 255, 0.5); }
        
        @media (max-width: 900px) {
          .admin-sidebar {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            z-index: 1000;
            transform: translateX(${mobileMenuOpen ? '0' : '-100%'});
          }
          .admin-content {
            padding: 16px;
          }
        }
      `}</style>

      {/* Menu mobile toggle */}
      <div style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 1001,
        display: 'none'
      }} className="mobile-toggle-btn">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: '#0f0d1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px', color: '#fff', cursor: 'pointer' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f97316 0%, #eab308 100%)',
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#fff'
          }}>
            G
          </div>
          <strong style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-title)' }}>Goumin Admin</strong>
        </div>

        <nav style={{ flex: 1 }}>
          {menuItems.map((item, idx) => (
            <a
              key={idx}
              onClick={() => {
                setMobileMenuOpen(false);
                router.push(item.path);
              }}
              className={`admin-menu-item ${pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              {item.name}
            </a>
          ))}
        </nav>

        {/* Admin info & Logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
              {adminUsername.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{adminUsername}</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Rôle: Administrateur</span>
            </div>
          </div>
          <form action={adminLogoutAction}>
            <button
              type="submit"
              style={{
                width: '100%',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '10px',
                padding: '10px',
                color: '#ef4444',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
