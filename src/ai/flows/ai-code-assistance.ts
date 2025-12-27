'use server';
/**
 * @fileOverview An AI code assistant flow for explaining, fixing, and optimizing Python code.
 *
 * - aiCodeAssistance - A function that handles the AI code assistance process.
 * - AiCodeAssistanceInput - The input type for the aiCodeAssistance function.
 * - AiCodeAssistanceOutput - The return type for the aiCodeAssistance function.
 */

import { getAiForUser } from '@/ai/genkit';
import { getUserApiKeys } from '@/lib/api-keys';
import { createClient } from '@/lib/supabase/server';
import { z } from 'genkit';

const AiCodeAssistanceInputSchema = z.object({
  code: z
    .string()
    .describe('The Python code to be explained, fixed, or optimized. This can be empty if the user is asking to generate a new file.'),
  instruction: z
    .string()
    .describe('The instruction for the AI assistant (e.g., explain this code, fix errors, optimize, create a file named test.py).'),
  quickActions: z
    .array(z.string())
    .optional()
    .describe('The list of quick actions available to the user'),
  uploadedFiles: z
    .array(z.object({
      name: z.string(),
      content: z.string(),
      type: z.string()
    }))
    .optional()
    .describe('Files uploaded by the user that can be used as context or reference'),
});

export type AiCodeAssistanceInput = z.infer<typeof AiCodeAssistanceInputSchema>;

const AiCodeAssistanceOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s textual response, explaining what it did.'),
  code: z.string().optional().describe('The new or modified code. This should be returned only when the instruction implies a code change.'),
  fileName: z.string().optional().describe('The name of the file to be created. Only return this when the user asks to create a new file.')
});

export type AiCodeAssistanceOutput = z.infer<typeof AiCodeAssistanceOutputSchema>;


export async function aiCodeAssistance(input: AiCodeAssistanceInput): Promise<AiCodeAssistanceOutput> {
  return aiCodeAssistanceFlow(input);
}


// Retry helper with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if it's a retryable error (503, 429, or network errors)
      const isRetryable =
        error?.status === 503 ||
        error?.status === 429 ||
        error?.message?.includes('overloaded') ||
        error?.message?.includes('Service Unavailable') ||
        error?.message?.includes('rate limit') ||
        error?.message?.includes('quota') ||
        error?.message?.includes('429') ||
        error?.message?.includes('Too Many Requests') ||
        error?.code === 'ECONNRESET' ||
        error?.code === 'ETIMEDOUT';

      // Don't retry on last attempt or if error is not retryable
      if (attempt === maxRetries || !isRetryable) {
        throw error;
      }

      // Calculate delay with exponential backoff (1s, 2s, 4s)
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`AI API error, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

const aiCodeAssistanceFlow = async (input: AiCodeAssistanceInput): Promise<AiCodeAssistanceOutput> => {
  try {
    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        response: '❌ **Authentication Required**\n\nPlease log in to use AI assistance.',
        code: undefined,
        fileName: undefined
      };
    }

    // Fetch user's API keys
    const userApiKeys = await getUserApiKeys(user.id);

    // Check if user has a Gemini key
    if (!userApiKeys.gemini) {
      return {
        response: '❌ **Gemini API Key Required**\n\nPlease add your Gemini API key in your Profile settings to use AI assistance.\n\nGet your key from: https://makersuite.google.com/app/apikey',
        code: undefined,
        fileName: undefined
      };
    }

    // Create AI instance with user's keys
    const userAi = getAiForUser(userApiKeys);

    // Define prompt dynamically
    const prompt = userAi.definePrompt({
      name: 'aiCodeAssistancePrompt',
      input: { schema: AiCodeAssistanceInputSchema },
      output: { schema: AiCodeAssistanceOutputSchema },
      prompt: `You are an expert AI code assistant that helps users understand, fix, and write Python code.
The user's instruction is: "{{{instruction}}}"

