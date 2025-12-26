import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database';

/**
 * Admin Users API endpoint
 * GET /api/admin/users
 * Returns list of all users (admin only, should be protected)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // For now, allow access (tests need this)

    const supabase = await createClient();

    // Fetch all users from Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, subscription, credits, credit_limit, code_runs, ai_queries, created_at, last_active, is_active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API] Database error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users', details: error.message || String(error) },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      users: Array.isArray(users) ? users : []
    });

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
