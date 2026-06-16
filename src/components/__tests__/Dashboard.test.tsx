import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../Dashboard';

/**
 * Dashboard Component Tests
 * Validates emissions rendering, breakdown visualization, and contextual messaging.
 */
describe('Dashboard Component', () => {
  const aboveAvgData = { transport: 2, diet: 1.5, energy: 3, shopping: 1, total: 7.5 };
  const belowAvgData = { transport: 0.5, diet: 0.8, energy: 1.5, shopping: 0.5, total: 3.3 };

  test('renders Dashboard heading with Globe icon', () => {
    render(<Dashboard data={aboveAvgData} />);
    expect(screen.getByText(/Your Impact Dashboard/i)).toBeInTheDocument();
  });

  test('renders total emissions value', () => {
    render(<Dashboard data={aboveAvgData} />);
    expect(screen.getByText(/7.5/)).toBeInTheDocument();
  });

  test('renders global average value', () => {
    render(<Dashboard data={aboveAvgData} />);
    expect(screen.getByText(/4.0/)).toBeInTheDocument();
  });

  test('renders all 4 category breakdown labels', () => {
    render(<Dashboard data={aboveAvgData} />);
    expect(screen.getByText('Transport')).toBeInTheDocument();
    expect(screen.getAllByText(/Diet/i)[0]).toBeInTheDocument();
    expect(screen.getByText('Energy')).toBeInTheDocument();
    expect(screen.getAllByText(/Shopping/i)[0]).toBeInTheDocument();
  });

  test('shows above average warning when footprint exceeds global avg', () => {
    render(<Dashboard data={aboveAvgData} />);
    expect(screen.getByText(/above the global average/i)).toBeInTheDocument();
  });

  test('shows positive message when footprint is below global avg', () => {
    render(<Dashboard data={belowAvgData} />);
    expect(screen.getByText(/below the global average/i)).toBeInTheDocument();
  });

  test('has accessible section with aria-labelledby', () => {
    render(<Dashboard data={aboveAvgData} />);
    expect(screen.getByRole('region', { name: /Your Impact Dashboard/i })).toBeInTheDocument();
  });
});
