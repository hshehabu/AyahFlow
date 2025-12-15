import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

/**
 * One-time database initialization endpoint
 * Call this once after deployment to set up the database schema
 * Then delete this file for security
 */
export async function GET() {
  try {
    await initDatabase();
    return NextResponse.json({ 
      ok: true, 
      message: 'Database initialized successfully' 
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: String(error) },
      { status: 500 }
    );
  }
}

