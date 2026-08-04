'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminUpdateUserStatusAction, adminResetUserPasswordAction } from '@/app/adminActions';

interface ModLog {
  action: string;
  details: string;
  created_at: string;
}

interface User {
  id: string;
  username: string;
  identifier: string;
  subscription_tier: string;
  trust_contact: string | null;
  current_step: string;
  status: string;
  suspended_until: string | null;
  warning_count: number;
  created_at: string;
  posts_count: number;
  comments_count: number;
  reports_received: number;
  reports_sent: number;
  mod_history: ModLog[];
}

interface UsersAdminClientProps {
  initialUsers: User[];
  search: string;
}

export default function UsersAdminClient({ initialUsers, search }: UsersAdminClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchVal, setSearchVal] = useState(search);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [suspensionDays, setSuspensionDays] = useState<number>(7);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/admin/users?search=${encodeURIComponent(searchVal)}`);
  };

  const handleUpdateStatus = (
    userId: string,
    action: 'warn' | 'suspend' | 'ban' | 'activate',
    days?: number
  ) => {
    let confirmMsg = '';
    switch (action) {
      case 'warn': confirmMsg = 'Confirmer l\'envoi d\'un avertissement ?'; break;
      case 'suspend': confirmMsg = `Confirmer la suspension pour ${days || 7} jours ?`; break;
      case 'ban': confirmMsg = 'Confirmer le bannissement définitif ?'; break;
      case 'activate': confirmMsg = 'Confirmer la réactivation du compte ?'; break;
    }

    if (!confirm(confirmMsg)) return;

    startTransition(async () => {
      const res = await adminUpdateUserStatusAction(userId, action, days);
      if (res?.error) {
        alert(res.error);
      } else {
        alert('Action effectuée avec succès.');
        // Refresh local user detail representation
        if (selectedUser && selectedUser.id === userId) {
          const updatedUser = { ...selectedUser };
          if (action === 'activate') {
            updatedUser.status = 'active';
            updatedUser.suspended_until = null;
          } else if (action === 'warn') {
            updatedUser.warning_count += 1;
          } else if (action === 'suspend') {
            updatedUser.status = 'suspended';
            const until = new Date();
            until.setDate(until.getDate() + (days || 7));
            updatedUser.suspended_until = until.toISOString();
          } else if (action === 'ban') {
            updatedUser.status = 'banned';
          }
          setSelectedUser(updatedUser);
        }
        router.refresh();
      }
    });
  };

  const handleResetPassword = (userId: string) => {
    if (!confirm('Confirmer la réinitialisation du mot de passe de cet utilisateur ?')) return;

    startTransition(async () => {
      const res = await adminResetUserPasswordAction(userId);
      if (res?.error) {
        alert(res.error);
      } else if (res?.newPassword) {
        setNewPassword(res.newPassword);
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '28px', fontWeight: '800' }}>Gestion des utilisateurs</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px' }}>
          Recherche, examine les profils et gère les droits d'accès des membres de Goumin.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
        <input
          type="text"
          placeholder="Rechercher par pseudo ou identifiant..."
          className="admin-input"
          style={{ flex: 1 }}
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
        />
        <button type="submit" className="admin-btn">
          Rechercher
        </button>
      </form>

      {/* Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 1fr' : '1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Users Table */}
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pseudo</th>
                <th>Identifiant</th>
                <th>Abonnement</th>
                <th>Avertissements</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                initialUsers.map(user => (
                  <tr key={user.id} style={{ background: selectedUser?.id === user.id ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <td><strong>@{user.username}</strong></td>
                    <td style={{ color: 'var(--text-muted)' }}>{user.identifier}</td>
                    <td>
                      <span className={`admin-badge ${user.subscription_tier}`}>
                        {user.subscription_tier}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <strong style={{ color: user.warning_count > 0 ? '#fb923c' : 'rgba(255,255,255,0.5)' }}>
                        {user.warning_count}
                      </strong>
                    </td>
                    <td>
                      <span className={`admin-badge ${user.status}`}>
                        {user.status === 'suspended' ? 'suspendu' : user.status === 'banned' ? 'banni' : 'actif'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setNewPassword(null);
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          color: '#fff',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Detailed user panel */}
        {selectedUser && (
          <div className="admin-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '20px', fontWeight: '800', color: '#fff' }}>
                  @{selectedUser.username}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {selectedUser.id}</span>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Profile fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Inscription :</span>
                <strong>{new Date(selectedUser.created_at).toLocaleDateString('fr-FR')}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Étape de deuil :</span>
                <strong>{selectedUser.current_step}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Contact SOS :</span>
                <strong>{selectedUser.trust_contact || 'Non configuré'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Formule active :</span>
                <span className={`admin-badge ${selectedUser.subscription_tier}`} style={{ display: 'inline-block', marginTop: '2px' }}>
                  {selectedUser.subscription_tier}
                </span>
              </div>
            </div>

            {/* Activity metrics */}
            <div style={{ background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '14px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.02)' }}>
              <div>
                <strong style={{ fontSize: '18px', display: 'block', color: '#fff' }}>{selectedUser.posts_count}</strong>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Posts</span>
              </div>
              <div>
                <strong style={{ fontSize: '18px', display: 'block', color: '#fff' }}>{selectedUser.comments_count}</strong>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Comms</span>
              </div>
              <div>
                <strong style={{ fontSize: '18px', display: 'block', color: selectedUser.reports_received > 0 ? '#ef4444' : '#fff' }}>
                  {selectedUser.reports_received}
                </strong>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reçus</span>
              </div>
              <div>
                <strong style={{ fontSize: '18px', display: 'block', color: '#fff' }}>{selectedUser.reports_sent}</strong>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Émis</span>
              </div>
            </div>

            {/* Admin Mod Actions Panel */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Actions de modération
              </h4>

              {selectedUser.status !== 'active' ? (
                <button
                  onClick={() => handleUpdateStatus(selectedUser.id, 'activate')}
                  disabled={isPending}
                  className="admin-btn"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', justifyContent: 'center' }}
                >
                  🟢 Réactiver le compte
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      onClick={() => handleUpdateStatus(selectedUser.id, 'warn')}
                      disabled={isPending}
                      style={{ background: 'rgba(251, 146, 60, 0.1)', border: '1px solid rgba(251, 146, 60, 0.2)', color: '#fb923c', padding: '10px', borderRadius: '10px', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer' }}
                    >
                      Avertir (+1)
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedUser.id, 'ban')}
                      disabled={isPending}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '10px', borderRadius: '10px', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer' }}
                    >
                      Bannir
                    </button>
                  </div>
                  
                  {/* Suspension panel */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      value={suspensionDays}
                      onChange={(e) => setSuspensionDays(parseInt(e.target.value))}
                      style={{ background: '#0f0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px', color: '#fff', fontSize: '13px', flex: 1 }}
                    >
                      <option value={1}>1 Jour</option>
                      <option value={3}>3 Jours</option>
                      <option value={7}>7 Jours</option>
                      <option value={30}>30 Jours</option>
                    </select>
                    <button
                      onClick={() => handleUpdateStatus(selectedUser.id, 'suspend', suspensionDays)}
                      disabled={isPending}
                      style={{ background: '#fb923c', border: 'none', color: '#fff', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Suspendre
                    </button>
                  </div>
                </div>
              )}

              {/* Password reset action */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => handleResetPassword(selectedUser.id)}
                  disabled={isPending}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    color: '#fff',
                    padding: '10px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  🔑 Réinitialiser le mot de passe
                </button>
                {newPassword && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '10px', textAlign: 'center', fontSize: '13px' }}>
                    Nouveau mot de passe temporaire : <strong style={{ color: '#10b981', display: 'block', fontSize: '16px', marginTop: '4px' }}>{newPassword}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Audit Log / History */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Historique d'audit modération
              </h4>
              <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedUser.mod_history.length === 0 ? (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Aucune action de modération passée.</span>
                ) : (
                  selectedUser.mod_history.map((log, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.15)', padding: '8px 12px', borderRadius: '8px', fontSize: '11.5px', borderLeft: '2px solid var(--primary)' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9.5px' }}>{new Date(log.created_at).toLocaleString('fr-FR')}</span>
                      <strong style={{ color: '#fff' }}>{log.action}</strong>: {log.details.replace(selectedUser.id, '')}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
