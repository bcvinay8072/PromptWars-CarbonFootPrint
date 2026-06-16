import React, { useMemo, useCallback } from 'react';
import { CheckCircle, Circle, Leaf, TrendingDown } from 'lucide-react';
import { EmissionData } from '../lib/utils';
import { GREEN_PLEDGES, PledgeAction } from '../lib/constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface ActionPlanProps {
  /** The user's calculated emission data */
  data: EmissionData;
}

/**
 * ActionPlan component that renders personalized "Green Pledges" based on
 * the user's carbon footprint breakdown. Users can commit to specific
 * actions to reduce their environmental impact.
 *
 * Pledges are persisted via localStorage so commitments survive page refreshes.
 */
const ActionPlanComponent: React.FC<ActionPlanProps> = ({ data }) => {
  const [committedPledges, setCommittedPledges] = useLocalStorage<string[]>('committed-pledges', []);

  /** Filters pledges relevant to the user's footprint levels */
  const relevantPledges = useMemo(() => {
    const pledges: (PledgeAction & { category: string })[] = [];
    const categoryMap: Record<string, number> = {
      transport: data.transport,
      diet: data.diet,
      energy: data.energy,
      shopping: data.shopping,
    };

    for (const [category, actions] of Object.entries(GREEN_PLEDGES)) {
      const userValue = categoryMap[category] ?? 0;
      for (const action of actions) {
        if (userValue >= action.threshold) {
          pledges.push({ ...action, category });
        }
      }
    }
    return pledges;
  }, [data]);

  /** Toggles a pledge's committed state and persists to localStorage */
  const togglePledge = useCallback(
    (pledgeId: string) => {
      setCommittedPledges((prev) =>
        prev.includes(pledgeId)
          ? prev.filter((id) => id !== pledgeId)
          : [...prev, pledgeId]
      );
    },
    [setCommittedPledges]
  );

  /** Total potential savings from committed pledges */
  const totalSavings = useMemo(() => {
    return relevantPledges
      .filter((p) => committedPledges.includes(p.id))
      .reduce((sum, p) => sum + p.savingsTons, 0);
  }, [relevantPledges, committedPledges]);

  return (
    <div className="glass-panel animate-fade-in section-pad">
      <h2 id="action-heading" className="heading-section">
        <Leaf aria-hidden="true" /> Your Green Action Plan
      </h2>

      <section aria-labelledby="action-heading">
        {totalSavings > 0 && (
          <div className="savings-banner" role="status" aria-live="polite">
            <TrendingDown size={24} color="var(--accent-primary)" aria-hidden="true" />
            <p className="savings-text">
              Your pledges could save <strong>{totalSavings.toFixed(1)} tons CO₂/year</strong>!
            </p>
          </div>
        )}

        <div className="breakdown-list">
          {relevantPledges.map((pledge) => {
            const isCommitted = committedPledges.includes(pledge.id);
            return (
              <button
                key={pledge.id}
                onClick={() => togglePledge(pledge.id)}
                aria-pressed={isCommitted}
                aria-label={`${isCommitted ? 'Remove' : 'Commit to'} pledge: ${pledge.title}`}
                className={`pledge-item ${isCommitted ? 'pledge-committed' : 'pledge-default'}`}
              >
                <div className="pledge-icon">
                  {isCommitted ? (
                    <CheckCircle size={20} color="var(--accent-primary)" />
                  ) : (
                    <Circle size={20} color="var(--text-muted)" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p className="pledge-title">{pledge.title}</p>
                  <p className="pledge-desc">{pledge.description}</p>
                  <p className="pledge-savings">Saves ~{pledge.savingsTons} tons CO₂/year</p>
                </div>
              </button>
            );
          })}
        </div>

        {relevantPledges.length === 0 && (
          <p className="empty-pledges">
            Great news! Your footprint is already very low. Keep it up! 🌱
          </p>
        )}
      </section>
    </div>
  );
};

/** Memoized ActionPlan to prevent unnecessary re-renders */
export const ActionPlan = React.memo(ActionPlanComponent);
