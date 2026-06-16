import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { Calculator } from './components/Calculator';
import { Dashboard } from './components/Dashboard';
import { EcoAssistant } from './components/EcoAssistant';
import { sanitizeInput, globalRateLimiter } from './lib/utils';
import * as openaiLib from './lib/openai';

// Mock the OpenAI integration completely
jest.mock('./lib/openai', () => ({
  getEcoAdvice: jest.fn()
}));

// Utility Tests (10 tests)
describe('Security & Utilities', () => {
  test('sanitizeInput removes HTML tags', () => {
    expect(sanitizeInput('<script>alert(1)</script>Hello')).toBe('alert(1)Hello');
  });
  test('sanitizeInput removes javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
  });
  test('sanitizeInput removes on* handlers', () => {
    expect(sanitizeInput('onerror=alert(1)')).toBe('alert(1)'); // basic mock test
  });
  test('sanitizeInput handles empty input gracefully', () => {
    expect(sanitizeInput('')).toBe('');
  });
  test('sanitizeInput limits length', () => {
    const longString = 'a'.repeat(1500);
    expect(sanitizeInput(longString).length).toBe(1000);
  });
  
  test('RateLimiter initializes with tokens', () => {
    expect(globalRateLimiter.tokens).toBe(10);
  });
  test('RateLimiter consumes tokens', () => {
    const limiter = globalRateLimiter;
    const initial = limiter.tokens;
    limiter.canProceed();
    expect(limiter.tokens).toBeLessThan(initial);
  });
  test('RateLimiter prevents proceeding when empty', () => {
    // drain
    for (let i = 0; i < 20; i++) globalRateLimiter.canProceed();
    expect(globalRateLimiter.canProceed()).toBe(false);
  });
  test('RateLimiter refills over time (mocked)', () => {
    const oldTime = Date.now() - 5000;
    globalRateLimiter.lastRefill = oldTime;
    globalRateLimiter.canProceed();
    expect(globalRateLimiter.tokens).toBeGreaterThan(0);
  });
  test('RateLimiter handles large elapsed times', () => {
    globalRateLimiter.lastRefill = Date.now() - 100000;
    globalRateLimiter.canProceed();
    expect(globalRateLimiter.tokens).toBe(globalRateLimiter.maxTokens - 1);
  });
});

// App Tests (Accessibility & Integration) (10 tests)
describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders header with proper text', () => {
    render(<App />);
    expect(screen.getByText(/CarbonFootprint Platform/i)).toBeInTheDocument();
  });
  
  test('renders subtitle', () => {
    render(<App />);
    expect(screen.getByText(/Understand, track, and reduce/i)).toBeInTheDocument();
  });

  test('has banner landmark', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('has main landmark', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('has contentinfo landmark', () => {
    render(<App />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
  
  test('renders Calculator by default', () => {
    render(<App />);
    expect(screen.getByText(/Calculate Your Footprint/i)).toBeInTheDocument();
  });
  
  test('footer contains copyright', () => {
    render(<App />);
    expect(screen.getByText(/Carbon Footprint Awareness Platform/i)).toBeInTheDocument();
  });
  
  test('does not render Dashboard initially', () => {
    render(<App />);
    expect(screen.queryByText(/Your Impact Dashboard/i)).not.toBeInTheDocument();
  });
});

// Calculator Component (10 tests)
describe('Calculator Component', () => {
  test('renders step 1 first', () => {
    render(<Calculator onComplete={jest.fn()} />);
    expect(screen.getByText(/Transportation/i)).toBeInTheDocument();
  });

  test('can progress to step 2', () => {
    render(<Calculator onComplete={jest.fn()} />);
    fireEvent.click(screen.getByText(/Personal Car/i));
    expect(screen.getAllByText(/Diet/i)[0]).toBeInTheDocument();
  });

  test('can progress to step 3', () => {
    render(<Calculator onComplete={jest.fn()} />);
    fireEvent.click(screen.getByText(/Personal Car/i));
    fireEvent.click(screen.getByText(/Meat Heavy/i));
    expect(screen.getAllByText(/Home Energy/i)[0]).toBeInTheDocument();
  });

  test('can progress to step 4', () => {
    render(<Calculator onComplete={jest.fn()} />);
    fireEvent.click(screen.getByText(/Personal Car/i));
    fireEvent.click(screen.getByText(/Meat Heavy/i));
    fireEvent.click(screen.getByText(/High \(Large home\/AC\)/i));
    expect(screen.getAllByText(/Shopping/i)[0]).toBeInTheDocument();
  });

  test('calls onComplete when finished', () => {
    const mockComplete = jest.fn();
    render(<Calculator onComplete={mockComplete} />);
    fireEvent.click(screen.getByText(/Personal Car/i));
    fireEvent.click(screen.getByText(/Meat Heavy/i));
    fireEvent.click(screen.getByText(/High \(Large home\/AC\)/i));
    fireEvent.click(screen.getByText(/Frequently/i));
    expect(mockComplete).toHaveBeenCalled();
  });
  
  test('has aria-labelledby on section', () => {
    render(<Calculator onComplete={jest.fn()} />);
    expect(screen.getByRole('region', { name: /Calculate Your Footprint/i })).toBeInTheDocument();
  });
});

// Dashboard Tests (5 tests)
describe('Dashboard Component', () => {
  const mockData = { transport: 2, diet: 1.5, energy: 3, shopping: 1, total: 7.5 };
  
  test('renders Dashboard heading', () => {
    render(<Dashboard data={mockData} />);
    expect(screen.getByText(/Your Impact Dashboard/i)).toBeInTheDocument();
  });

  test('renders total emissions', () => {
    render(<Dashboard data={mockData} />);
    expect(screen.getByText(/7.5/)).toBeInTheDocument();
  });

  test('renders categories', () => {
    render(<Dashboard data={mockData} />);
    expect(screen.getByText(/Transport/)).toBeInTheDocument();
    expect(screen.getAllByText(/Diet/i)[0]).toBeInTheDocument();
  });
  
  test('shows above average warning', () => {
    render(<Dashboard data={mockData} />);
    expect(screen.getByText(/above the global average/i)).toBeInTheDocument();
  });
});

// EcoAssistant Tests (5 tests)
describe('EcoAssistant Component', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  test('renders welcome message', () => {
    render(<EcoAssistant />);
    expect(screen.getByText(/How can I help you/i)).toBeInTheDocument();
  });

  test('renders input field', () => {
    render(<EcoAssistant />);
    expect(screen.getByPlaceholderText(/Ask for advice/i)).toBeInTheDocument();
  });

  test('can type in input field', () => {
    render(<EcoAssistant />);
    const input = screen.getByPlaceholderText(/Ask for advice/i);
    fireEvent.change(input, { target: { value: 'How to save energy?' } });
    expect(input).toHaveValue('How to save energy?');
  });

  test('sends message and shows user text', async () => {
    (openaiLib.getEcoAdvice as jest.Mock).mockResolvedValue('Here is some advice.');
    render(<EcoAssistant />);
    const input = screen.getByPlaceholderText(/Ask for advice/i);
    fireEvent.change(input, { target: { value: 'test message' } });
    fireEvent.submit(input);
    expect(screen.getByText('test message')).toBeInTheDocument();
  });
});
