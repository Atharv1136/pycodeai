'use server';
/**
 * @fileOverview An AI assistant tool for deciding which quick actions and code context should be offered to the user.
 *
 * - decideCodeAssistanceActions - A function that handles the process of deciding which actions to offer.
 * - DecideCodeAssistanceActionsInput - The input type for the decideCodeAssistanceActions function.
 * - DecideCodeAssistanceActionsOutput - The return type for the decideCodeAssistanceActions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DecideCodeAssistanceActionsInputSchema = z.object({
  code: z.string().describe('The code currently open in the editor.'),
});
export type DecideCodeAssistanceActionsInput = z.infer<typeof DecideCodeAssistanceActionsInputSchema>;

const DecideCodeAssistanceActionsOutputSchema = z.object({
  actions: z.array(
    z.enum([
      'explain',
      'fix_errors',
      'optimize',
      'add_comments',
      'write_tests',
    ])
  ).describe('A list of actions that would be useful for the code.'),
  codeContext: z.string().describe('A summary of the code to provide context to the user.'),
});
export type DecideCodeAssistanceActionsOutput = z.infer<typeof DecideCodeAssistanceActionsOutputSchema>;

export async function decideCodeAssistanceActions(input: DecideCodeAssistanceActionsInput): Promise<DecideCodeAssistanceActionsOutput> {
  return decideCodeAssistanceActionsFlow(input);
}

const decideCodeAssistanceActionsPrompt = ai.definePrompt({
  name: 'decideCodeAssistanceActionsPrompt',
  input: {schema: DecideCodeAssistanceActionsInputSchema},
  output: {schema: DecideCodeAssistanceActionsOutputSchema},
  prompt: `You are an AI assistant helping decide which quick actions to offer a user based on the code they have open in their editor.

Analyze the following code and determine which actions would be most helpful to the user. Also, provide a brief summary of the code for context.

Code: {{{code}}}

Consider these actions:
- explain: Explain the code
- fix_errors: Fix any errors in the code
- optimize: Optimize the code for performance
- add_comments: Add comments to the code
- write_tests: Write unit tests for the code

Return a JSON object with the following format:
{
  "actions": ["action1", "action2", ...],
  "codeContext": "A brief summary of the code"
}
`,
});

const decideCodeAssistanceActionsFlow = ai.defineFlow(
  {
    name: 'decideCodeAssistanceActionsFlow',
    inputSchema: DecideCodeAssistanceActionsInputSchema,
    outputSchema: DecideCodeAssistanceActionsOutputSchema,
  },
  async input => {
    const {output} = await decideCodeAssistanceActionsPrompt(input);
    return output!;
  }
);
