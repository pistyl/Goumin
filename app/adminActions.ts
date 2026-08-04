'use server';

import { db } from '@/lib/db';
import { getCurrentAdmin, createAdminSession, adminLogout, hashPassword, comparePassword } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Enregistrer les actions admin dans les logs d'audit
async function logAdminAction(adminId: string | null, action: string, details: string) {
  try {
    await db.query(
      `INSERT INTO admin_logs (admin_id, action, details) VALUES ($1, $2, $3)`,
      [adminId, action, details]
    );
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }
}

// 1. Authentification Admin
export async function adminLoginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    redirect('/admin/login?error=Veuillez remplir tous les champs.');
  }

  let errorRedirectUrl = '';
  try {
    const result = await db.query('SELECT * FROM admins WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      errorRedirectUrl = '/admin/login?error=Identifiants invalides.';
    } else {
      const admin = result.rows[0];
      const isMatch = await comparePassword(password, admin.password_hash);
      if (!isMatch) {
        errorRedirectUrl = '/admin/login?error=Identifiants invalides.';
      } else {
        await createAdminSession(admin.id);
        await logAdminAction(admin.id, 'login', `Connexion de l'administrateur ${username}`);
      }
    }
  } catch (err) {
    console.error('Admin login error:', err);
    errorRedirectUrl = '/admin/login?error=Une erreur technique est survenue.';
  }

  if (errorRedirectUrl) {
    redirect(errorRedirectUrl);
  } else {
    redirect('/admin');
  }
}

export async function adminLogoutAction() {
  const admin = await getCurrentAdmin();
  if (admin) {
    await logAdminAction(admin.id, 'logout', `Déconnexion de l'administrateur ${admin.username}`);
  }
  await adminLogout();
  redirect('/admin/login');
}

// 2. File de Modération
export async function adminResolveReportAction(
  reportId: string,
  action: 'dismiss' | 'block' | 'warn' | 'suspend' | 'ban',
  durationDays?: number
) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: 'Action non autorisée. Veuillez vous connecter.' };

  try {
    // Récupérer le signalement
    const reportRes = await db.query('SELECT * FROM reports WHERE id = $1', [reportId]);
    if (reportRes.rows.length === 0) return { error: 'Signalement introuvable.' };
    const report = reportRes.rows[0];

    // Trouver le userId de l'auteur du contenu
    let authorId: string | null = null;
    let contentType = '';
    let contentId = '';
    
    if (report.post_id) {
      contentType = 'post';
      contentId = report.post_id;
      const postRes = await db.query('SELECT user_id FROM posts WHERE id = $1', [report.post_id]);
      if (postRes.rows.length > 0) authorId = postRes.rows[0].user_id;
    } else if (report.comment_id) {
      contentType = 'comment';
      contentId = report.comment_id;
      const commentRes = await db.query('SELECT user_id FROM comments WHERE id = $1', [report.comment_id]);
      if (commentRes.rows.length > 0) authorId = commentRes.rows[0].user_id;
    }

    if (action === 'dismiss') {
      // Ignorer simplement le signalement
      await db.query("UPDATE reports SET status = 'dismissed' WHERE id = $1", [reportId]);
      
      // Si le contenu était au statut 'flagged', on le repasse en 'approved'
      if (contentType === 'post') {
        await db.query("UPDATE posts SET status = 'approved' WHERE id = $1", [contentId]);
      } else if (contentType === 'comment') {
        await db.query("UPDATE comments SET status = 'approved' WHERE id = $1", [contentId]);
      }

      await logAdminAction(admin.id, 'dismiss_report', `Signalement ${reportId} ignoré par l'admin.`);
    } else {
      // Bloquer le contenu incriminé
      if (contentType === 'post') {
        await db.query("UPDATE posts SET status = 'blocked' WHERE id = $1", [contentId]);
      } else if (contentType === 'comment') {
        await db.query("UPDATE comments SET status = 'blocked' WHERE id = $1", [contentId]);
      }

      await db.query("UPDATE reports SET status = 'resolved' WHERE id = $1", [reportId]);

      if (authorId) {
        if (action === 'block') {
          await logAdminAction(admin.id, 'block_content', `Contenu ${contentType} ${contentId} bloqué.`);
        } else if (action === 'warn') {
          await db.query("UPDATE users SET warning_count = warning_count + 1 WHERE id = $1", [authorId]);
          await logAdminAction(admin.id, 'warn_user', `Avertissement envoyé à l'utilisateur ${authorId} pour le contenu ${contentId}.`);
        } else if (action === 'suspend') {
          const days = durationDays || 7;
          const suspendedUntil = new Date();
          suspendedUntil.setDate(suspendedUntil.getDate() + days);
          await db.query(
            "UPDATE users SET status = 'suspended', suspended_until = $1 WHERE id = $2",
            [suspendedUntil, authorId]
          );
          await logAdminAction(admin.id, 'suspend_user', `Utilisateur ${authorId} suspendu pour ${days} jours.`);
        } else if (action === 'ban') {
          await db.query("UPDATE users SET status = 'banned' WHERE id = $1", [authorId]);
          await logAdminAction(admin.id, 'ban_user', `Utilisateur ${authorId} banni définitivement.`);
        }
      }
    }

    revalidatePath('/');
    revalidatePath('/admin/moderation');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    console.error('Resolve report error:', err);
    return { error: 'Erreur lors du traitement du signalement.' };
  }
}

