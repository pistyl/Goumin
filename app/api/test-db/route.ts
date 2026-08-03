import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const res = await db.query('SELECT NOW()');
    return NextResponse.json({ 
      success: true, 
      time: res.rows[0].now,
      database_url_configured: !!process.env.DATABASE_URL
    });
  } catch (error: any) {
    console.error('Database Connection Test Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack,
      database_url_configured: !!process.env.DATABASE_URL
    }, { status: 500 });
  }
}
