import { useEffect, useRef } from 'react';
import { Stars } from './Stars';
import type { TestResult } from '../state/gameStore';

interface Props {
  result: TestResult;
  budget: number;
  hasNext: boolean;
  onRetry: () => void;
  onNext: () => void;
  onLevelSelect: () => void;
}

export function ResultOverlay({ result, budget, hasNext, onRetry, onNext, onLevelSelect }: Props) {
  const unstable = result.status === 'unstable';
  const passed = result.status === 'analyzed' && result.passed;
  const overBudget = result.status === 'analyzed' && result.cost > budget;
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [result]);

  const heading = unstable
    ? { text: 'Unstable structure', className: 'text-danger' }
    : result.status === 'analyzed' && result.anyFailed
      ? { text: 'It collapsed', className: 'text-danger' }
      : result.status === 'analyzed' && !result.anyFailed && overBudget
        ? { text: 'Over budget', className: 'text-warning' }
        : passed
          ? { text: 'It holds!', className: 'text-success' }
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

        {unstable && (
          <p className="mt-2 text-sm text-fg-muted">
            This shape can sway without any member stretching — a mechanism, not a bridge. Every
            joint needs to be pinned in place by a triangle of members, not just connected in a
            straight line.
          </p>
        )}

        {result.status === 'analyzed' && result.anyFailed && (
          <>
            {result.members.some((m) => m.wentSlack) ? (
              <p className="mt-2 text-sm text-fg-muted">
                A cable (shown in red) ended up under compression — cables can only pull, never
                push. Rework the shape so that member is in tension instead, or rebuild it in a
                rigid material.
              </p>
            ) : result.members.some((m) => m.pulledApart) ? (
              <p className="mt-2 text-sm text-fg-muted">
                A strut (shown in red) ended up under tension — struts rest in place and can only
                push, never pull. Rework the shape so that member is in compression instead, or
                rebuild it in a rigid material.
              </p>
            ) : (
              <p className="mt-2 text-sm text-fg-muted">
                At least one member (shown in red) took more force than it can carry. Add a member
                to share the load, or switch it to a stronger material.
              </p>
            )}
          </>
        )}

        {result.status === 'analyzed' && !result.anyFailed && overBudget && (
          <p className="mt-2 text-sm text-fg-muted">
            It holds — but it cost ${result.cost.toFixed(0)} against a ${budget} budget. Trim
            material or swap steel for wood where the numbers allow it.
          </p>
        )}

        {passed && (
          <>
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
