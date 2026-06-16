import React, { useMemo } from 'react';
import { EmissionData } from '../lib/utils';
import { GLOBAL_AVERAGE_FOOTPRINT, CATEGORY_COLORS } from '../lib/constants';
import { Globe, Leaf } from 'lucide-react';

interface DashboardProps {
  /** The user's calculated emission data */
  data: EmissionData;
}

/**
 * Dashboard component that visualizes the user's carbon footprint.
 * Displays total emissions vs. global average, a category breakdown bar chart,
 * and a contextual message about their standing.
 *
 * Memoized to prevent re-renders when parent state changes unrelated to `data`.
 */
const DashboardComponent: React.FC<DashboardProps> = ({ data }) => {
  /** Whether the user's footprint exceeds the global average */
  const isAboveAverage = useMemo(() => data.total > GLOBAL_AVERAGE_FOOTPRINT, [data.total]);

  /** Category breakdown data for bar chart rendering */
  const categories = useMemo(
    () => [
      { name: 'Transport', value: data.transport, color: CATEGORY_COLORS.transport },
      { name: 'Diet', value: data.diet, color: CATEGORY_COLORS.diet },
      { name: 'Energy', value: data.energy, color: CATEGORY_COLORS.energy },
      { name: 'Shopping', value: data.shopping, color: CATEGORY_COLORS.shopping },
    ],
    [data.transport, data.diet, data.energy, data.shopping]
  );

  /** Maximum value for scaling bar widths */
  const maxValue = useMemo(() => Math.max(data.total, 1), [data.total]);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <h2 id="dash-heading" className="heading-section">
        <Globe aria-hidden="true" /> Your Impact Dashboard
      </h2>

      <section aria-labelledby="dash-heading">
        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="stat-card">
            <p className="stat-label">Total Emissions</p>
            <p className="stat-value" style={{ color: isAboveAverage ? 'var(--error-color)' : 'var(--accent-primary)' }}>
              {data.total.toFixed(1)} <span className="stat-unit">tons/yr</span>
            </p>
          </div>

          <div className="stat-card">
            <p className="stat-label">Global Average</p>
            <p className="stat-value" style={{ color: 'var(--text-primary)' }}>
              {GLOBAL_AVERAGE_FOOTPRINT.toFixed(1)} <span className="stat-unit">tons/yr</span>
            </p>
          </div>
        </div>

        {/* Category breakdown */}
        <div>
          <h3 style={{ marginBottom: '1rem' }} className="text-muted">Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {categories.map((cat) => (
              <div key={cat.name} className="breakdown-row">
                <span className="breakdown-label">{cat.name}</span>
                <div className="breakdown-track">
                  <div
                    style={{
                      height: '100%',
                      width: `${(cat.value / maxValue) * 100}%`,
                      background: cat.color,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <span className="breakdown-value">{cat.value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contextual message */}
        <div className="info-banner">
          <Leaf
            size={32}
            color={isAboveAverage ? 'var(--error-color)' : 'var(--accent-primary)'}
            aria-hidden="true"
          />
          <p>
            {isAboveAverage
              ? 'Your footprint is above the global average. Check the EcoAssistant for personalized reduction strategies!'
              : 'Great job! Your footprint is below the global average. Keep up the good work and see if you can reduce even further!'}
          </p>
        </div>
      </section>
    </div>
  );
};

/** Memoized Dashboard to prevent unnecessary re-renders */
export const Dashboard = React.memo(DashboardComponent);
