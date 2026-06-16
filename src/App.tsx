import React, { useState, Suspense, lazy } from 'react';
import { Calculator } from './components/Calculator';
import { EmissionData } from './lib/utils';
import { Leaf, RefreshCcw } from 'lucide-react';

// Lazy load Dashboard and EcoAssistant for Efficiency
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const EcoAssistant = lazy(() => import('./components/EcoAssistant').then(module => ({ default: module.EcoAssistant })));

function App() {
  const [footprintData, setFootprintData] = useState<EmissionData | null>(null);

  const handleReset = () => {
    setFootprintData(null);
  };

  const LoadingFallback = () => (
    <div role="status" aria-label="Loading component" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      Loading...
    </div>
  );

  return (
    <div className="App" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header role="banner" style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', fontSize: '2.5rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
          <Leaf size={40} aria-hidden="true" />
          CarbonFootprint Platform
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>
          Understand, track, and reduce your environmental impact.
        </p>
      </header>

      <main id="main-content" role="main">
        {!footprintData ? (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Calculator onComplete={setFootprintData} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button 
                  onClick={handleReset}
                  aria-label="Recalculate footprint"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                >
                  <RefreshCcw size={16} aria-hidden="true" /> Recalculate
                </button>
              </div>
              <Suspense fallback={<LoadingFallback />}>
                <Dashboard data={footprintData} />
              </Suspense>
            </div>
            
            <div>
              <Suspense fallback={<LoadingFallback />}>
                <EcoAssistant footprintData={footprintData} />
              </Suspense>
            </div>
          </div>
        )}
      </main>
      
      <footer role="contentinfo" style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
        <p>© {new Date().getFullYear()} Carbon Footprint Awareness Platform. Challenge 3.</p>
      </footer>
    </div>
  );
}

export default App;
