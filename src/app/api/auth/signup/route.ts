import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Signup endpoint
 * POST /api/auth/signup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, subscription = 'free' } = body;

    console.log('[API] Signup attempt via /api/auth/signup for email:', email);

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          subscription,
        },
      },
    });

    if (authError) {
      console.error('[API] Supabase signup error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Signup failed: No user returned' },
        { status: 500 }
      );
    }

    // 2. Create public user record (if not handled by trigger)
    // We'll try to insert/update just in case the trigger didn't fire or we want to ensure data
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email: email,
        name: name,
        subscription: subscription,
        credits: subscription === 'pro' ? 1000 : (subscription === 'team' ? 5000 : 100),
        credit_limit: subscription === 'pro' ? 1000 : (subscription === 'team' ? 5000 : 100),
        is_active: true
      });

    if (profileError) {
      console.error('[API] Profile creation error:', profileError);
      // Don't fail the whole request if auth succeeded, but log it
    }

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: name,
        subscription: subscription,
      },
      message: 'User created successfully'
    });

  } catch (error: any) {
    console.error('[API] Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

