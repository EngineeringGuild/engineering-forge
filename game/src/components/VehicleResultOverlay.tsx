import { useEffect, useRef } from 'react';
import { Stars } from './Stars';
import type { VehicleTestResult } from '../state/vehicleStore';

interface Props {
  result: VehicleTestResult;
  targetSpeed: number;
  maxSpeed?: number;
  budget: number;
  hasNext: boolean;
  onRetry: () => void;
  onNext: () => void;
  onLevelSelect: () => void;
}

export function VehicleResultOverlay({
  result,
  targetSpeed,
  maxSpeed,
  budget,
  hasNext,
  onRetry,
  onNext,
  onLevelSelect,
}: Props) {
  const stalled = result.analysis.stalled;
  const tooSlow = !stalled && result.analysis.finalSpeed < targetSpeed;
  const tooFast = !stalled && !tooSlow && maxSpeed !== undefined && result.analysis.finalSpeed > maxSpeed;
  const overBudget = !stalled && !tooSlow && !tooFast && result.cost > budget;
  const passed = result.passed;
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [result]);

  const heading = stalled
    ? { text: 'Stalled', className: 'text-danger' }
    : tooSlow
      ? { text: 'Too slow', className: 'text-danger' }
      : tooFast
        ? { text: 'Too fast', className: 'text-danger' }
        : overBudget
          ? { text: 'Over budget', className: 'text-warning' }
          : passed
            ? { text: 'Target reached!', className: 'text-success' }
            : null;

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-heading"
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
        {heading && (
          <h2
            id="result-heading"
            ref={headingRef}
            tabIndex={-1}
            className={`font-display text-2xl outline-none ${heading.className}`}
          >
            {heading.text}
          </h2>
        )}

        {stalled && (
          <p className="mt-2 text-sm text-fg-muted">
            Gravity along the grade beat the force reaching the road — it never moved forward at
            all. Pick a stronger engine or shed some mass.
          </p>
        )}

        {tooSlow && (
          <>
            <p className="mt-2 text-sm text-fg-muted">
              Reached {result.analysis.finalSpeed.toFixed(1)} m/s — short of the{' '}
              {targetSpeed} m/s target. Pick a stronger engine or shed some mass.
            </p>
            {result.analysis.tractionLimited && (
              <p className="mt-2 text-xs text-fg-subtle">
                The tires spun before the engine's full force reached the road — a heavier chassis
                grips harder, but also accelerates slower for the same force. Worth checking both.
              </p>
            )}
          </>
        )}

        {tooFast && (
          <p className="mt-2 text-sm text-fg-muted">
            Reached {result.analysis.finalSpeed.toFixed(1)} m/s — past the {maxSpeed} m/s ceiling
            for this run. Ease off: a weaker engine or a heavier chassis both bring it down.
          </p>
        )}

        {!tooSlow && !tooFast && overBudget && (
          <p className="mt-2 text-sm text-fg-muted">
            It reaches {result.analysis.finalSpeed.toFixed(1)} m/s — but cost ${result.cost} against
            a ${budget} budget.
          </p>
        )}

        {passed && (
          <>
            <p className="mt-1 text-sm text-fg-muted">
              {result.analysis.finalSpeed.toFixed(1)} m/s, built for ${result.cost} of ${budget}.
            </p>
            {result.analysis.tractionLimited && (
              <p className="mt-2 text-xs text-fg-subtle">
                Even here, the tires capped the engine's force before all of it reached the road —
                a stronger engine than this wouldn't have added any more speed.
              </p>
            )}
            <div className="mt-3 flex justify-center">
              <Stars count={result.stars} />
            </div>
          </>
        )}

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onLevelSelect}
            className="rounded-lg border border-border px-4 py-2 text-sm text-fg-muted hover:text-fg"
          >
            Levels
          </button>
          <button
            onClick={onRetry}
            className="rounded-lg border border-border px-4 py-2 text-sm text-fg hover:border-accent"
          >
            Retry
          </button>
          {passed && hasNext && (
            <button
              onClick={onNext}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
            >
              Next Level
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