// 3. Gestion des utilisateurs
export async function adminUpdateUserStatusAction(
  userId: string,
  action: 'warn' | 'suspend' | 'ban' | 'activate',
  durationDays?: number
) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: 'Action non autorisée.' };

  try {
    if (action === 'activate') {
      await db.query("UPDATE users SET status = 'active', suspended_until = NULL WHERE id = $1", [userId]);
      await logAdminAction(admin.id, 'activate_user', `Réactivation du compte utilisateur ${userId}`);
    } else if (action === 'warn') {
      await db.query("UPDATE users SET warning_count = warning_count + 1 WHERE id = $1", [userId]);
      await logAdminAction(admin.id, 'warn_user_direct', `Avertissement envoyé à l'utilisateur ${userId}`);
    } else if (action === 'suspend') {
      const days = durationDays || 7;
      const suspendedUntil = new Date();
      suspendedUntil.setDate(suspendedUntil.getDate() + days);
      await db.query(
        "UPDATE users SET status = 'suspended', suspended_until = $1 WHERE id = $2",
        [suspendedUntil, userId]
      );
      await logAdminAction(admin.id, 'suspend_user_direct', `Utilisateur ${userId} suspendu pour ${days} jours.`);
    } else if (action === 'ban') {
      await db.query("UPDATE users SET status = 'banned' WHERE id = $1", [userId]);
      await logAdminAction(admin.id, 'ban_user_direct', `Bannissement définitif de l'utilisateur ${userId}`);
    }

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    console.error('Update user status error:', err);
    return { error: 'Impossible de mettre à jour le statut de l\'utilisateur.' };
  }
}

export async function adminResetUserPasswordAction(userId: string) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: 'Action non autorisée.' };

  const tempPassword = `goumin_${Math.random().toString(36).substr(2, 6)}`;
  try {
    const hash = await hashPassword(tempPassword);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);
    await logAdminAction(admin.id, 'reset_password', `Réinitialisation du mot de passe de l'utilisateur ${userId}`);
    return { success: true, newPassword: tempPassword };
  } catch (err) {
    console.error('Reset password error:', err);
    return { error: 'Erreur lors de la réinitialisation.' };
  }
}

