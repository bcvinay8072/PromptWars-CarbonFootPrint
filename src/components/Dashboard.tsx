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
 */
const DashboardComponent: React.FC<DashboardProps> = ({ data }) => {
  const isAboveAverage = useMemo(() => data.total > GLOBAL_AVERAGE_FOOTPRINT, [data.total]);

  const categories = useMemo(
    () => [
      { name: 'Transport', value: data.transport, color: CATEGORY_COLORS.transport },
      { name: 'Diet', value: data.diet, color: CATEGORY_COLORS.diet },
      { name: 'Energy', value: data.energy, color: CATEGORY_COLORS.energy },
      { name: 'Shopping', value: data.shopping, color: CATEGORY_COLORS.shopping },
    ],
    [data.transport, data.diet, data.energy, data.shopping]
  );

  const maxValue = useMemo(() => Math.max(data.total, 1), [data.total]);

  return (
    <div className="glass-panel animate-fade-in section-pad">
      <h2 id="dash-heading" className="heading-section">
        <Globe aria-hidden="true" /> Your Impact Dashboard
      </h2>

      <section aria-labelledby="dash-heading">
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Total Emissions</p>
            <p className="stat-value" style={{ color: isAboveAverage ? 'var(--error-color)' : 'var(--accent-primary)' }}>
              {data.total.toFixed(1)} <span className="stat-unit">tons/yr</span>
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Global Average</p>
            <p className="stat-value">
              {GLOBAL_AVERAGE_FOOTPRINT.toFixed(1)} <span className="stat-unit">tons/yr</span>
            </p>
          </div>
        </div>

        <div>
          <h3 className="breakdown-heading text-muted">Breakdown</h3>
          <div className="breakdown-list">
            {categories.map((cat) => (
              <div key={cat.name} className="breakdown-row">
                <span className="breakdown-label">{cat.name}</span>
                <div className="breakdown-track">
                  <div style={{ height: '100%', width: `${(cat.value / maxValue) * 100}%`, background: cat.color, transition: 'width 0.3s ease' }} />
                </div>
                <span className="breakdown-value">{cat.value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="info-banner">
          <Leaf size={32} color={isAboveAverage ? 'var(--error-color)' : 'var(--accent-primary)'} aria-hidden="true" />
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
