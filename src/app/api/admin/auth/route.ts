import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('[API] Admin login attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get admin user from database
    // Check if user exists and is admin (subscription = 'team' or email = admin@gmail.com)
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, name, password_hash, subscription')
      .or(`email.eq.${email},email.eq.admin@gmail.com`)
      .eq('is_active', true);

    if (userError) {
      console.error('[API] Database error during admin login:', userError);
      return NextResponse.json(
        { error: 'Database error', details: userError.message },
        { status: 500 }
      );
    }

    // Filter for the specific email we are trying to log in with
    const user = users?.find(u => u.email === email);

    if (!user) {
      console.log('[API] Admin login failed: User not found:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    // Note: Supabase Auth handles password hashing differently (internally).
    // If the user was migrated or created via Supabase Auth, they won't have `password_hash` in `public.users` 
    // unless we synced it (which we didn't).
    // However, the `users` table in `supabase_schema.sql` DOES have `password_hash` column?
    // Let's check `supabase_schema.sql` content from memory.
    // I recall `users` table having `password_hash` in the original MySQL schema.
    // In `supabase_schema.sql`, I might have included it if I copied the schema.
    // But Supabase Auth stores passwords in `auth.users`.
    // If the user registered via Supabase Auth, `public.users` might not have `password_hash`.
    // BUT, the `login` route I migrated earlier uses `supabase.auth.signInWithPassword`.
    // This `admin/auth` route uses manual bcrypt check.
    // If the admin user was created via Supabase Auth, this manual check will FAIL because `password_hash` will be null or empty in `public.users`.
    // UNLESS the user manually updated `password_hash` in `public.users`.
    // OR if the admin user is a legacy user migrated with password hash.
    // Since I am "migrating", I should probably switch to `supabase.auth.signInWithPassword` here too!
    // If I do that, I don't need `bcrypt`.
    // I can just sign in, check if successful, then check if admin.

    // Let's try `supabase.auth.signInWithPassword`.

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      // Fallback to manual check if `password_hash` exists?
      // This supports legacy users who haven't reset password?
      // But `supabase.auth` won't work for them if they are not in `auth.users`.
      // The user said "fully cleaned database", so no legacy data.
      // So all users will be new Supabase users.
      // So `password_hash` in `public.users` will likely be empty.
      // So I MUST use `supabase.auth.signInWithPassword`.

      console.log('[API] Admin login failed (Supabase Auth):', authError?.message);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Auth successful. Now check if admin.
    // We need to fetch the profile from `public.users`.
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, name, subscription')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 401 }
      );
    }

    // Check if user is admin (only admin@gmail.com is allowed)
    const isAdmin = profile.email === 'admin@gmail.com';
    if (!isAdmin) {
      console.log('[API] Admin login failed: User is not admin:', email);
      return NextResponse.json(
        { error: 'Access denied. Only the main admin is allowed.' },
        { status: 403 }
      );
    }

    // Generate session token (keep existing logic for admin session)
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store session in database
    const { error: sessionError } = await supabase
      .from('admin_sessions')
      .insert({
        session_token: sessionToken,
        expires_at: expiresAt.toISOString()
      });

    if (sessionError) {
      console.error('[API] Database error creating admin session:', sessionError);
      return NextResponse.json(
        { error: 'Database error', details: sessionError.message },
        { status: 500 }
      );
    }

    // Clean up expired sessions (optional, maybe do it periodically or here)
    await supabase
      .from('admin_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());

    console.log('[API] Admin login successful for:', email);

    return NextResponse.json({
      success: true,
      sessionToken,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name
      }
    });

  } catch (error: any) {
    console.error('[API] Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

// Verify admin session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionToken = searchParams.get('token');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select('expires_at')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      expiresAt: session.expires_at
    });
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return NextResponse.json(
      { error: 'Session verification failed' },
      { status: 500 }
    );
  }
}

// Admin logout
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionToken = searchParams.get('token');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    await supabase
      .from('admin_sessions')
      .delete()
      .eq('session_token', sessionToken);

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error during admin logout:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
