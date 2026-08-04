import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import AuthContainer from '@/components/AuthContainer';
import HomeClient from '@/components/HomeClient';

export default async function Page() {
  const user = await getCurrentUser();

  // Récupérer les cercles de base pour l'inscription (au moins les 4 imposés)
  let circlesResult;
  try {
    circlesResult = await db.query('SELECT * FROM circles WHERE is_archived = FALSE ORDER BY display_order ASC, created_at ASC');
  } catch (err) {
    console.error('Error fetching circles:', err);
    circlesResult = { rows: [] };
  }
  
  const circles = circlesResult.rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    emoji: row.emoji || '💬'
  }));

  if (!user) {
    // Si l'utilisateur n'est pas connecté, afficher le formulaire d'onboarding / authentification
    return <AuthContainer circles={circles} />;
  }

  // Si l'utilisateur est connecté, charger le fil de publications approuvées
  let postsResult;
  try {
    postsResult = await db.query(
      `SELECT 
        posts.*, 
        users.username, 
        users.subscription_tier,
        (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id AND comments.status = 'approved') as comment_count,
        (SELECT COUNT(*) FROM reactions WHERE reactions.post_id = posts.id) as reaction_count,
        EXISTS(SELECT 1 FROM reactions WHERE reactions.post_id = posts.id AND reactions.user_id = $1) as user_reacted
       FROM posts 
       LEFT JOIN users ON posts.user_id = users.id 
       WHERE posts.status = 'approved' 
       ORDER BY posts.is_pinned DESC, posts.created_at DESC`,
      [user.id]
    );
  } catch (err) {
    console.error('Error fetching posts:', err);
    postsResult = { rows: [] };
  }

  const posts = postsResult.rows.map(row => ({
    id: row.id,
    circle_id: row.circle_id,
    user_id: row.user_id,
    content: row.content,
    is_anonym: row.is_anonym,
    is_pinned: row.is_pinned,
    status: row.status,
    created_at: row.created_at.toISOString(),
    username: row.username,
    subscription_tier: row.subscription_tier,
    comment_count: parseInt(row.comment_count),
    reaction_count: parseInt(row.reaction_count),
    user_reacted: row.user_reacted
  }));

  return <HomeClient user={user} circles={circles} posts={posts} />;
}
