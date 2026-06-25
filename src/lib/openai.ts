/**
 * EcoAssistant AI integration module.
 *
 * Uses the server-side `/api/chat` proxy to communicate with OpenAI,
 * ensuring the API key is never exposed in the browser bundle.
 * Falls back to direct client-side calls only in development mode.
 *
 * @module openai
 */

import { globalRateLimiter, sanitizeInput } from './utils';
import { DEFAULT_AI_MODEL, MAX_AI_TOKENS, AI_TEMPERATURE } from './constants';

/**
 * Constructs the system prompt for the EcoAssistant.
 * @param footprintData - Optional user footprint context
 * @returns The full system prompt string
 */
const buildSystemPrompt = (footprintData?: { total: number; breakdown: string }): string => {
  let systemPrompt = `You are EcoAssistant, an expert sustainability advisor for a Carbon Footprint Awareness Platform. 
Your goal is to help individuals understand, track, and reduce their carbon footprint through simple actions and personalized insights.
Be concise, encouraging, and highly specific. Keep responses under 3 paragraphs. Focus on actionable insights.`;

  if (footprintData) {
    systemPrompt += `\nThe user's current estimated footprint is ${footprintData.total.toFixed(1)} tons CO2/year. Breakdown: ${footprintData.breakdown}.`;
  }

  return systemPrompt;
};

/**
 * Streams the AI response from the server-side `/api/chat` proxy.
 * Uses the Fetch API with ReadableStream for real-time streaming.
 *
 * @param safeMessage - The sanitized user message
 * @param systemPrompt - The constructed system prompt
 * @param onChunk - Callback invoked with each streamed text chunk
 * @returns The complete AI response text
 */
const streamFromServer = async (
  safeMessage: string,
  systemPrompt: string,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: safeMessage, systemPrompt }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error((errorData as { error?: string }).error || `Server error: ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    fullContent += text;
    if (onChunk && text) {
      onChunk(text);
    }
  }

  return fullContent;
};

/**
 * Falls back to direct client-side OpenAI calls (development only).
 * This is only used when the `/api/chat` server route is unavailable.
 *
 * @param safeMessage - The sanitized user message
 * @param systemPrompt - The constructed system prompt
 * @param onChunk - Callback invoked with each streamed text chunk
 * @returns The complete AI response text
 */
const streamFromClient = async (
  safeMessage: string,
  systemPrompt: string,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  // Dynamic import to keep openai out of the main bundle
  const OpenAI = (await import('openai')).default;

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
    baseURL: process.env.REACT_APP_OPENAI_BASE_URL || 'https://api.openai.com/v1',
    dangerouslyAllowBrowser: true,
  });

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

  return fullContent;
};

/**
 * Gets eco-advice from the AI assistant using streaming.
 * Applies client-side rate limiting and input sanitization before sending.
 * Routes through the server-side API proxy for security, with a
 * fallback to direct client calls in development.
 *
 * @param userMessage - The raw message from the user
 * @param footprintData - Optional context about the user's carbon footprint
 * @param onChunk - Optional callback invoked with each text chunk during streaming
 * @returns The complete AI response text
 * @throws {Error} If rate limited, input is empty, or API call fails
 */
export const getEcoAdvice = async (
  userMessage: string,
  footprintData?: { total: number; breakdown: string },
  onChunk?: (chunk: string) => void
): Promise<string> => {
  // 1. Client-side rate limiting
  if (!globalRateLimiter.canProceed()) {
    throw new Error('Rate limit exceeded. Please wait a moment before sending another message.');
  }

  // 2. Client-side input sanitization
  const safeMessage = sanitizeInput(userMessage);
  if (!safeMessage) {
    throw new Error('Message cannot be empty.');
  }

  // 3. Build system prompt
  const systemPrompt = buildSystemPrompt(footprintData);

  // 4. Try server-side proxy first, fallback to client-side
  try {
    const result = await streamFromServer(safeMessage, systemPrompt, onChunk);
    return result || 'I could not generate an answer at this time.';
  } catch (serverError) {
    try {
      const result = await streamFromClient(safeMessage, systemPrompt, onChunk);
      return result || 'I could not generate an answer at this time.';
    } catch (clientError) {
      throw new Error('Failed to connect to the EcoAssistant. Please check your connection.');
    }
  }
};
