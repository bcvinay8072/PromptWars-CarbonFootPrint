const OpenAI = require('openai');

/**
 * Vercel Serverless Function — /api/chat
 *
 * Proxies chat requests to the OpenAI API server-side, ensuring:
 * 1. The API key is never exposed to the client browser.
 * 2. Server-side input validation (defense in depth).
 * 3. Streaming response via chunked transfer encoding.
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY,
  baseURL:
    process.env.OPENAI_BASE_URL ||
    process.env.REACT_APP_OPENAI_BASE_URL ||
    'https://api.openai.com/v1',
});

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, systemPrompt } = req.body;

  // Server-side input validation (defense in depth)
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing message field.' });
  }

  const sanitized = message
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, '')
    .trim()
    .substring(0, 1000);

  if (!sanitized) {
    return res.status(400).json({ error: 'Message cannot be empty after sanitization.' });
  }

  // Set streaming response headers
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-cache',
    'Transfer-Encoding': 'chunked',
  });

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            systemPrompt ||
            'You are EcoAssistant, an expert sustainability advisor.',
        },
        { role: 'user', content: sanitized },
      ],
      temperature: 0.7,
      max_tokens: 300,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        res.write(text);
      }
    }
  } catch (error) {
    // If headers haven't been sent yet, send error response
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to generate AI response.' });
    }
    // If already streaming, write error text
    res.write('\n\n[Error: Failed to complete response]');
  }

  res.end();
};
