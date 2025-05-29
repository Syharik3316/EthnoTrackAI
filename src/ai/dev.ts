import { config } from 'dotenv';
config();

import '@/ai/flows/ai-guide-interaction.ts';
import '@/ai/flows/summarize-route-reflection.ts';
import '@/ai/flows/personalized-route-recommendations.ts';
import '@/ai/flows/transcribe-audio-flow.ts'; // Added new flow
