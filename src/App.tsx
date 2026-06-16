import React, { useCallback, Suspense, lazy } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Calculator } from './components/Calculator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { EmissionData } from './lib/utils';
import { Leaf, RefreshCcw } from 'lucide-react';

// Lazy load heavy components for optimal code-splitting and initial load speed
const Dashboard = lazy(() =>
  import('./components/Dashboard').then((module) => ({ default: module.Dashboard }))
);
const EcoAssistant = lazy(() =>
  import('./components/EcoAssistant').then((module) => ({ default: module.EcoAssistant }))
);
const ActionPlan = lazy(() =>
  import('./components/ActionPlan').then((module) => ({ default: module.ActionPlan }))
);

/**
 * Loading fallback component displayed while lazy-loaded components are fetched.
 * Defined outside App to prevent re-creation on every render cycle.
 */
const LoadingFallback: React.FC = () => (
  <div
    role="status"
    aria-label="Loading component"
    className="text-muted"
    style={{ padding: '2rem', textAlign: 'center' }}
  >
    Loading...
  </div>
);

/**
 * Root application component for the Carbon Footprint Awareness Platform.
 * Manages the global footprint state and coordinates between the Calculator,
 * Dashboard, EcoAssistant, and ActionPlan views.
 */
function App() {
  const [footprintData, setFootprintData] = useLocalStorage<EmissionData | null>(
    'carbon-footprint-data',
    null
  );

  /** Resets the footprint data and returns to the calculator view */
  const handleReset = useCallback(() => {
    setFootprintData(null);
    window.localStorage.removeItem('committed-pledges');
  }, [setFootprintData]);

  return (
    <ErrorBoundary>
      <div className="container">
        <header role="banner" style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 className="heading-primary">
            <Leaf size={40} aria-hidden="true" />
            CarbonFootprint Platform
          </h1>
          <p className="subtitle">
            Understand, track, and reduce your environmental impact.
          </p>
        </header>

        <main id="main-content" role="main">
          {!footprintData ? (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <Calculator onComplete={setFootprintData} />
            </div>
          ) : (
            <div className="grid-results">
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <button
                    onClick={handleReset}
                    aria-label="Recalculate footprint"
                    className="btn-ghost"
                  >
                    <RefreshCcw size={16} aria-hidden="true" /> Recalculate
                  </button>
                </div>
                <Suspense fallback={<LoadingFallback />}>
                  <Dashboard data={footprintData} />
                </Suspense>
                <div style={{ marginTop: '2rem' }}>
                  <Suspense fallback={<LoadingFallback />}>
                    <ActionPlan data={footprintData} />
                  </Suspense>
                </div>
              </div>

              <div>
                <Suspense fallback={<LoadingFallback />}>
                  <EcoAssistant footprintData={footprintData} />
                </Suspense>
              </div>
            </div>
          )}
        </main>

        <footer role="contentinfo" className="app-footer">
          <p>© {new Date().getFullYear()} Carbon Footprint Awareness Platform. Challenge 3.</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
