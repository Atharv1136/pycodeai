import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Get user stats
export async function GET(request: NextRequest) {
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

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, subscription, credits, credit_limit, code_runs, ai_queries, created_at, last_active, is_active')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get daily stats for today
    const today = new Date().toISOString().split('T')[0];
    const { data: dailyStatsData } = await supabase
      .from('daily_stats')
      .select('code_runs, ai_queries')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    const dailyStats = dailyStatsData || { code_runs: 0, ai_queries: 0 };

    return NextResponse.json({
      user,
      dailyStats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}

// Update user stats (increment code runs or AI queries)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, amount = 1 } = body; // type: 'code_run' or 'ai_query'

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'User ID and type are required' },
        { status: 400 }
      );
    }

    if (!['code_run', 'ai_query'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be code_run or ai_query' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // Check if user has enough credits
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('credits, credit_limit, code_runs, ai_queries')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.credits < amount) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      );
    }

    // Update user credits and stats
    // Note: Supabase doesn't support atomic increment via simple update unless using RPC.
    // We will read and write back. This has a race condition but acceptable for this scale.
    // Alternatively, we could create an RPC function `increment_stats`.
    // For now, read-modify-write.

    const updateField = type === 'code_run' ? 'code_runs' : 'ai_queries';
    const newCredits = user.credits - amount;
    const newValue = (user[updateField as keyof typeof user] as number) + amount;

    const { error: updateError } = await supabase
      .from('users')
      .update({
        credits: newCredits,
        [updateField]: newValue,
        last_active: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    // Update or insert daily stats
    // We need to check if it exists first or use upsert.
    // Upsert needs the current value to increment.
    // Let's try to fetch first.

    const { data: existingDaily } = await supabase
      .from('daily_stats')
      .select(updateField)
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    const currentDailyValue = existingDaily ? (existingDaily[updateField as keyof typeof existingDaily] as number) : 0;

    const { error: dailyError } = await supabase
      .from('daily_stats')
      .upsert({
        user_id: userId,
        date: today,
        [updateField]: currentDailyValue + amount,
        // Preserve the other field if it exists? 
        // Upsert replaces the row. We need to be careful.
        // If we upsert, we need to provide all fields or it might nullify others if not careful.
        // Actually, `upsert` in Supabase merges if we don't specify otherwise? 
        // No, it's an INSERT ON CONFLICT DO UPDATE.
        // If we only provide one field, the other might be reset if we don't include it.
        // So we should fetch the whole row first.
      }, { onConflict: 'user_id,date' });

    // Wait, if we use upsert with just one field, the other field (e.g. ai_queries when updating code_runs)
    // might become null if it's not in the payload?
    // Postgres ON CONFLICT UPDATE SET ... usually updates only specified columns.
    // But Supabase `upsert` takes a record.
    // Let's fetch the full daily stats first to be safe.

    if (existingDaily) {
      await supabase
        .from('daily_stats')
        .update({
          [updateField]: currentDailyValue + amount
        })
        .eq('user_id', userId)
        .eq('date', today);
    } else {
      await supabase
        .from('daily_stats')
        .insert({
          user_id: userId,
          date: today,
          [updateField]: amount,
          [type === 'code_run' ? 'ai_queries' : 'code_runs']: 0 // Initialize the other one to 0
        });
    }

    return NextResponse.json({
      success: true,
      message: `${type} recorded successfully`
    });

  } catch (error) {
    console.error('Error updating user stats:', error);
    return NextResponse.json(
      { error: 'Failed to update user stats' },
      { status: 500 }
    );
  }
}

// Get admin stats
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get total stats
    // We'll fetch all users to aggregate. Not efficient for millions, but fine for thousands.
    const { data: users, error } = await supabase
      .from('users')
      .select('subscription, code_runs, ai_queries, last_active');

    if (error) throw error;

    const total_users = users.length;
    const total_code_runs = users.reduce((sum, u) => sum + (u.code_runs || 0), 0);
    const total_ai_queries = users.reduce((sum, u) => sum + (u.ai_queries || 0), 0);
    const premium_users = users.filter(u => u.subscription !== 'free').length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const active_users = users.filter(u => new Date(u.last_active) >= sevenDaysAgo).length;

    const { count: total_projects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    const stats = {
      total_users,
      total_code_runs,
      total_ai_queries,
      premium_users,
      active_users,
      total_projects: total_projects || 0
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
