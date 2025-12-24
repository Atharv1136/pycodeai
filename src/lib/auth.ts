import { createClient } from '@/lib/supabase/server';

export interface AuthUser {
  id: string;
  email: string;
  subscription: string;
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  // NOTE: With Supabase, we verify the session token via getUser()
  // But since we might be passing just the access token string here, 
  // we would need to set it on the client.
  // However, the preferred way in Next.js with Supabase is to use cookies.

  // If this function is called with a raw JWT, we might not be able to fully verify it 
  // without setting it as a session on the client.
  // For now, let's assume this is used in contexts where we can get the user from the server client
  // which reads cookies automatically.

  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      subscription: user.user_metadata?.subscription || 'free'
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function getCurrentUser(token?: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return null;

    // Fetch profile from public.users
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      name: profile?.name || user.user_metadata?.name,
      subscription: profile?.subscription || 'free',
      credits: profile?.credits || 0,
      creditLimit: profile?.credit_limit || 100,
      codeRuns: profile?.code_runs || 0,
      aiQueries: profile?.ai_queries || 0,
      createdAt: profile?.created_at || user.created_at,
      lastActive: profile?.last_active,
      isActive: profile?.is_active ?? true
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}
