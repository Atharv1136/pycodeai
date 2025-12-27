import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * User API keys interface
 */
export interface UserApiKeys {
  gemini?: string;
  openai?: string; // Reserved for future use when OpenAI package is added
}

/**
 * Create a user-specific AI instance with their API keys
 * @param apiKeys - User's API keys
 * @returns Genkit AI instance configured with user's keys
 */
export function getAiForUser(apiKeys: UserApiKeys) {
  // Use user's Gemini key if provided, otherwise fall back to system key
  if (apiKeys.gemini) {
    return genkit({
      plugins: [googleAI({ apiKey: apiKeys.gemini })],
      model: 'googleai/gemini-2.0-flash-exp',
    });
  } else if (process.env.GOOGLE_GENAI_API_KEY) {
    return genkit({
      plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
      model: 'googleai/gemini-2.0-flash-exp',
    });
  } else {
    // Use default from env
    return ai;
  }
}

/**
 * Default AI instance for initialization
 * This is a placeholder - actual AI operations should use getAiForUser() with user keys
 * Using a dummy key to prevent initialization errors
 */
export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY || 'dummy-key-for-initialization' })],
  model: 'googleai/gemini-2.0-flash-exp',
});
