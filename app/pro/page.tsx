import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import ProClient from '@/components/ProClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  let contents: any[] = [];
  try {
    const res = await db.query(
      "SELECT * FROM pro_contents WHERE publish_at <= NOW() ORDER BY publish_at DESC"
    );
    contents = res.rows.map(row => ({
      id: row.id,
      type: row.type,
      title: row.title,
      content: row.content || '',
      audio_url: row.audio_url || '',
      publish_at: row.publish_at.toISOString()
    }));
  } catch (err) {
    console.error('Error fetching pro content:', err);
  }

  return <ProClient user={user} initialContents={contents} />;
}