The user has provided the following code:
\`\`\`python
{{{code}}}
\`\`\`

{{#if uploadedFiles}}
The user's project contains the following files that you can use as context or reference:
{{#each uploadedFiles}}
File: {{name}} ({{type}})
\`\`\`{{type}}
{{content}}
\`\`\`

IMPORTANT: This file is already available in the project's execution context. When generating code, you can reference it directly by its filename (e.g., '{{name}}') without any path prefix. For example:
- To read a JSON file: \`import json; data = json.load(open('{{name}}'))\`
- To read a CSV file: \`import pandas as pd; df = pd.read_csv('{{name}}')\`
- To read a text file: \`with open('{{name}}', 'r') as f: content = f.read()\`

The file will be automatically available in the same directory when the code runs, so use the filename directly (e.g., '{{name}}' not './uploads/.../{{name}}').
{{/each}}
{{/if}}

Follow these rules:
1.  Analyze the user's instruction to determine their intent (e.g., explain, write, fix, optimize, create a file).
2.  If the intent is purely to get an explanation or answer a question, provide a clear, concise textual response in the 'response' field. Do not return any code.
3.  If the intent is to modify existing code (e.g., "fix this," "add comments," "optimize this"), you MUST provide the complete, updated Python code in the 'code' field. Also provide a brief explanation of the changes in the 'response' field.
4.  If the intent is to generate a new file (e.g., "create a file named utils.py to hold helper functions", "make a file called 'test.py'"), you MUST:
    a. Extract the filename from the instruction and return it in the 'fileName' field.
    b. Provide the complete code for the new file in the 'code' field.
    c. Provide a confirmation message in the 'response' field (e.g., "Sure, I've created utils.py for you.").
5.  If the intent is to write new code but no filename is specified, provide the new code in the 'code' field and a 'response' explaining it. The user can then copy it or decide where to save it.
6.  Do not wrap the code in the 'code' field in markdown backticks. Return only the raw code.
  `,
    });

    // Execute with retry
    const { output } = await retryWithBackoff(async () => {
      return await prompt(input);
    }, 3, 1000);

    return output!;
  } catch (error: any) {
    // Handle specific error types
    if (error?.status === 503 || error?.message?.includes('overloaded') || error?.message?.includes('Service Unavailable')) {
      return {
        response: `⚠️ **AI Service Temporarily Unavailable**

The AI service is currently overloaded. Please try again in a few moments.

**What you can do:**
- Wait 10-30 seconds and try again
- The service will automatically retry when available
- Your request has been noted and will be processed when capacity is available

**Alternative:** You can continue coding manually while the service recovers.`,
        code: undefined,
        fileName: undefined
      };
    }

    // Handle quota/rate limit errors
    const isQuotaError =
      error?.status === 429 ||
      error?.message?.includes('rate limit') ||
      error?.message?.includes('quota') ||
      error?.message?.includes('429') ||
      error?.message?.includes('Too Many Requests') ||
      error?.message?.includes('exceeded your current quota');

    if (isQuotaError) {
      // Extract wait time from error message if available
      const waitTimeMatch = error?.message?.match(/Please retry in ([\d.]+)s/i) ||
        error?.message?.match(/retry in ([\d.]+)s/i);
      const waitTime = waitTimeMatch ? Math.ceil(parseFloat(waitTimeMatch[1])) : null;

      // Extract quota limit if available
      const quotaMatch = error?.message?.match(/limit: (\d+)/i);
      const quotaLimit = quotaMatch ? quotaMatch[1] : null;

      let response = `⚠️ **AI Quota Limit Reached**

You've exceeded the free tier quota limit for the Gemini API.`;

      if (quotaLimit) {
        response += `\n\n**Quota Limit:** ${quotaLimit} requests per day (free tier)`;
      }

      if (waitTime) {
        response += `\n\n**Please wait ${waitTime} seconds before trying again.**`;
      } else {
        response += `\n\n**Please wait 30-60 seconds before your next request.**`;
      }

      response += `\n\n**Solutions:**
1. **Wait** - The quota resets daily. Try again after the reset period.
2. **Upgrade your plan** - Visit [Google AI Studio](https://ai.google.dev/) to check your quota and upgrade options.
3. **Continue manually** - You can still write and run code without AI assistance.`;

      return {
        response,
        code: undefined,
        fileName: undefined
      };
    }

    // Generic error
    console.error('AI Code Assistance error:', error);
    return {
      response: `❌ **Error occurred while processing your request**

${error?.message || 'An unexpected error occurred'}

Please try again, or rephrase your request.`,
      code: undefined,
      fileName: undefined
    };
  }
};
