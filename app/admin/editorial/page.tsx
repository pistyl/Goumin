import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import AdminLayoutClient from '@/components/AdminLayoutClient';
import EditorialAdminClient from '@/components/EditorialAdminClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  // Fetch published/scheduled pro contents
  let contents: any[] = [];
  try {
    const contentsRes = await db.query('SELECT * FROM pro_contents ORDER BY publish_at DESC');
    contents = contentsRes.rows.map(row => ({
      id: row.id,
      type: row.type,
      title: row.title,
      content: row.content || '',
      audio_url: row.audio_url || '',
      publish_at: row.publish_at.toISOString(),
      created_at: row.created_at.toISOString()
    }));
  } catch (err) {
    console.error('Error fetching pro contents:', err);
  }

  return (
    <AdminLayoutClient adminUsername={admin.username}>
      <EditorialAdminClient initialContents={contents} />
    </AdminLayoutClient>
  );
}
