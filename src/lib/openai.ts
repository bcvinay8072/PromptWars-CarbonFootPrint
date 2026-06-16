import OpenAI from 'openai';
import { globalRateLimiter, sanitizeInput } from './utils';

// Read from env. If not present, fallback to empty string so user can replace or app handles gracefully.
const apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
const baseURL = process.env.REACT_APP_OPENAI_BASE_URL || 'https://api.openai.com/v1';

/**
 * Initialize OpenAI client using the proxy URL and Key.
 * Dangerously allow browser is needed because Create React App builds for the browser.
 */
const openai = new OpenAI({
  apiKey,
  baseURL,
  dangerouslyAllowBrowser: true, 
});

/**
 * Gets eco-advice from the AI assistant.
 * @param userMessage - The message from the user
 * @param footprintData - Optional context about their footprint
 * @returns The AI's response text
 */
export const getEcoAdvice = async (
  userMessage: string,
  footprintData?: { total: number; breakdown: string },
  onChunk?: (chunk: string) => void
): Promise<string> => {
  // 1. Rate Limiting Check
  if (!globalRateLimiter.canProceed()) {
    throw new Error('Rate limit exceeded. Please wait a moment before sending another message.');
  }

  // 2. Input Sanitization
  const safeMessage = sanitizeInput(userMessage);
  
  if (!safeMessage) {
    throw new Error('Message cannot be empty.');
  }

  // 3. Construct System Prompt aligning with the problem statement
  let systemPrompt = `You are EcoAssistant, an expert sustainability advisor for a Carbon Footprint Awareness Platform. 
Your goal is to help individuals understand, track, and reduce their carbon footprint through simple actions and personalized insights.
Be concise, encouraging, and highly specific. Keep responses under 3 paragraphs. Focus on actionable insights.`;

  if (footprintData) {
    systemPrompt += `\nThe user's current estimated footprint is ${footprintData.total.toFixed(1)} tons CO2/year. Breakdown: ${footprintData.breakdown}.`;
  }

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Defaulting to the model requested by the user
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: safeMessage }
      ],
      temperature: 0.7,
      max_tokens: 300,
      stream: true,
    });

    let fullContent = '';
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      fullContent += text;
      if (onChunk && text) {
        onChunk(text);
      }
    }

    return fullContent || 'I could not generate an answer at this time.';
  } catch (error) {
    console.error('Error fetching eco advice:', error);
    throw new Error('Failed to connect to the EcoAssistant. Please check your API proxy settings.');
  }
};
