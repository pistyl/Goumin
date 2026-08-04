import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import ModerationAdminClient from '@/components/ModerationAdminClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  // Fetch reports with detailed user metrics
  let reports: any[] = [];
  try {
    const result = await db.query(`
      SELECT 
        reports.*,
        reporters.username as reporter_username,
        posts.content as post_content,
        comments.content as comment_content,
        COALESCE(post_authors.username, comment_authors.username) as author_username,
        COALESCE(post_authors.id, comment_authors.id) as author_id,
        (
          SELECT COUNT(*) 
          FROM reports r2
          LEFT JOIN posts p2 ON r2.post_id = p2.id
          LEFT JOIN comments c2 ON r2.comment_id = c2.id
          WHERE COALESCE(p2.user_id, c2.user_id) = COALESCE(post_authors.id, comment_authors.id)
            AND r2.id <> reports.id
        ) as author_previous_reports_count
      FROM reports
      LEFT JOIN users reporters ON reports.reporter_id = reporters.id
      LEFT JOIN posts ON reports.post_id = posts.id
      LEFT JOIN comments ON reports.comment_id = comments.id
      LEFT JOIN users post_authors ON posts.user_id = post_authors.id
      LEFT JOIN users comment_authors ON comments.user_id = comment_authors.id
      ORDER BY reports.created_at DESC
    `);
    
    reports = result.rows.map(row => ({
      id: row.id,
      reporter_username: row.reporter_username || 'Système',
      post_id: row.post_id,
      comment_id: row.comment_id,
      reason: row.reason,
      status: row.status,
      created_at: row.created_at.toISOString(),
      post_content: row.post_content,
      comment_content: row.comment_content,
      author_username: row.author_username || 'Inconnu/Anonyme',
      author_id: row.author_id,
      author_previous_reports_count: parseInt(row.author_previous_reports_count || '0')
    }));
  } catch (err) {
    console.error('Error fetching admin reports:', err);
  }

  return <ModerationAdminClient reports={reports} adminUsername={admin.username} />;
}
