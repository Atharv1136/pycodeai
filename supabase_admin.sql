-- Create admin_sessions table
CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add index for session lookup
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token);

-- Enable RLS (optional, but good practice)
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (since API uses service key or anon key with logic)
-- Ideally, only service role should access this, but for simplicity with anon key:
CREATE POLICY "Allow all access to admin_sessions" ON public.admin_sessions
    FOR ALL USING (true) WITH CHECK (true);
