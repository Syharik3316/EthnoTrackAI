// SummarizeRouteReflection.ts
'use server';

/**
 * @fileOverview Summarizes the user's daily reflections from the digital journal into a concise overview of their experiences along the route.
 *
 * - summarizeRouteReflection - A function that handles the summarization of route reflections.
 * - SummarizeRouteReflectionInput - The input type for the summarizeRouteReflection function.
 * - SummarizeRouteReflectionOutput - The return type for the summarizeRouteReflection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeRouteReflectionInputSchema = z.object({
  reflections: z
    .string()
    .describe('The daily reflections from the digital journal to be summarized.'),
});
export type SummarizeRouteReflectionInput = z.infer<typeof SummarizeRouteReflectionInputSchema>;

const SummarizeRouteReflectionOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the user experiences along the route.'),
});
export type SummarizeRouteReflectionOutput = z.infer<typeof SummarizeRouteReflectionOutputSchema>;

export async function summarizeRouteReflection(input: SummarizeRouteReflectionInput): Promise<SummarizeRouteReflectionOutput> {
  return summarizeRouteReflectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeRouteReflectionPrompt',
  input: {schema: SummarizeRouteReflectionInputSchema},
  output: {schema: SummarizeRouteReflectionOutputSchema},
  prompt: `You are an AI assistant that summarizes reflections from a digital journal.

  Summarize the user's reflections into a concise overview of their experiences along the route. Focus on key moments and overall impressions.

  Reflections: {{{reflections}}}`,
});

const summarizeRouteReflectionFlow = ai.defineFlow(
  {
    name: 'summarizeRouteReflectionFlow',
    inputSchema: SummarizeRouteReflectionInputSchema,
    outputSchema: SummarizeRouteReflectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
