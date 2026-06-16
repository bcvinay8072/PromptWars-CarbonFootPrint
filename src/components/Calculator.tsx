import React from 'react';
import { Car, Utensils, Zap, ShoppingBag } from 'lucide-react';
import { EmissionData } from '../lib/utils';
import { useCalculator } from '../hooks/useCalculator';

interface CalculatorProps {
  /** Callback invoked with the final EmissionData when all steps are completed */
  onComplete: (data: EmissionData) => void;
}

/**
 * Multi-step carbon footprint calculator component.
 * Guides users through 4 categories (transport, diet, energy, shopping)
 * to estimate their annual carbon footprint using heuristic emission factors.
 *
 * Uses the `useCalculator` custom hook for all business logic,
 * keeping this component focused purely on rendering.
 */
const CalculatorComponent: React.FC<CalculatorProps> = ({ onComplete }) => {
  const {
    step,
    progressPercent,
    handleTransport,
    handleDiet,
    handleEnergy,
    handleShopping,
  } = useCalculator(onComplete);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <h2 id="calc-heading" className="heading-section">
        Calculate Your Footprint
      </h2>

      {step === 1 && (
        <section aria-labelledby="calc-heading">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Car aria-hidden="true" /> Transportation
          </h3>
          <p style={{ marginBottom: '1rem' }} className="text-muted">How do you primarily commute?</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button aria-label="Drive a personal car" onClick={() => handleTransport('car')} className="btn-option">Personal Car</button>
            <button aria-label="Use public transit" onClick={() => handleTransport('public')} className="btn-option">Public Transit</button>
            <button aria-label="Bike or walk" onClick={() => handleTransport('bike')} className="btn-option">Bike / Walk</button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section aria-labelledby="calc-heading">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Utensils aria-hidden="true" /> Diet
          </h3>
          <p style={{ marginBottom: '1rem' }} className="text-muted">What best describes your diet?</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button aria-label="Meat in most meals" onClick={() => handleDiet('meat')} className="btn-option">Meat Heavy</button>
            <button aria-label="Vegetarian diet" onClick={() => handleDiet('vegetarian')} className="btn-option">Vegetarian</button>
            <button aria-label="Vegan diet" onClick={() => handleDiet('vegan')} className="btn-option">Vegan</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section aria-labelledby="calc-heading">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap aria-hidden="true" /> Home Energy
          </h3>
          <p style={{ marginBottom: '1rem' }} className="text-muted">How would you describe your home energy usage?</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button aria-label="High energy usage" onClick={() => handleEnergy('high')} className="btn-option">High (Large home/AC)</button>
            <button aria-label="Medium energy usage" onClick={() => handleEnergy('medium')} className="btn-option">Medium (Average)</button>
            <button aria-label="Low energy usage" onClick={() => handleEnergy('low')} className="btn-option">Low (Efficient/Solar)</button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section aria-labelledby="calc-heading">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag aria-hidden="true" /> Shopping
          </h3>
          <p style={{ marginBottom: '1rem' }} className="text-muted">How often do you buy new clothes/electronics?</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button aria-label="Frequent shopping" onClick={() => handleShopping('frequent')} className="btn-option">Frequently</button>
            <button aria-label="Moderate shopping" onClick={() => handleShopping('moderate')} className="btn-option">Moderately</button>
            <button aria-label="Rare shopping" onClick={() => handleShopping('rare')} className="btn-option">Rarely (Thrift/Repair)</button>
          </div>
        </section>
      )}

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  );
};

/** Memoized Calculator to prevent unnecessary re-renders from parent state changes */
export const Calculator = React.memo(CalculatorComponent);
