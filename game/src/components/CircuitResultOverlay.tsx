import type { CircuitTestResult } from '../state/circuitStore';

interface Props {
  result: CircuitTestResult;
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

export function CircuitResultOverlay({
  result,
  budget,
  hasNext,
  onRetry,
  onNext,
  onLevelSelect,
}: Props) {
  const open = result.status === 'open';
  const passed = result.status === 'analyzed' && result.passed;
  const overBudget = result.status === 'analyzed' && result.cost > budget;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
        {open && (
          <>
            <h2 className="font-display text-2xl text-danger">Open circuit</h2>
            <p className="mt-2 text-sm text-fg-muted">
              Part of this circuit has no path back to the battery — current can't flow. Check
              that every connection leads all the way from + to −, through the bulb.
            </p>
          </>
        )}

        {result.status === 'analyzed' && result.anyBurnedOut && (
          <>
            <h2 className="font-display text-2xl text-danger">Something burned out</h2>
            <p className="mt-2 text-sm text-fg-muted">
              At least one component (shown in red) drew more power than it can handle. Add
              series resistance to bring the current down.
            </p>
          </>
        )}

        {result.status === 'analyzed' && !result.anyBurnedOut && result.anyUnderpowered && (
          <>
            <h2 className="font-display text-2xl text-info">Too dim</h2>
            <p className="mt-2 text-sm text-fg-muted">
              Current is flowing, but the bulb (shown in blue) isn't getting enough power to
              light up properly. Cut back on series resistance.
            </p>
          </>
        )}

        {result.status === 'analyzed' && !result.anyBurnedOut && !result.anyUnderpowered && overBudget && (
          <>
            <h2 className="font-display text-2xl text-warning">Over budget</h2>
            <p className="mt-2 text-sm text-fg-muted">
              It lights up — but it cost ${result.cost.toFixed(0)} against a ${budget} budget.
              Trim the wiring or use cheaper components where the numbers allow it.
            </p>
          </>
        )}

        {passed && (
          <>
            <h2 className="font-display text-2xl text-success">It lights up!</h2>
            <p className="mt-1 text-sm text-fg-muted">
              Built for ${result.status === 'analyzed' ? result.cost.toFixed(0) : ''} of ${budget}.
            </p>
            <div className="mt-3 flex justify-center">
              <Stars count={result.status === 'analyzed' ? result.stars : 0} />
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
