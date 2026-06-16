/**
 * Core application types
 */

export interface EmissionData {
  transport: number;
  diet: number;
  energy: number;
  shopping: number;
  total: number;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  committed: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  isError?: boolean;
}

/**
 * Sanitizes user input to prevent XSS attacks.
 * @param input - The raw user input string
 * @returns Sanitized string with HTML tags removed
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/javascript:/gi, '') // Remove JS protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data URIs
    .trim()
    .substring(0, 1000); // Limit length
};

/**
 * Token Bucket Rate Limiter to prevent API spam
 */
class RateLimiter {
  tokens: number;
  maxTokens: number;
  refillRate: number; // ms per token
  lastRefill: number;

  constructor(maxTokens = 10, refillRate = 2000) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
  }

  canProceed(): boolean {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    
    // Refill tokens
    this.tokens = Math.min(
      this.maxTokens,
      this.tokens + Math.floor(elapsed / this.refillRate)
    );
    
    // Update refill time for the tokens we just added
    if (elapsed >= this.refillRate) {
      this.lastRefill = now - (elapsed % this.refillRate);
    }

    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    
    return false;
  }
}

export const globalRateLimiter = new RateLimiter();
