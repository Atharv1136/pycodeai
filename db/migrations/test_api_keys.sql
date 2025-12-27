-- Test if API key columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name LIKE '%api_key%';

-- If columns exist, check if any data is being saved
SELECT id, email, 
  CASE WHEN openai_api_key_encrypted IS NOT NULL THEN 'Has OpenAI Key' ELSE 'No OpenAI Key' END as openai_status,
  CASE WHEN gemini_api_key_encrypted IS NOT NULL THEN 'Has Gemini Key' ELSE 'No Gemini Key' END as gemini_status,
  api_keys_updated_at
FROM users
LIMIT 5;
