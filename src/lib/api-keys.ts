import { createClient } from '@/lib/supabase/server';
import { decryptApiKey } from '@/lib/encryption';
import { UserApiKeys } from '@/ai/genkit';

/**
 * Get user's API keys from database
 * @param userId - User ID
 * @returns User's decrypted API keys
 */
export async function getUserApiKeys(userId: string): Promise<UserApiKeys> {
    try {
        const supabase = await createClient();

        const { data: user, error } = await supabase
            .from('users')
            .select('openai_api_key_encrypted, gemini_api_key_encrypted')
            .eq('id', userId)
            .single();

        if (error || !user) {
            console.error('[getUserApiKeys] Error fetching user keys:', error);
            return {};
        }

        const apiKeys: UserApiKeys = {};

        // Decrypt Gemini key if exists
        if (user.gemini_api_key_encrypted) {
            try {
                apiKeys.gemini = decryptApiKey(user.gemini_api_key_encrypted);
            } catch (error) {
                console.error('[getUserApiKeys] Error decrypting Gemini key:', error);
            }
        }

        // Decrypt OpenAI key if exists
        if (user.openai_api_key_encrypted) {
            try {
                apiKeys.openai = decryptApiKey(user.openai_api_key_encrypted);
            } catch (error) {
                console.error('[getUserApiKeys] Error decrypting OpenAI key:', error);
            }
        }

        return apiKeys;
    } catch (error) {
        console.error('[getUserApiKeys] Unexpected error:', error);
        return {};
    }
}
