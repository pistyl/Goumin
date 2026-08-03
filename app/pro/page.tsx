import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import ProClient from '@/components/ProClient';

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  return <ProClient user={user} />;
}
