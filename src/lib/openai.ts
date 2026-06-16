import OpenAI from 'openai';
import { globalRateLimiter, sanitizeInput } from './utils';
import { DEFAULT_AI_MODEL, MAX_AI_TOKENS, AI_TEMPERATURE } from './constants';

// Read from environment variables. Fallback to empty strings for graceful handling.
const apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
const baseURL = process.env.REACT_APP_OPENAI_BASE_URL || 'https://api.openai.com/v1';

/**
 * OpenAI client instance configured with the user's proxy URL and API key.
 * `dangerouslyAllowBrowser` is required for Create React App browser builds.
 */
const openai = new OpenAI({
  apiKey,
  baseURL,
  dangerouslyAllowBrowser: true,
});

/**
 * Gets eco-advice from the AI assistant using streaming.
 * Applies rate limiting and input sanitization before sending the request.
 *
 * @param userMessage - The raw message from the user
 * @param footprintData - Optional context about the user's carbon footprint
 * @param onChunk - Optional callback invoked with each text chunk during streaming
 * @returns The complete AI response text
 * @throws {Error} If rate limited, input is empty, or API call fails
 *
 * @example
 * ```ts
 * const response = await getEcoAdvice(
 *   'How can I reduce my transport emissions?',
 *   { total: 7.5, breakdown: 'Transport: 4.5, Diet: 3.0' },
 *   (chunk) => setStreamedText(prev => prev + chunk)
 * );
 * ```
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
      model: DEFAULT_AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: safeMessage },
      ],
      temperature: AI_TEMPERATURE,
      max_tokens: MAX_AI_TOKENS,
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
    console.error('[EcoAssistant] Error fetching eco advice:', error);
    throw new Error('Failed to connect to the EcoAssistant. Please check your API proxy settings.');
  }
};
