'use server';

import { db } from '@/lib/db';
import { hashPassword, comparePassword, createSession, logout, getCurrentUser } from '@/lib/auth';
import { checkSensitiveContent, CRISIS_RESOURCES } from '@/lib/moderation';
import { revalidatePath } from 'next/cache';
import { createPaymentRequest } from '@/lib/unitechpay';
import { redirect } from 'next/navigation';

// Authentification
export async function signUpAction(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const identifier = formData.get('identifier') as string; // email ou téléphone
  const password = formData.get('password') as string;
  const selectedCircles = formData.getAll('circles') as string[];

  if (!username || !identifier || !password) {
    return { error: 'Veuillez remplir tous les champs obligatoires.' };
  }

    let success = false;
    try {
      // Vérifier si le pseudo ou identifiant existe déjà
      const checkUser = await db.query(
        'SELECT id FROM users WHERE username = $1 OR identifier = $2',
        [username, identifier]
      );
      if (checkUser.rows.length > 0) {
        return { error: 'Ce pseudo ou identifiant est déjà utilisé par un autre membre.' };
      }

      const passwordHash = await hashPassword(password);

      // Insérer l'utilisateur
      const result = await db.query(
        `INSERT INTO users (username, identifier, password_hash) 
         VALUES ($1, $2, $3) RETURNING id`,
        [username, identifier, passwordHash]
      );
      const userId = result.rows[0].id;

      // Créer la session
      await createSession(userId);

      // Si l'utilisateur s'inscrit à des cercles initiaux
      if (selectedCircles && selectedCircles.length > 0) {
        for (const circleId of selectedCircles) {
          // On peut enregistrer l'adhésion si on gère une table d'adhésions. 
          // En V1, l'inscription aux cercles est globale et sert à l'affichage,
          // les publications restent publiques pour tous.
        }
      }

      success = true;
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error: 'Une erreur technique est survenue lors de la création de ton compte.' };
    }

    if (success) {
      redirect('/');
    }
}

export async function loginAction(prevState: any, formData: FormData) {
  const identifier = formData.get('identifier') as string;
  const password = formData.get('password') as string;

  if (!identifier || !password) {
    return { error: 'Veuillez remplir tous les champs.' };
  }

  let success = false;
  try {
    const result = await db.query(
      'SELECT id, password_hash FROM users WHERE identifier = $1 OR username = $1',
      [identifier]
    );

    if (result.rows.length === 0) {
      return { error: 'Pseudo / identifiant ou mot de passe incorrect.' };
    }

    const user = result.rows[0];
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return { error: 'Pseudo / identifiant ou mot de passe incorrect.' };
    }

    await createSession(user.id);
    success = true;
  } catch (error: any) {
    console.error('Login error:', error);
    return { error: 'Erreur lors de la connexion.' };
  }

  if (success) {
    redirect('/');
  }
}

export async function logoutAction() {
  await logout();
  redirect('/');
}

