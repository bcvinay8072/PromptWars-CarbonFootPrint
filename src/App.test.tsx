import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

/**
 * App Integration Tests
 * Validates the root application component's layout, accessibility landmarks,
 * and initial rendering behavior.
 */
describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage to ensure clean state
    window.localStorage.clear();
  });

  test('renders the platform title', () => {
    render(<App />);
    expect(screen.getByText(/CarbonFootprint Platform/i)).toBeInTheDocument();
  });

  test('renders the subtitle describing the platform mission', () => {
    render(<App />);
    expect(screen.getByText(/Understand, track, and reduce/i)).toBeInTheDocument();
  });

  test('has an accessible banner landmark (header)', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('has an accessible main landmark', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('has an accessible contentinfo landmark (footer)', () => {
    render(<App />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  test('renders the Calculator by default when no saved data', () => {
    render(<App />);
    expect(screen.getByText(/Calculate Your Footprint/i)).toBeInTheDocument();
  });

  test('footer contains copyright text', () => {
    render(<App />);
    expect(screen.getByText(/Carbon Footprint Awareness Platform/i)).toBeInTheDocument();
  });

  test('does not render Dashboard when no footprint data exists', () => {
    render(<App />);
    expect(screen.queryByText(/Your Impact Dashboard/i)).not.toBeInTheDocument();
  });

  test('renders year in copyright', () => {
    render(<App />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });
});
