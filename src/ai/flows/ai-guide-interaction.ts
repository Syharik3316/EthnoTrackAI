// 'use server'
'use server';

/**
 * @fileOverview AI-powered guide interaction flow for answering user questions about routes, attractions, and local culture.
 *
 * - aiGuideInteraction - A function that handles user questions and returns informative responses.
 * - AiGuideInteractionInput - The input type for the aiGuideInteraction function.
 * - AiGuideInteractionOutput - The return type for the aiGuideInteraction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiGuideInteractionInputSchema = z.object({
  question: z.string().describe('The user question about the route, attractions, or local culture.'),
  userPreferences: z.string().optional().describe('The user\u2019s personal preferences, such as preferred cuisine, interests, and activity levels.'),
});
export type AiGuideInteractionInput = z.infer<typeof AiGuideInteractionInputSchema>;

const AiGuideInteractionOutputSchema = z.object({
  answer: z.string().describe('The AI guide\u2019s informative and engaging response to the user question.'),
});
export type AiGuideInteractionOutput = z.infer<typeof AiGuideInteractionOutputSchema>;

export async function aiGuideInteraction(input: AiGuideInteractionInput): Promise<AiGuideInteractionOutput> {
  return aiGuideInteractionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiGuideInteractionPrompt',
  input: {schema: AiGuideInteractionInputSchema},
  output: {schema: AiGuideInteractionOutputSchema},
  prompt: `You are an interactive AI guide providing information about routes, attractions, and local culture.

  Answer the user's question in an informative and engaging way, tailoring the response to enhance their travel experience.

  Consider the user's preferences when answering.

  User Preferences: {{{userPreferences}}}

  Question: {{{question}}}`,
});

const aiGuideInteractionFlow = ai.defineFlow(
  {
    name: 'aiGuideInteractionFlow',
    inputSchema: AiGuideInteractionInputSchema,
    outputSchema: AiGuideInteractionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
