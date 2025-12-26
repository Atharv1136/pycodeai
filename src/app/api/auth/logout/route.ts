import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Sign out using Supabase Auth - this automatically handles session cleanup
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[API] Logout error:', error);
      // Still return success for idempotency
      return NextResponse.json({
        success: true,
        message: 'Logged out successfully'
      });
    }

    console.log('[API] User logged out successfully');

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

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
