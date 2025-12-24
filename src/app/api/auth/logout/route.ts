import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body?.token;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Remove session from database
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.execute(
        'DELETE FROM user_sessions WHERE session_token = ?',
        [token]
      );
      connection.release();

      console.log('[API] User logged out successfully');
      
      return NextResponse.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (dbError: any) {
      if (connection) {
        connection.release();
      }
      console.error('[API] Logout database error:', dbError);
      // Still return success if token doesn't exist (idempotent)
      return NextResponse.json({
        success: true,
        message: 'Logged out successfully'
      });
    }

  } catch (error: any) {
    console.error('[API] Logout error:', error);
    console.error('[API] Error stack:', error?.stack);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}
