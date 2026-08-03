import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import SosClient from '@/components/SosClient';

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  return <SosClient user={user} />;
}
