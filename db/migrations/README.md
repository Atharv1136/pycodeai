# Database Migration Instructions

## Quick Fix - Run Migration Manually

Since the profile is failing to load, you need to add the new columns to your Supabase database.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste this SQL:

```sql
-- Add API key columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS openai_api_key_encrypted TEXT,
ADD COLUMN IF NOT EXISTS gemini_api_key_encrypted TEXT,
ADD COLUMN IF NOT EXISTS api_keys_updated_at TIMESTAMP;

-- Add comments for documentation
COMMENT ON COLUMN users.openai_api_key_encrypted IS 'Encrypted OpenAI API key for user-specific AI operations';
COMMENT ON COLUMN users.gemini_api_key_encrypted IS 'Encrypted Gemini API key for user-specific AI operations';
COMMENT ON COLUMN users.api_keys_updated_at IS 'Timestamp when API keys were last updated';
```

5. Click **Run** to execute the migration
6. Refresh your browser at http://localhost:9002/dashboard/profile

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Navigate to project directory
cd c:\Users\Atharv\Downloads\pyapp

# Run the migration
supabase db execute --file db/migrations/add_api_keys.sql
```

### Option 3: Using psql

If you have direct database access:

```bash
psql -h <your-supabase-host> -U postgres -d postgres -f db/migrations/add_api_keys.sql
```

## After Running Migration

1. Refresh the profile page in your browser
2. The "Failed to load profile" error should be gone
3. You should see the new "API Keys" section at the bottom of the profile page
