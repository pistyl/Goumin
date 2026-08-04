import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import AdminLayoutClient from '@/components/AdminLayoutClient';
import PaymentsAdminClient from '@/components/PaymentsAdminClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  // 1. Fetch payment metrics
  let proCount = 0;
  let waveBalance = 0;
  let omBalance = 0;

  try {
    const proRes = await db.query("SELECT COUNT(*) FROM users WHERE subscription_tier = 'pro'");
    proCount = parseInt(proRes.rows[0].count);

    const waveRes = await db.query("SELECT balance FROM merchant_balances WHERE id = 'sold_wave'");
    if (waveRes.rows.length > 0) waveBalance = parseFloat(waveRes.rows[0].balance);

    const omRes = await db.query("SELECT balance FROM merchant_balances WHERE id = 'sold_om'");
    if (omRes.rows.length > 0) omBalance = parseFloat(omRes.rows[0].balance);
  } catch (err) {
    console.error('Error fetching admin payment stats:', err);
  }

  // 2. Fetch all transactions (subscriptions records)
  let transactions: any[] = [];
  try {
    const txRes = await db.query(`
      SELECT 
        subscriptions.*, 
        users.username, 
        users.identifier 
      FROM subscriptions 
      JOIN users ON subscriptions.user_id = users.id 
      ORDER BY subscriptions.created_at DESC
    `);
    
    transactions = txRes.rows.map(row => ({
      id: row.id,
      username: row.username,
      identifier: row.identifier,
      payment_method: row.payment_method || 'Wave',
      unitech_payment_id: row.unitech_payment_id || 'test_ref',
      amount: parseFloat(row.amount),
      status: row.status,
      created_at: row.created_at.toISOString(),
      ends_at: row.ends_at.toISOString()
    }));
  } catch (err) {
    console.error('Error fetching admin transactions:', err);
  }

  return (
    <AdminLayoutClient adminUsername={admin.username}>
      <PaymentsAdminClient 
        proCount={proCount}
        waveBalance={waveBalance}
        omBalance={omBalance}
        transactions={transactions}
      />
    </AdminLayoutClient>
  );
}
