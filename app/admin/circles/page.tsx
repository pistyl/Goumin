import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import AdminLayoutClient from '@/components/AdminLayoutClient';
import CirclesAdminClient from '@/components/CirclesAdminClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  // 1. Fetch circles with calculated metrics
  let circles: any[] = [];
  try {
    const circlesRes = await db.query('SELECT * FROM circles WHERE is_archived = FALSE ORDER BY display_order ASC, created_at ASC');
    
    circles = await Promise.all(circlesRes.rows.map(async (circle) => {
      const membersRes = await db.query(
        `SELECT COUNT(DISTINCT user_id) FROM posts WHERE circle_id = $1`,
        [circle.id]
      );
      
      const posts7dRes = await db.query(
        `SELECT COUNT(*) FROM posts WHERE circle_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`,
        [circle.id]
      );

      const posts30dRes = await db.query(
        `SELECT COUNT(*) FROM posts WHERE circle_id = $1 AND created_at >= NOW() - INTERVAL '30 days'`,
        [circle.id]
      );

      const reportsRes = await db.query(
        `SELECT COUNT(*) FROM reports 
         JOIN posts ON reports.post_id = posts.id 
         WHERE posts.circle_id = $1`,
        [circle.id]
      );

      return {
        id: circle.id,
        name: circle.name,
        description: circle.description,
        emoji: circle.emoji || '💬',
        display_order: parseInt(circle.display_order || '0'),
        members_count: parseInt(membersRes.rows[0].count),
        posts_7d: parseInt(posts7dRes.rows[0].count),
        posts_30d: parseInt(posts30dRes.rows[0].count),
        reports_count: parseInt(reportsRes.rows[0].count)
      };
    }));
  } catch (err) {
    console.error('Error fetching admin circles:', err);
  }

  // 2. Fetch posts available for pinning
  let posts: any[] = [];
  try {
    const postsRes = await db.query(`
      SELECT posts.*, users.username 
      FROM posts 
      LEFT JOIN users ON posts.user_id = users.id 
      WHERE posts.status = 'approved' 
      ORDER BY posts.is_pinned DESC, posts.created_at DESC
    `);
    posts = postsRes.rows.map(row => ({
      id: row.id,
      circle_id: row.circle_id,
      content: row.content,
      is_pinned: row.is_pinned,
      username: row.username || 'Anonyme',
      created_at: row.created_at.toISOString()
    }));
  } catch (err) {
    console.error('Error fetching posts for pin management:', err);
  }

  return (
    <AdminLayoutClient adminUsername={admin.username}>
      <CirclesAdminClient initialCircles={circles} posts={posts} />
    </AdminLayoutClient>
  );
}
