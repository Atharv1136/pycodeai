import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

// Export Supabase client creator
export { createClient };

// Legacy MySQL Pool Compatibility Layer
// This is designed to break loudly so we find all usages and migrate them.
// Or, for a smoother transition, we could implement a basic query runner using Supabase RPC if we had stored procedures,
// but since we are migrating to Supabase Auth + Tables, we should rewrite the queries.

class MockPool {
  async getConnection() {
    return new MockConnection();
  }

  async execute(query: string, params: any[]) {
    console.error('❌ Legacy MySQL pool.execute called. Please migrate to Supabase.', query);
    throw new Error('Database migration in progress. This feature is being updated to Supabase.');
  }
}

class MockConnection {
  async execute(query: string, params: any[]) {
    console.error('❌ Legacy MySQL connection.execute called. Please migrate to Supabase.', query);
    throw new Error('Database migration in progress. This feature is being updated to Supabase.');
  }

  release() {
    // No-op
  }
}

export const pool = new MockPool();

export async function testConnection() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.log('✅ Connected to Supabase!');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
}

export async function initializeDatabase() {
  console.log('⚠️ Database initialization is now handled via Supabase Dashboard SQL Editor.');
  return true;
}

export default pool;
