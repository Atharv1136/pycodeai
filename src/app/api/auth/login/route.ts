import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('[API] Login attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.log('[API] Supabase login failed:', authError.message);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Login failed: No user returned' },
        { status: 500 }
      );
    }

    // Fetch user profile from public.users
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('[API] Failed to fetch user profile:', profileError);
      // Fallback to auth data if profile missing (shouldn't happen if signup works)
    }

    console.log('[API] Login successful for user:', email);

    return NextResponse.json({
      success: true,
      token: authData.session?.access_token, // Return access token as "token" for compatibility
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: userProfile?.name || authData.user.user_metadata?.name,
        subscription: userProfile?.subscription || 'free',
        credits: userProfile?.credits || 0,
        creditLimit: userProfile?.credit_limit || 100,
        codeRuns: userProfile?.code_runs || 0,
        aiQueries: userProfile?.ai_queries || 0,
        createdAt: userProfile?.created_at || authData.user.created_at,
        lastActive: userProfile?.last_active,
        isActive: userProfile?.is_active ?? true,
        profileComplete: userProfile?.profile_complete || false
      }
    });

  } catch (error: any) {
    console.error('[API] Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
