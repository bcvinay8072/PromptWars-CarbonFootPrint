import React from 'react';
import { EmissionData } from '../lib/utils';
import { Globe, Leaf } from 'lucide-react';

interface DashboardProps {
  data: EmissionData;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const globalAverage = 4.0; // tons CO2/year per capita (world avg)
  const isAboveAverage = data.total > globalAverage;

  const categories = [
    { name: 'Transport', value: data.transport, color: '#ef4444' },
    { name: 'Diet', value: data.diet, color: '#f59e0b' },
    { name: 'Energy', value: data.energy, color: '#3b82f6' },
    { name: 'Shopping', value: data.shopping, color: '#a855f7' },
  ];

  return (
    <div className="glass-panel p-6 animate-fade-in" style={{ padding: '2rem' }}>
      <h2 id="dash-heading" className="text-2xl font-bold mb-6" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
        <Globe aria-hidden="true" /> Your Impact Dashboard
      </h2>

      <section aria-labelledby="dash-heading">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Emissions</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: isAboveAverage ? 'var(--error-color)' : 'var(--accent-primary)' }}>
              {data.total.toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>tons/yr</span>
            </p>
          </div>

          <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Global Average</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {globalAverage.toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>tons/yr</span>
            </p>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {categories.map(cat => (
              <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ width: '80px' }}>{cat.name}</span>
                <div style={{ flex: 1, height: '12px', background: 'var(--bg-secondary)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${(cat.value / Math.max(data.total, 1)) * 100}%`, 
                    background: cat.color 
                  }}></div>
                </div>
                <span style={{ width: '40px', textAlign: 'right' }}>{cat.value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Leaf size={32} color={isAboveAverage ? 'var(--error-color)' : 'var(--accent-primary)'} aria-hidden="true" />
          <p>
            {isAboveAverage 
              ? "Your footprint is above the global average. Check the EcoAssistant for personalized reduction strategies!" 
              : "Great job! Your footprint is below the global average. Keep up the good work and see if you can reduce even further!"}
          </p>
        </div>
      </section>
    </div>
  );
};
