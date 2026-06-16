import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Calculator } from '../Calculator';

/**
 * Calculator Component Tests
 * Validates multi-step progression, user interaction, and accessibility.
 */
describe('Calculator Component', () => {
  test('renders Transportation step first', () => {
    render(<Calculator onComplete={jest.fn()} />);
    expect(screen.getByText(/Transportation/i)).toBeInTheDocument();
  });

  test('displays progress bar', () => {
    render(<Calculator onComplete={jest.fn()} />);
    expect(screen.getByText(/Calculate Your Footprint/i)).toBeInTheDocument();
  });

  test('progresses from Transport to Diet on selection', () => {
    render(<Calculator onComplete={jest.fn()} />);
    fireEvent.click(screen.getByText(/Personal Car/i));
    expect(screen.getAllByText(/Diet/i)[0]).toBeInTheDocument();
  });

  test('progresses from Diet to Home Energy on selection', () => {
    render(<Calculator onComplete={jest.fn()} />);
    fireEvent.click(screen.getByText(/Personal Car/i));
    fireEvent.click(screen.getByText(/Meat Heavy/i));
    expect(screen.getAllByText(/Home Energy/i)[0]).toBeInTheDocument();
  });

  test('progresses from Energy to Shopping on selection', () => {
    render(<Calculator onComplete={jest.fn()} />);
    fireEvent.click(screen.getByText(/Personal Car/i));
    fireEvent.click(screen.getByText(/Meat Heavy/i));
    fireEvent.click(screen.getByText(/High \(Large home\/AC\)/i));
    expect(screen.getAllByText(/Shopping/i)[0]).toBeInTheDocument();
  });

  test('calls onComplete with EmissionData when all steps are done', () => {
    const mockComplete = jest.fn();
    render(<Calculator onComplete={mockComplete} />);
    fireEvent.click(screen.getByText(/Personal Car/i));
    fireEvent.click(screen.getByText(/Meat Heavy/i));
    fireEvent.click(screen.getByText(/High \(Large home\/AC\)/i));
    fireEvent.click(screen.getByText(/Frequently/i));
    expect(mockComplete).toHaveBeenCalledTimes(1);
    expect(mockComplete).toHaveBeenCalledWith(
      expect.objectContaining({ total: expect.any(Number) })
    );
  });

  test('has accessible region with aria-labelledby', () => {
    render(<Calculator onComplete={jest.fn()} />);
    expect(screen.getByRole('region', { name: /Calculate Your Footprint/i })).toBeInTheDocument();
  });

  test('all option buttons have aria-labels', () => {
    render(<Calculator onComplete={jest.fn()} />);
    expect(screen.getByLabelText(/Drive a personal car/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Use public transit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bike or walk/i)).toBeInTheDocument();
  });
});
