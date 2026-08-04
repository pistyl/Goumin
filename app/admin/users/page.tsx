import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import AdminLayoutClient from '@/components/AdminLayoutClient';
import UsersAdminClient from '@/components/UsersAdminClient';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: { search?: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const search = searchParams.search || '';

  // Query users matching search
  let users: any[] = [];
  try {
    const queryStr = search
      ? `SELECT * FROM users WHERE username ILIKE $1 OR identifier ILIKE $1 ORDER BY created_at DESC`
      : `SELECT * FROM users ORDER BY created_at DESC LIMIT 50`;
    const params = search ? [`%${search}%`] : [];
    
    const result = await db.query(queryStr, params);
    
    // For each user, retrieve stats (without querying journal_entries)
    users = await Promise.all(result.rows.map(async (row) => {
      const postsCountRes = await db.query('SELECT COUNT(*) FROM posts WHERE user_id = $1', [row.id]);
      const commentsCountRes = await db.query('SELECT COUNT(*) FROM comments WHERE user_id = $1', [row.id]);
      
      const reportsReceivedRes = await db.query(`
        SELECT COUNT(*) FROM reports 
        LEFT JOIN posts ON reports.post_id = posts.id
        LEFT JOIN comments ON reports.comment_id = comments.id
        WHERE posts.user_id = $1 OR comments.user_id = $1
      `, [row.id]);

      const reportsSentRes = await db.query('SELECT COUNT(*) FROM reports WHERE reporter_id = $1', [row.id]);
      
      // Fetch mod logs regarding this user (e.g. suspension, warnings, ban logs)
      const logsRes = await db.query(
        `SELECT * FROM admin_logs WHERE details ILIKE $1 ORDER BY created_at DESC`,
        [`%${row.id}%`]
      );

      return {
        id: row.id,
        username: row.username,
        identifier: row.identifier,
        subscription_tier: row.subscription_tier,
        trust_contact: row.trust_contact,
        current_step: row.current_step,
        status: row.status || 'active',
        suspended_until: row.suspended_until ? row.suspended_until.toISOString() : null,
        warning_count: parseInt(row.warning_count || '0'),
        created_at: row.created_at.toISOString(),
        posts_count: parseInt(postsCountRes.rows[0].count),
        comments_count: parseInt(commentsCountRes.rows[0].count),
        reports_received: parseInt(reportsReceivedRes.rows[0].count),
        reports_sent: parseInt(reportsSentRes.rows[0].count),
        mod_history: logsRes.rows.map(l => ({
          action: l.action,
          details: l.details,
          created_at: l.created_at.toISOString()
        }))
      };
    }));
  } catch (err) {
    console.error('Error fetching admin users:', err);
  }

  return (
    <AdminLayoutClient adminUsername={admin.username}>
      <UsersAdminClient initialUsers={users} search={search} />
    </AdminLayoutClient>
  );
}
