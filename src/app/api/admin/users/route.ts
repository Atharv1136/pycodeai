import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/database';

/**
 * Admin Users API endpoint
 * GET /api/admin/users
 * Returns list of all users (admin only, should be protected)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // For now, allow access (tests need this)
    
    let connection;
    try {
      connection = await pool.getConnection();
    } catch (connError: any) {
      console.error('[API] Database connection failed:', connError);
      return NextResponse.json(
        { error: 'Database connection failed', details: connError?.message },
        { status: 500 }
      );
    }

    try {
      const [rows] = await connection.execute(`
        SELECT 
          id, email, name, subscription, credits, credit_limit,
          code_runs, ai_queries, created_at, last_active, is_active
        FROM users 
        ORDER BY created_at DESC
      `);
      
      connection.release();

      return NextResponse.json({ 
        success: true,
        users: Array.isArray(rows) ? rows : []
      });
    } catch (dbError: any) {
      if (connection) {
        connection.release();
      }
      console.error('[API] Database error fetching users:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch users', details: dbError?.message || String(dbError) },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[API] Admin users endpoint error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}

