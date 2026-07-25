import type { VehicleTestResult } from '../state/vehicleStore';

interface Props {
  result: VehicleTestResult;
  targetSpeed: number;
  budget: number;
  hasNext: boolean;
  onRetry: () => void;
  onNext: () => void;
  onLevelSelect: () => void;
}

const STAR_CHARS = ['☆', '☆', '☆'] as const;

function Stars({ count }: { count: number }) {
  return (
    <div className="text-3xl tracking-widest text-warning">
      {STAR_CHARS.map((_, i) => (
        <span key={i}>{i < count ? '★' : '☆'}</span>
      ))}
    </div>
  );
}

export function VehicleResultOverlay({
  result,
  targetSpeed,
  budget,
  hasNext,
  onRetry,
  onNext,
  onLevelSelect,
}: Props) {
  const stalled = result.analysis.stalled;
  const tooSlow = !stalled && result.analysis.finalSpeed < targetSpeed;
  const overBudget = !stalled && !tooSlow && result.cost > budget;
  const passed = result.passed;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
        {stalled && (
          <>
            <h2 className="font-display text-2xl text-danger">Stalled</h2>
            <p className="mt-2 text-sm text-fg-muted">
              Gravity along the grade beat the force reaching the road — it never moved forward at
              all. Pick a stronger engine or shed some mass.
            </p>
          </>
        )}

        {tooSlow && (
          <>
            <h2 className="font-display text-2xl text-danger">Too slow</h2>
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

        {!tooSlow && overBudget && (
          <>
            <h2 className="font-display text-2xl text-warning">Over budget</h2>
            <p className="mt-2 text-sm text-fg-muted">
              It reaches {result.analysis.finalSpeed.toFixed(1)} m/s — but cost ${result.cost} against
              a ${budget} budget.
            </p>
          </>
        )}

        {passed && (
          <>
            <h2 className="font-display text-2xl text-success">Target reached!</h2>
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
