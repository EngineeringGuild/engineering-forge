import type { TestResult } from '../state/gameStore';

interface Props {
  result: TestResult;
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

export function ResultOverlay({ result, budget, hasNext, onRetry, onNext, onLevelSelect }: Props) {
  const unstable = result.status === 'unstable';
  const passed = result.status === 'analyzed' && result.passed;
  const overBudget = result.status === 'analyzed' && result.cost > budget;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
        {unstable && (
          <>
            <h2 className="font-display text-2xl text-danger">Unstable structure</h2>
            <p className="mt-2 text-sm text-fg-muted">
              This shape can sway without any member stretching — a mechanism, not a bridge. Every
              joint needs to be pinned in place by a triangle of members, not just connected in a
              straight line.
            </p>
          </>
        )}

        {result.status === 'analyzed' && result.anyFailed && (
          <>
            <h2 className="font-display text-2xl text-danger">It collapsed</h2>
            <p className="mt-2 text-sm text-fg-muted">
              At least one member (shown in red) took more force than it can carry. Add a member
              to share the load, or switch it to a stronger material.
            </p>
          </>
        )}

        {result.status === 'analyzed' && !result.anyFailed && overBudget && (
          <>
            <h2 className="font-display text-2xl text-warning">Over budget</h2>
            <p className="mt-2 text-sm text-fg-muted">
              It holds — but it cost ${result.cost.toFixed(0)} against a ${budget} budget. Trim
              material or swap steel for wood where the numbers allow it.
            </p>
          </>
        )}

        {passed && (
          <>
            <h2 className="font-display text-2xl text-success">It holds!</h2>
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
