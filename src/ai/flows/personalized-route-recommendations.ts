// src/ai/flows/personalized-route-recommendations.ts
'use server';

/**
 * @fileOverview Provides personalized route recommendations based on user interests and travel style.
 *
 * - personalizedRouteRecommendations - A function that generates personalized route recommendations.
 * - PersonalizedRouteRecommendationsInput - The input type for the personalizedRouteRecommendations function.
 * - PersonalizedRouteRecommendationsOutput - The return type for the personalizedRouteRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRouteRecommendationsInputSchema = z.object({
  interests: z
    .string()
    .describe(
      'A comma separated list of interests, e.g. history, nature, food' +  
      ' or leave blank for no particular interests'
    ),
  travelStyle: z
    .string()
    .describe(
      'The travel style, e.g. budget, luxury, adventure, family-friendly, etc.' + 
      ' or leave blank for no particular travel style'
    ),
  routeLengthPreference: z
    .string()
    .describe(
      'Preferred length of the route in days or kilometers e.g. 7 days, 500 kilometers.' + 
      ' or leave blank for no particular route length preference'
    ),
  regions: z
    .string()
    .describe(
      'The geographical regions to include in the route, e.g. Rostov, Voronezh. Use a comma to separate regions.' + 
      ' or leave blank for all available regions.'
    ),
});
export type PersonalizedRouteRecommendationsInput = z.infer<
  typeof PersonalizedRouteRecommendationsInputSchema
>;

const PersonalizedRouteRecommendationsOutputSchema = z.object({
  routeDescription: z
    .string()
    .describe(
      'A detailed description of the recommended route, including attractions, accommodations, and activities.'
    ),
  attractions: z
    .string()
    .describe(
      'A list of attractions with links along the route, that match with the route description'
    ),
  estimatedCost: z.string().describe('An estimate of the travel cost.'),
  estimatedDistance: z.string().describe('The approximate length of the route.'),
});

export type PersonalizedRouteRecommendationsOutput = z.infer<
  typeof PersonalizedRouteRecommendationsOutputSchema
>;

export async function personalizedRouteRecommendations(
  input: PersonalizedRouteRecommendationsInput
): Promise<PersonalizedRouteRecommendationsOutput> {
  return personalizedRouteRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedRouteRecommendationsPrompt',
  input: {schema: PersonalizedRouteRecommendationsInputSchema},
  output: {schema: PersonalizedRouteRecommendationsOutputSchema},
  prompt: `You are an AI travel assistant specializing in creating personalized road trip itineraries through Russia.
  Generate the response in Russian.

  Based on the user's interests, travel style, route length preferences and preferred regions, create a personalized route recommendation.

  Interests: {{{interests}}}
  Travel Style: {{{travelStyle}}}
  Route Length Preference: {{{routeLengthPreference}}}
  Regions: {{{regions}}}

  Provide a detailed route description including must-see attractions, recommended accommodations, and activities.
  Also provide estimated cost and length.
`,
});

const personalizedRouteRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedRouteRecommendationsFlow',
    inputSchema: PersonalizedRouteRecommendationsInputSchema,
    outputSchema: PersonalizedRouteRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