// 4. Gestion des cercles
export async function adminManageCircleAction(
  circleId: string,
  name: string,
  description: string,
  emoji: string,
  displayOrder: number,
  actionType: 'create' | 'update' | 'archive'
) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: 'Action non autorisée.' };

  try {
    if (actionType === 'create') {
      const generatedId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const check = await db.query('SELECT id FROM circles WHERE id = $1', [generatedId]);
      if (check.rows.length > 0) return { error: 'Cercle déjà existant avec ce nom.' };

      await db.query(
        `INSERT INTO circles (id, name, description, emoji, display_order, is_archived) 
         VALUES ($1, $2, $3, $4, $5, FALSE)`,
        [generatedId, name, description, emoji || '💬', displayOrder || 0]
      );
      await logAdminAction(admin.id, 'create_circle', `Cercle ${generatedId} créé.`);
    } else if (actionType === 'update') {
      await db.query(
        `UPDATE circles SET name = $1, description = $2, emoji = $3, display_order = $4 
         WHERE id = $5`,
        [name, description, emoji || '💬', displayOrder || 0, circleId]
      );
      await logAdminAction(admin.id, 'update_circle', `Cercle ${circleId} mis à jour.`);
    } else if (actionType === 'archive') {
      await db.query(`UPDATE circles SET is_archived = TRUE WHERE id = $1`, [circleId]);
      await logAdminAction(admin.id, 'archive_circle', `Cercle ${circleId} archivé.`);
    }

    revalidatePath('/');
    revalidatePath('/admin/circles');
    return { success: true };
  } catch (err) {
    console.error('Manage circle error:', err);
    return { error: 'Erreur lors de la gestion du cercle.' };
  }
}

export async function adminPinPostAction(postId: string, isPinned: boolean) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: 'Action non autorisée.' };

  try {
    await db.query('UPDATE posts SET is_pinned = $1 WHERE id = $2', [isPinned, postId]);
    await logAdminAction(admin.id, isPinned ? 'pin_post' : 'unpin_post', `Publication ${postId} ${isPinned ? 'épinglée' : 'désépinglée'}.`);
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Pin post error:', err);
    return { error: 'Erreur lors de l\'épinglage.' };
  }
}

// 5. Gestion des abonnements et paiements
export async function adminSimulateFailedPaymentRelance(subId: string) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: 'Action non autorisée.' };

  try {
    const subRes = await db.query(
      `SELECT subscriptions.*, users.username, users.identifier 
       FROM subscriptions 
       JOIN users ON subscriptions.user_id = users.id 
       WHERE subscriptions.id = $1`,
      [subId]
    );
    if (subRes.rows.length === 0) return { error: 'Abonnement non trouvé.' };
    const sub = subRes.rows[0];

    // Simuler l'envoi d'une alerte ou d'un email de relance de paiement
    await logAdminAction(
      admin.id,
      'payment_failed_relance',
      `Relance de paiement simulée envoyée à l'utilisateur ${sub.username} (${sub.identifier}) pour l'abonnement ${sub.unitech_payment_id}`
    );
    return { success: true };
  } catch (err) {
    console.error('Simulate payment relance error:', err);
    return { error: 'Erreur lors de la relance.' };
  }
}

// 6. Contenu éditorial Pro
export async function adminPublishProContentAction(
  type: 'citation' | 'audio' | 'text',
  title: string,
  content: string,
  audioUrl: string,
  publishAtStr: string
) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: 'Action non autorisée.' };

  if (!title || !type) {
    return { error: 'Veuillez renseigner un titre et un type.' };
  }

  try {
    const publishAt = publishAtStr ? new Date(publishAtStr) : new Date();
    await db.query(
      `INSERT INTO pro_contents (type, title, content, audio_url, publish_at) 
       VALUES ($1, $2, $3, $4, $5)`,
      [type, title, content || null, audioUrl || null, publishAt]
    );

    await logAdminAction(admin.id, 'publish_pro_content', `Publication de contenu Pro : ${title} (${type})`);
    revalidatePath('/pro');
    revalidatePath('/admin/editorial');
    return { success: true };
  } catch (err) {
    console.error('Publish pro content error:', err);
    return { error: 'Impossible de publier ce contenu.' };
  }
}
