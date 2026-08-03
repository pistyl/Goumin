import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import ModerationAdminClient from '@/components/ModerationAdminClient';

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  // Récupérer tous les signalements avec les détails des contenus incriminés
  let reportsResult;
  try {
    reportsResult = await db.query(`
      SELECT 
        reports.*,
        reporters.username as reporter_username,
        posts.content as post_content,
        comments.content as comment_content,
        COALESCE(post_authors.username, comment_authors.username) as author_username
      FROM reports
      LEFT JOIN users reporters ON reports.reporter_id = reporters.id
      LEFT JOIN posts ON reports.post_id = posts.id
      LEFT JOIN comments ON reports.comment_id = comments.id
      LEFT JOIN users post_authors ON posts.user_id = post_authors.id
      LEFT JOIN users comment_authors ON comments.user_id = comment_authors.id
      ORDER BY reports.created_at DESC
    `);
  } catch (err) {
    console.error('Error fetching admin reports:', err);
    reportsResult = { rows: [] };
  }

  const reports = reportsResult.rows.map(row => ({
    id: row.id,
    reporter_username: row.reporter_username,
    post_id: row.post_id,
    comment_id: row.comment_id,
    reason: row.reason,
    status: row.status,
    created_at: row.created_at.toISOString(),
    post_content: row.post_content,
    comment_content: row.comment_content,
    author_username: row.author_username
  }));

  return <ModerationAdminClient reports={reports} />;
}
