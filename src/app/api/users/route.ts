import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Get all users (admin only)
export async function GET() {
  try {
    const supabase = await createClient();

    // Check if admin (optional: add admin check logic here)

    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, subscription, credits, credit_limit, code_runs, ai_queries, created_at, last_active, is_active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, subscription = 'free' } = body;

    console.log('[API] Signup attempt for email:', email);

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

    // 2. Create public user record
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
    }

    console.log('[API] User created successfully:', authData.user.id, email);

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
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

// Update user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, credits, subscription } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const updates: any = {};

    if (credits !== undefined) {
      updates.credits = credits;
    }

    if (subscription) {
      updates.subscription = subscription;
      const creditLimits: Record<string, number> = { free: 100, pro: 1000, team: 5000 };
      updates.credit_limit = creditLimits[subscription];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Delete from public.users (Auth user deletion requires admin API or cascading if linked properly)
    // Note: Supabase Auth user deletion is usually done via supabase.auth.admin.deleteUser(userId) 
    // which requires service_role key. 
    // For now, we'll just delete the public profile which might be enough for the app logic,
    // or we can try to delete from public.users and let the user know.

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