// Publications & Cercles
export async function createPostAction(circleId: string, content: string, isAnonym: boolean) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Non connecté. Connecte-toi d\'abord.' };

  if (!content || content.trim() === '') {
    return { error: 'Le contenu de ta publication ne peut pas être vide.' };
  }

  const isSensitive = checkSensitiveContent(content);
  const status = isSensitive ? 'flagged' : 'approved';

  try {
    const result = await db.query(
      `INSERT INTO posts (circle_id, user_id, content, is_anonym, status) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [circleId, user.id, content, isAnonym, status]
    );

    if (isSensitive) {
      // Signaler automatiquement
      await db.query(
        `INSERT INTO reports (reporter_id, post_id, reason) 
         VALUES ($1, $2, $3)`,
        [user.id, result.rows[0].id, 'Dépistage automatique de crise psychologique']
      );

      return {
        sensitive: true,
        resources: CRISIS_RESOURCES,
        trustContact: user.trust_contact
      };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Create post error:', error);
    return { error: 'Impossible de publier le message.' };
  }
}

export async function toggleReactionAction(postId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Non connecté.' };

  try {
    const existing = await db.query(
      `SELECT id FROM reactions WHERE post_id = $1 AND user_id = $2`,
      [postId, user.id]
    );

    if (existing.rows.length > 0) {
      await db.query(
        `DELETE FROM reactions WHERE post_id = $1 AND user_id = $2`,
        [postId, user.id]
      );
    } else {
      await db.query(
        `INSERT INTO reactions (post_id, user_id) VALUES ($1, $2)`,
        [postId, user.id]
      );
    }

    revalidatePath('/');
    revalidatePath(`/post/${postId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Toggle reaction error:', error);
    return { error: 'Erreur lors de la réaction.' };
  }
}

export async function createCommentAction(postId: string, content: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Non connecté.' };

  if (!content || content.trim() === '') {
    return { error: 'Le commentaire ne peut pas être vide.' };
  }

  const isSensitive = checkSensitiveContent(content);
  const status = isSensitive ? 'flagged' : 'approved';

  try {
    const result = await db.query(
      `INSERT INTO comments (post_id, user_id, content, status) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [postId, user.id, content, status]
    );

    if (isSensitive) {
      await db.query(
        `INSERT INTO reports (reporter_id, comment_id, reason) 
         VALUES ($1, $2, $3)`,
        [user.id, result.rows[0].id, 'Dépistage automatique de crise sur un commentaire']
      );

      return {
        sensitive: true,
        resources: CRISIS_RESOURCES,
        trustContact: user.trust_contact
      };
    }

    revalidatePath(`/post/${postId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Create comment error:', error);
    return { error: 'Erreur lors de l\'ajout du commentaire.' };
  }
}

export async function toggleCommentPassedHereAction(commentId: string, postId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Non connecté.' };

  try {
    await db.query(
      `UPDATE comments SET is_passed_here = NOT is_passed_here WHERE id = $1`,
      [commentId]
    );
    revalidatePath(`/post/${postId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Toggle comment passed here error:', error);
    return { error: 'Erreur lors de la notation du commentaire.' };
  }
}

// Profil / Progression
export async function updateStepAction(step: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Non connecté.' };

  const validSteps = ['Choc', 'Colère', 'Marchandage', 'Tristesse', 'Acceptation'];
  if (!validSteps.includes(step)) return { error: 'Étape de deuil invalide.' };

  try {
    await db.query(`UPDATE users SET current_step = $1 WHERE id = $2`, [step, user.id]);
    revalidatePath('/');
    revalidatePath('/profile');
    return { success: true };
  } catch (error: any) {
    console.error('Update step error:', error);
    return { error: 'Erreur de mise à jour de l\'étape.' };
  }
}

export async function updateSettingsAction(trustContact: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Non connecté.' };

  try {
    await db.query(`UPDATE users SET trust_contact = $1 WHERE id = $2`, [trustContact, user.id]);
    revalidatePath('/profile');
    return { success: true };
  } catch (error: any) {
    console.error('Update settings error:', error);
    return { error: 'Erreur lors de l\'enregistrement des paramètres.' };
  }
}

// Signalement modération
export async function reportContentAction(postId: string | null, commentId: string | null, reason: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Non connecté.' };

  try {
    await db.query(
      `INSERT INTO reports (reporter_id, post_id, comment_id, reason) 
       VALUES ($1, $2, $3, $4)`,
      [user.id, postId, commentId, reason]
    );
    return { success: true };
  } catch (error: any) {
    console.error('Report content error:', error);
    return { error: 'Impossible d\'envoyer le signalement.' };
  }
}

// Journal Actions
export async function createJournalEntryAction(prompt: string, content: string, moodScore: number) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Non connecté.' };

  if (!content || content.trim() === '') {
    return { error: 'Le contenu de ton journal ne peut pas être vide.' };
  }

  try {
    // Vérification de limite Simple : 1 seule entrée par jour glissant
    if (user.subscription_tier !== 'pro') {
      const todayResult = await db.query(
        `SELECT id FROM journal_entries 
         WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '1 day'`,
        [user.id]
      );
      if (todayResult.rows.length > 0) {
        return { 
          error: 'limit_reached',
          message: 'En mode gratuit, tu es limité·e à 1 entrée par jour. Passe en Pro pour écrire sans limites !' 
        };
      }
    }

    await db.query(
      `INSERT INTO journal_entries (user_id, prompt, content, mood_score) 
       VALUES ($1, $2, $3, $4)`,
      [user.id, prompt, content, moodScore]
    );

    revalidatePath('/journal');
    return { success: true };
  } catch (error: any) {
    console.error('Create journal entry error:', error);
    return { error: 'Erreur lors de la sauvegarde de l\'entrée de journal.' };
  }
}

// Cercles privés (Uniquement Pro)
export async function createPrivateCircleAction(name: string, description: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Non connecté.' };
  if (user.subscription_tier !== 'pro') {
    return { error: 'Cette fonctionnalité requiert un abonnement Pro. Débloque le mode Pro pour créer tes propres cercles !' };
  }

  if (!name || !description) {
    return { error: 'Veuillez remplir tous les champs.' };
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const check = await db.query('SELECT id FROM circles WHERE id = $1', [id]);
    if (check.rows.length > 0) {
      return { error: 'Un cercle avec ce nom existe déjà.' };
    }

    await db.query(
      `INSERT INTO circles (id, name, description) VALUES ($1, $2, $3)`,
      [id, name, description]
    );

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Create private circle error:', error);
    return { error: 'Impossible de créer ce cercle privé.' };
  }
}

// Souscription Pro
export async function subscribeProAction(method: 'wave' | 'om', phone: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Non connecté.' };

  if (!phone || phone.trim() === '') {
    return { error: 'Veuillez saisir un numéro de téléphone valide.' };
  }

  try {
    const res = await createPaymentRequest(user.id, method, phone);
    if (res.success && res.payment_url) {
      return { success: true, paymentUrl: res.payment_url };
    } else {
      return { error: res.error || 'Erreur lors de la création de la transaction de paiement.' };
    }
  } catch (error: any) {
    console.error('Subscribe pro action error:', error);
    return { error: 'Une erreur technique est survenue lors de l\'initialisation de ton paiement.' };
  }
}

// Administration Modération
export async function adminResolveReportAction(reportId: string, action: 'approve' | 'block') {
  const user = await getCurrentUser();
  if (!user) return { error: 'Non connecté.' };

  try {
    const reportRes = await db.query('SELECT * FROM reports WHERE id = $1', [reportId]);
    if (reportRes.rows.length === 0) return { error: 'Signalement non trouvé.' };

    const report = reportRes.rows[0];

    if (action === 'approve') {
      if (report.post_id) {
        await db.query(`UPDATE posts SET status = 'approved' WHERE id = $1`, [report.post_id]);
      } else if (report.comment_id) {
        await db.query(`UPDATE comments SET status = 'approved' WHERE id = $1`, [report.comment_id]);
      }
      await db.query(`UPDATE reports SET status = 'dismissed' WHERE id = $1`, [reportId]);
    } else if (action === 'block') {
      if (report.post_id) {
        await db.query(`UPDATE posts SET status = 'blocked' WHERE id = $1`, [report.post_id]);
      } else if (report.comment_id) {
        await db.query(`UPDATE comments SET status = 'blocked' WHERE id = $1`, [report.comment_id]);
      }
      await db.query(`UPDATE reports SET status = 'resolved' WHERE id = $1`, [reportId]);
    }

    revalidatePath('/');
    revalidatePath('/admin/moderation');
    return { success: true };
  } catch (error: any) {
    console.error('Admin resolve report error:', error);
    return { error: 'Erreur lors de la résolution du signalement.' };
  }
}
