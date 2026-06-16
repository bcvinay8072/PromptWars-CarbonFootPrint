/**
 * Core application types and security utilities for the
 * Carbon Footprint Awareness Platform.
 * @module utils
 */

import { MAX_INPUT_LENGTH, RATE_LIMITER_CONFIG } from './constants';

/**
 * Represents the user's estimated annual carbon emission data.
 * All values are measured in metric tons of CO2 equivalent per year.
 */
export interface EmissionData {
  /** Annual transport emissions (tons CO2/yr) */
  transport: number;
  /** Annual dietary emissions (tons CO2/yr) */
  diet: number;
  /** Annual home energy emissions (tons CO2/yr) */
  energy: number;
  /** Annual shopping/consumption emissions (tons CO2/yr) */
  shopping: number;
  /** Total combined annual emissions (tons CO2/yr) */
  total: number;
}

/**
 * Represents a single actionable item for carbon footprint reduction.
 */
export interface ActionItem {
  /** Unique identifier */
  id: string;
  /** Short action title */
  title: string;
  /** Detailed action description */
  description: string;
  /** Relative impact level of this action */
  impact: 'High' | 'Medium' | 'Low';
  /** Whether the user has committed to this action */
  committed: boolean;
}

/**
 * Represents a single message in the EcoAssistant chat.
 */
export interface ChatMessage {
  /** Unique message identifier */
  id: string;
  /** Message text content (may contain markdown for bot messages) */
  text: string;
  /** Whether this message was sent by the user */
  isUser: boolean;
  /** ISO 8601 timestamp of when the message was created */
  timestamp: string;
  /** Whether this message represents an error */
  isError?: boolean;
}

/**
 * Sanitizes user input to prevent XSS (Cross-Site Scripting) attacks.
 * Strips HTML tags, JavaScript protocols, event handlers, and data URIs.
 * Enforces a maximum input length to prevent payload bloat.
 *
 * @param input - The raw user input string
 * @returns Sanitized string safe for rendering and API transmission
 *
 * @example
 * ```ts
 * sanitizeInput('<script>alert(1)</script>Hello'); // => 'alert(1)Hello'
 * sanitizeInput('javascript:alert(1)');            // => 'alert(1)'
 * ```
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '')       // Strip HTML tags
    .replace(/javascript:/gi, '')  // Remove JS protocol
    .replace(/on\w+\s*=/gi, '')    // Remove event handlers
    .replace(/data:/gi, '')        // Remove data URIs
    .trim()
    .substring(0, MAX_INPUT_LENGTH);
};

/**
 * Token Bucket Rate Limiter to prevent API spam and abuse.
 * Tokens are consumed on each request and refill over time.
 * This protects the OpenAI proxy from excessive client-side calls.
 */
class RateLimiter {
  /** Current number of available tokens */
  tokens: number;
  /** Maximum tokens the bucket can hold */
  maxTokens: number;
  /** Milliseconds per token refill */
  refillRate: number;
  /** Timestamp of the last token refill */
  lastRefill: number;

  constructor(
    maxTokens = RATE_LIMITER_CONFIG.maxTokens,
    refillRate = RATE_LIMITER_CONFIG.refillRateMs
  ) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
  }

  /**
   * Checks if a request can proceed. Consumes one token if available,
   * and refills tokens based on elapsed time since last refill.
   *
   * @returns `true` if a token was consumed and the request can proceed
   */
  canProceed(): boolean {
    const now = Date.now();
    const elapsed = now - this.lastRefill;

    // Refill tokens based on elapsed time
    this.tokens = Math.min(
      this.maxTokens,
      this.tokens + Math.floor(elapsed / this.refillRate)
    );

    // Update refill timestamp for consumed time units
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

/** Singleton rate limiter instance shared across the application */
export const globalRateLimiter = new RateLimiter();
