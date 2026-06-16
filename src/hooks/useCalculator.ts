import { useState, useCallback } from 'react';
import { EmissionData } from '../lib/utils';
import { EMISSION_FACTORS } from '../lib/constants';

/**
 * Custom hook that manages the multi-step carbon footprint calculator logic.
 * Separates business logic from UI rendering for better testability and reuse.
 *
 * @param onComplete - Callback invoked with the final EmissionData when all steps are done
 * @returns Step state, emission data, and handler functions for each category
 */
export function useCalculator(onComplete: (data: EmissionData) => void) {
  const [step, setStep] = useState<number>(1);
  const [data, setData] = useState<EmissionData>({
    transport: 0,
    diet: 0,
    energy: 0,
    shopping: 0,
    total: 0,
  });

  /** Handles transport selection and advances to step 2 */
  const handleTransport = useCallback((value: keyof typeof EMISSION_FACTORS.transport) => {
    const impact = EMISSION_FACTORS.transport[value];
    setData((prev) => ({ ...prev, transport: impact }));
    setStep(2);
  }, []);

  /** Handles diet selection and advances to step 3 */
  const handleDiet = useCallback((value: keyof typeof EMISSION_FACTORS.diet) => {
    const impact = EMISSION_FACTORS.diet[value];
    setData((prev) => ({ ...prev, diet: impact }));
    setStep(3);
  }, []);

  /** Handles energy selection and advances to step 4 */
  const handleEnergy = useCallback((value: keyof typeof EMISSION_FACTORS.energy) => {
    const impact = EMISSION_FACTORS.energy[value];
    setData((prev) => ({ ...prev, energy: impact }));
    setStep(4);
  }, []);

  /** Handles shopping selection, computes total, and triggers onComplete */
  const handleShopping = useCallback(
    (value: keyof typeof EMISSION_FACTORS.shopping) => {
      const impact = EMISSION_FACTORS.shopping[value];
      setData((prev) => {
        const finalData: EmissionData = {
          ...prev,
          shopping: impact,
          total: prev.transport + prev.diet + prev.energy + impact,
        };
        onComplete(finalData);
        return finalData;
      });
    },
    [onComplete]
  );

  /** Total number of calculator steps */
  const totalSteps = 4;

  /** Current progress as a percentage (0-100) */
  const progressPercent = (step / totalSteps) * 100;

  return {
    step,
    data,
    totalSteps,
    progressPercent,
    handleTransport,
    handleDiet,
    handleEnergy,
    handleShopping,
  };
}
