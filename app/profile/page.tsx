import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import ProfileClient from '@/components/ProfileClient';

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  // Récupérer les statistiques d'activité de l'utilisateur pour l'attribution des badges
  let postsCount = 0;
  let commentsCount = 0;
  let reactionsCount = 0;
  let journalCount = 0;

  try {
    const postsRes = await db.query('SELECT COUNT(*) FROM posts WHERE user_id = $1', [user.id]);
    postsCount = parseInt(postsRes.rows[0].count);

    const commentsRes = await db.query('SELECT COUNT(*) FROM comments WHERE user_id = $1', [user.id]);
    commentsCount = parseInt(commentsRes.rows[0].count);

    const reactionsRes = await db.query('SELECT COUNT(*) FROM reactions WHERE user_id = $1', [user.id]);
    reactionsCount = parseInt(reactionsRes.rows[0].count);

    const journalRes = await db.query('SELECT COUNT(*) FROM journal_entries WHERE user_id = $1', [user.id]);
    journalCount = parseInt(journalRes.rows[0].count);
  } catch (err) {
    console.error('Error fetching profile stats:', err);
  }

  const stats = {
    postsCount,
    commentsCount,
    reactionsCount,
    journalCount
  };

  return <ProfileClient user={user} stats={stats} />;
}
