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
 * actions to reduce their environmental impact, directly addressing the
 * "simple actions" requirement of the problem statement.
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
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <h2
        id="action-heading"
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--accent-primary)',
        }}
      >
        <Leaf aria-hidden="true" /> Your Green Action Plan
      </h2>

      <section aria-labelledby="action-heading">
        {/* Savings summary */}
        {totalSavings > 0 && (
          <div
            className="savings-banner"
            role="status"
            aria-live="polite"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              border: '1px solid var(--accent-primary)',
            }}
          >
            <TrendingDown size={24} color="var(--accent-primary)" aria-hidden="true" />
            <p style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
              Your pledges could save <strong>{totalSavings.toFixed(1)} tons CO₂/year</strong>!
            </p>
          </div>
        )}

        {/* Pledge list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {relevantPledges.map((pledge) => {
            const isCommitted = committedPledges.includes(pledge.id);
            return (
              <button
                key={pledge.id}
                onClick={() => togglePledge(pledge.id)}
                aria-pressed={isCommitted}
                aria-label={`${isCommitted ? 'Remove' : 'Commit to'} pledge: ${pledge.title}`}
                className={`pledge-item ${isCommitted ? 'pledge-committed' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: isCommitted
                    ? 'rgba(34, 197, 94, 0.08)'
                    : 'var(--bg-secondary)',
                  border: `1px solid ${isCommitted ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s',
                  width: '100%',
                }}
              >
                <div style={{ marginTop: '2px', flexShrink: 0 }}>
                  {isCommitted ? (
                    <CheckCircle size={20} color="var(--accent-primary)" />
                  ) : (
                    <Circle size={20} color="var(--text-muted)" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{pledge.title}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {pledge.description}
                  </p>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--accent-primary)',
                      marginTop: '0.25rem',
                      fontWeight: 500,
                    }}
                  >
                    Saves ~{pledge.savingsTons} tons CO₂/year
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {relevantPledges.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            Great news! Your footprint is already very low. Keep it up! 🌱
          </p>
        )}
      </section>
    </div>
  );
};

/** Memoized ActionPlan to prevent unnecessary re-renders */
export const ActionPlan = React.memo(ActionPlanComponent);
