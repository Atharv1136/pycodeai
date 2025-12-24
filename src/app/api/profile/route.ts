import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyToken } from '@/lib/auth';

/**
 * Get user profile
 * GET /api/profile
 * Returns the current user's profile data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { data: profile, error } = await supabase
      .from('users')
      .select('id, email, name, username, bio, location, website, github, twitter, linkedin, avatar_url, profile_complete, subscription, credits, credit_limit, code_runs, ai_queries, created_at, last_active, is_active')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      console.error('[API] Database error fetching profile:', error);
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        username: profile.username || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        github: profile.github || '',
        twitter: profile.twitter || '',
        linkedin: profile.linkedin || '',
        avatarUrl: profile.avatar_url || '',
        profileComplete: profile.profile_complete || false,
        subscription: profile.subscription,
        credits: profile.credits,
        creditLimit: profile.credit_limit,
        codeRuns: profile.code_runs,
        aiQueries: profile.ai_queries,
        createdAt: profile.created_at,
        lastActive: profile.last_active,
        isActive: profile.is_active
      }
    });

  } catch (error: any) {
    console.error('[API] Profile GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * Update user profile
 * PUT /api/profile
 * Updates the current user's profile data
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      username,
      bio,
      location,
      website,
      github,
      twitter,
      linkedin,
      avatarUrl
    } = body;

    const updates: any = {};

    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio || null;
    if (location !== undefined) updates.location = location || null;
    if (website !== undefined) updates.website = website || null;
    if (github !== undefined) updates.github = github || null;
    if (twitter !== undefined) updates.twitter = twitter || null;
    if (linkedin !== undefined) updates.linkedin = linkedin || null;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl || null;

    if (username !== undefined) {
      // Check if username is already taken by another user
      if (username) {
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .neq('id', user.id)
          .single();

        if (existing) {
          return NextResponse.json(
            { error: 'Username already taken' },
            { status: 409 }
          );
        }
      }
      updates.username = username || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Check profile completion
    const { data: currentProfile } = await supabase
      .from('users')
      .select('name, username, bio')
      .eq('id', user.id)
      .single();

    if (currentProfile) {
      const nameToCheck = name !== undefined ? name : currentProfile.name;
      const usernameToCheck = username !== undefined ? username : currentProfile.username;
      const bioToCheck = bio !== undefined ? bio : currentProfile.bio;

      updates.profile_complete = !!(nameToCheck && usernameToCheck && bioToCheck);
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('[API] Database error updating profile:', error);
      return NextResponse.json(
        { error: 'Failed to update profile', details: error.message },
        { status: 500 }
      );
    }

    // Fetch updated profile
    const { data: updatedProfile, error: fetchError } = await supabase
      .from('users')
      .select('id, email, name, username, bio, location, website, github, twitter, linkedin, avatar_url, profile_complete, subscription, credits, credit_limit, code_runs, ai_queries, created_at, last_active, is_active')
      .eq('id', user.id)
      .single();

    if (fetchError || !updatedProfile) {
      return NextResponse.json(
        { error: 'Profile not found after update' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        name: updatedProfile.name,
        username: updatedProfile.username || '',
        bio: updatedProfile.bio || '',
        location: updatedProfile.location || '',
        website: updatedProfile.website || '',
        github: updatedProfile.github || '',
        twitter: updatedProfile.twitter || '',
        linkedin: updatedProfile.linkedin || '',
        avatarUrl: updatedProfile.avatar_url || '',
        profileComplete: updatedProfile.profile_complete || false,
        subscription: updatedProfile.subscription,
        credits: updatedProfile.credits,
        creditLimit: updatedProfile.credit_limit,
        codeRuns: updatedProfile.code_runs,
        aiQueries: updatedProfile.ai_queries,
        createdAt: updatedProfile.created_at,
        lastActive: updatedProfile.last_active,
        isActive: updatedProfile.is_active
      }
    });

  } catch (error: any) {
    console.error('[API] Profile PUT error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}

