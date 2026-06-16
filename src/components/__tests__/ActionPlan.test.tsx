import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionPlan } from '../ActionPlan';

/**
 * ActionPlan Component Tests
 * Validates pledge rendering, toggle interaction, and accessibility.
 */
describe('ActionPlan Component', () => {
  const highFootprint = { transport: 4.5, diet: 3.0, energy: 5.0, shopping: 2.5, total: 15.0 };
  const lowFootprint = { transport: 0.3, diet: 0.3, energy: 0.3, shopping: 0.3, total: 1.2 };

  beforeEach(() => {
    window.localStorage.clear();
  });

  test('renders Action Plan heading', () => {
    render(<ActionPlan data={highFootprint} />);
    expect(screen.getByText(/Your Green Action Plan/i)).toBeInTheDocument();
  });

  test('renders pledges for high footprint user', () => {
    render(<ActionPlan data={highFootprint} />);
    expect(screen.getByText(/Switch to public transit/i)).toBeInTheDocument();
  });

  test('shows low footprint message when emissions are minimal', () => {
    render(<ActionPlan data={lowFootprint} />);
    expect(screen.getByText(/already very low/i)).toBeInTheDocument();
  });

  test('toggles pledge committed state on click', () => {
    render(<ActionPlan data={highFootprint} />);
    const pledge = screen.getByLabelText(/Commit to pledge: Switch to public transit/i);
    expect(pledge).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(pledge);
    expect(pledge).toHaveAttribute('aria-pressed', 'true');
  });

  test('shows savings banner when pledges are committed', () => {
    render(<ActionPlan data={highFootprint} />);
    const pledge = screen.getByLabelText(/Commit to pledge: Switch to public transit/i);
    fireEvent.click(pledge);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Your pledges could save/i)).toBeInTheDocument();
  });

  test('persists committed pledges to localStorage', () => {
    render(<ActionPlan data={highFootprint} />);
    const pledge = screen.getByLabelText(/Commit to pledge: Switch to public transit/i);
    fireEvent.click(pledge);
    const stored = JSON.parse(window.localStorage.getItem('committed-pledges') || '[]');
    expect(stored).toContain('t1');
  });

  test('all pledge buttons have aria-pressed attribute', () => {
    render(<ActionPlan data={highFootprint} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-pressed');
    });
  });

  test('has accessible section with aria-labelledby', () => {
    render(<ActionPlan data={highFootprint} />);
    expect(screen.getByRole('region', { name: /Your Green Action Plan/i })).toBeInTheDocument();
  });
});
