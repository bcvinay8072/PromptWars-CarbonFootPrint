import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EcoAssistant } from '../EcoAssistant';
import * as openaiLib from '../../lib/openai';

// Mock react-markdown to avoid ESM parsing issues in Jest
jest.mock('react-markdown', () => {
  const mockReact = require('react');
  return ({ children }: { children: string }) =>
    mockReact.createElement('div', { 'data-testid': 'markdown' }, children);
});

// Mock the OpenAI integration
jest.mock('../../lib/openai', () => ({
  getEcoAdvice: jest.fn(),
}));

/**
 * EcoAssistant Component Tests
 * Validates chat rendering, user interaction, streaming, and accessibility.
 */
describe('EcoAssistant Component', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders welcome message on mount', () => {
    render(<EcoAssistant />);
    expect(screen.getByText(/How can I help you/i)).toBeInTheDocument();
  });

  test('renders EcoAssistant heading', () => {
    render(<EcoAssistant />);
    expect(screen.getByText('EcoAssistant')).toBeInTheDocument();
  });

  test('renders chat input with placeholder', () => {
    render(<EcoAssistant />);
    expect(screen.getByPlaceholderText(/Ask for advice/i)).toBeInTheDocument();
  });

  test('allows typing in the input field', () => {
    render(<EcoAssistant />);
    const input = screen.getByPlaceholderText(/Ask for advice/i);
    fireEvent.change(input, { target: { value: 'How to save energy?' } });
    expect(input).toHaveValue('How to save energy?');
  });

  test('displays user message after sending', async () => {
    (openaiLib.getEcoAdvice as jest.Mock).mockResolvedValue('Here is some advice.');
    render(<EcoAssistant />);
    const input = screen.getByPlaceholderText(/Ask for advice/i);
    fireEvent.change(input, { target: { value: 'test message' } });
    fireEvent.submit(input);
    expect(screen.getByText('test message')).toBeInTheDocument();
    // Wait for async state updates to complete
    await waitFor(() => {
      expect(openaiLib.getEcoAdvice).toHaveBeenCalled();
    });
  });

  test('clears input after sending', async () => {
    (openaiLib.getEcoAdvice as jest.Mock).mockResolvedValue('Advice.');
    render(<EcoAssistant />);
    const input = screen.getByPlaceholderText(/Ask for advice/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.submit(input);
    expect(input.value).toBe('');
    // Wait for async state updates to complete
    await waitFor(() => {
      expect(openaiLib.getEcoAdvice).toHaveBeenCalled();
    });
  });

  test('has accessible chat log with role="log"', () => {
    render(<EcoAssistant />);
    expect(screen.getByRole('log')).toBeInTheDocument();
  });

  test('has aria-live="polite" on chat log', () => {
    render(<EcoAssistant />);
    expect(screen.getByRole('log')).toHaveAttribute('aria-live', 'polite');
  });

  test('send button has aria-label', () => {
    render(<EcoAssistant />);
    expect(screen.getByLabelText(/Send message/i)).toBeInTheDocument();
  });
});
