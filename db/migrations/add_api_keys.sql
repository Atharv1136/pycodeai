-- Add API key columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS openai_api_key_encrypted TEXT,
ADD COLUMN IF NOT EXISTS gemini_api_key_encrypted TEXT,
ADD COLUMN IF NOT EXISTS api_keys_updated_at TIMESTAMP;

-- Add comment for documentation
COMMENT ON COLUMN users.openai_api_key_encrypted IS 'Encrypted OpenAI API key for user-specific AI operations';
COMMENT ON COLUMN users.gemini_api_key_encrypted IS 'Encrypted Gemini API key for user-specific AI operations';
COMMENT ON COLUMN users.api_keys_updated_at IS 'Timestamp when API keys were last updated';
