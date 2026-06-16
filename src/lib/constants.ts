/**
 * Application-wide constants for the Carbon Footprint Awareness Platform.
 * Centralizes all magic numbers, configuration values, and emission factors
 * to improve maintainability and readability.
 * @module constants
 */

/** Global average carbon footprint in tons CO2/year per capita (world average) */
export const GLOBAL_AVERAGE_FOOTPRINT = 4.0;

/** Maximum allowed length for user input to prevent payload bloat */
export const MAX_INPUT_LENGTH = 1000;

/** Default AI model for the OpenAI proxy */
export const DEFAULT_AI_MODEL = 'gpt-4o-mini';

/** Maximum tokens for AI response generation */
export const MAX_AI_TOKENS = 300;

/** AI response temperature (0-1 scale for creativity) */
export const AI_TEMPERATURE = 0.7;

/**
 * Rate limiter configuration for API abuse prevention.
 */
export const RATE_LIMITER_CONFIG = {
  /** Maximum number of tokens available */
  maxTokens: 10,
  /** Milliseconds per token refill */
  refillRateMs: 2000,
} as const;

/**
 * Emission impact factors by category (in tons CO2/year).
 * Based on EPA and IPCC heuristic data for individual lifestyle assessment.
 */
export const EMISSION_FACTORS = {
  transport: {
    car: 4.5,
    public: 1.5,
    bike: 0.5,
  },
  diet: {
    meat: 3.0,
    vegetarian: 1.5,
    vegan: 0.8,
  },
  energy: {
    high: 5.0,
    medium: 3.0,
    low: 1.5,
  },
  shopping: {
    frequent: 2.5,
    moderate: 1.5,
    rare: 0.5,
  },
} as const;

/**
 * Category metadata for Dashboard visualization.
 */
export const CATEGORY_COLORS = {
  transport: '#ef4444',
  diet: '#f59e0b',
  energy: '#3b82f6',
  shopping: '#a855f7',
} as const;

/**
 * Personalized green pledge actions mapped by footprint category.
 * Each action includes the potential CO2 savings per year.
 */
export const GREEN_PLEDGES = {
  transport: [
    { id: 't1', title: 'Switch to public transit', description: 'Take the bus or train instead of driving', savingsTons: 3.0, threshold: 2.0 },
    { id: 't2', title: 'Carpool to work', description: 'Share rides with colleagues twice a week', savingsTons: 1.5, threshold: 2.0 },
    { id: 't3', title: 'Walk or cycle for short trips', description: 'Replace car trips under 3km with walking or biking', savingsTons: 0.8, threshold: 0.5 },
  ],
  diet: [
    { id: 'd1', title: 'Try Meatless Mondays', description: 'Replace meat with plant-based meals one day per week', savingsTons: 0.5, threshold: 1.5 },
    { id: 'd2', title: 'Reduce beef consumption', description: 'Switch from beef to chicken or fish twice a week', savingsTons: 1.0, threshold: 2.0 },
    { id: 'd3', title: 'Buy local and seasonal produce', description: 'Reduce food transport emissions by shopping locally', savingsTons: 0.3, threshold: 0.5 },
  ],
  energy: [
    { id: 'e1', title: 'Switch to LED lighting', description: 'Replace all bulbs with energy-efficient LEDs', savingsTons: 0.4, threshold: 1.5 },
    { id: 'e2', title: 'Reduce AC usage by 2°C', description: 'Set thermostat 2 degrees higher in summer', savingsTons: 1.0, threshold: 3.0 },
    { id: 'e3', title: 'Unplug idle electronics', description: 'Eliminate phantom power draw from unused devices', savingsTons: 0.3, threshold: 1.5 },
  ],
  shopping: [
    { id: 's1', title: 'Buy secondhand clothing', description: 'Shop thrift stores before buying new', savingsTons: 0.5, threshold: 1.0 },
    { id: 's2', title: 'Repair instead of replace', description: 'Fix electronics and clothing instead of discarding', savingsTons: 0.4, threshold: 1.0 },
    { id: 's3', title: 'Avoid fast fashion', description: 'Choose quality, durable items over disposable trends', savingsTons: 0.6, threshold: 1.5 },
  ],
} as const;

/** Type for a single pledge action */
export interface PledgeAction {
  id: string;
  title: string;
  description: string;
  savingsTons: number;
  threshold: number;
}
