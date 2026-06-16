import React, { useState } from 'react';
import { Car, Utensils, Zap, ShoppingBag, ArrowRight } from 'lucide-react';
import { EmissionData } from '../lib/utils';

interface CalculatorProps {
  onComplete: (data: EmissionData) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<EmissionData>({ transport: 0, diet: 0, energy: 0, shopping: 0, total: 0 });

  // Heuristic calculation factors
  const handleTransport = (value: string) => {
    const impact = value === 'car' ? 4.5 : value === 'public' ? 1.5 : 0.5;
    setData(prev => ({ ...prev, transport: impact }));
    setStep(2);
  };

  const handleDiet = (value: string) => {
    const impact = value === 'meat' ? 3.0 : value === 'vegetarian' ? 1.5 : 0.8;
    setData(prev => ({ ...prev, diet: impact }));
    setStep(3);
  };

  const handleEnergy = (value: string) => {
    const impact = value === 'high' ? 5.0 : value === 'medium' ? 3.0 : 1.5;
    setData(prev => ({ ...prev, energy: impact }));
    setStep(4);
  };

  const handleShopping = (value: string) => {
    const impact = value === 'frequent' ? 2.5 : value === 'moderate' ? 1.5 : 0.5;
    const finalData = { 
      ...data, 
      shopping: impact, 
      total: data.transport + data.diet + data.energy + impact 
    };
    setData(finalData);
    onComplete(finalData);
  };

  return (
    <div className="glass-panel p-6 animate-fade-in" style={{ padding: '2rem' }}>
      <h2 id="calc-heading" className="text-2xl font-bold mb-4" style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Calculate Your Footprint</h2>
      
      {step === 1 && (
        <section aria-labelledby="calc-heading">
          <h3 className="text-xl mb-4" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Car aria-hidden="true" /> Transportation
          </h3>
          <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>How do you primarily commute?</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button aria-label="Drive a personal car" onClick={() => handleTransport('car')} style={btnStyle}>Personal Car</button>
            <button aria-label="Use public transit" onClick={() => handleTransport('public')} style={btnStyle}>Public Transit</button>
            <button aria-label="Bike or walk" onClick={() => handleTransport('bike')} style={btnStyle}>Bike / Walk</button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section aria-labelledby="calc-heading">
          <h3 className="text-xl mb-4" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Utensils aria-hidden="true" /> Diet
          </h3>
          <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>What best describes your diet?</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button aria-label="Meat in most meals" onClick={() => handleDiet('meat')} style={btnStyle}>Meat Heavy</button>
            <button aria-label="Vegetarian diet" onClick={() => handleDiet('vegetarian')} style={btnStyle}>Vegetarian</button>
            <button aria-label="Vegan diet" onClick={() => handleDiet('vegan')} style={btnStyle}>Vegan</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section aria-labelledby="calc-heading">
          <h3 className="text-xl mb-4" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap aria-hidden="true" /> Home Energy
          </h3>
          <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>How would you describe your home energy usage?</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button aria-label="High energy usage" onClick={() => handleEnergy('high')} style={btnStyle}>High (Large home/AC)</button>
            <button aria-label="Medium energy usage" onClick={() => handleEnergy('medium')} style={btnStyle}>Medium (Average)</button>
            <button aria-label="Low energy usage" onClick={() => handleEnergy('low')} style={btnStyle}>Low (Efficient/Solar)</button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section aria-labelledby="calc-heading">
          <h3 className="text-xl mb-4" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag aria-hidden="true" /> Shopping
          </h3>
          <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>How often do you buy new clothes/electronics?</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button aria-label="Frequent shopping" onClick={() => handleShopping('frequent')} style={btnStyle}>Frequently</button>
            <button aria-label="Moderate shopping" onClick={() => handleShopping('moderate')} style={btnStyle}>Moderately</button>
            <button aria-label="Rare shopping" onClick={() => handleShopping('rare')} style={btnStyle}>Rarely (Thrift/Repair)</button>
          </div>
        </section>
      )}

      <div style={{ marginTop: '2rem', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(step / 4) * 100}%`, background: 'var(--accent-primary)', transition: 'width 0.3s' }}></div>
      </div>
    </div>
  );
};

const btnStyle = {
  padding: '0.75rem 1.5rem',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
};
