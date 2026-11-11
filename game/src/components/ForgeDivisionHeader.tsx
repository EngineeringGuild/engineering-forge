import { Link } from 'react-router-dom';
import { soundFx } from '../audio/soundFx';

interface Props {
  divisionCode: string;
  disciplineTitle: string;
  disciplineSubtitle: string;
  tagline: string;
  completedCount: number;
  totalCount: number;
  disciplineIcon?: string;
}

export function ForgeDivisionHeader({
  divisionCode,
  disciplineTitle,
  disciplineSubtitle,
  tagline,
  completedCount,
  totalCount,
  disciplineIcon = '⚙️',
}: Props) {
  const isAllDone = totalCount > 0 && completedCount === totalCount;

  return (
    <div className="mb-8">
      {/* Top Navigation & Status Bar */}
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/"
          onMouseEnter={() => soundFx.playSubtleHover()}
          onClick={() => soundFx.playTactileClick()}
          className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-surface-1/90 px-3 py-1.5 font-mono text-xs text-fg-muted hover:border-accent hover:text-fg transition-all active:scale-95"
        >
          <span className="text-accent">←</span>
          <span>MAIN TERMINAL</span>
        </Link>

        <div className="flex items-center gap-2 font-mono text-[11px] text-fg-subtle">
          <span className="led-indicator led-green animate-pulse" />
          <span>STATUS: ONLINE</span>
        </div>
      </div>

      {/* Industrial Header Card */}
      <header className="industrial-panel rounded-xl p-5 border border-border/90 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2 border border-border text-2xl shadow-inner">
              {disciplineIcon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
                  {divisionCode}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-2 border border-border text-fg-subtle">
                  {completedCount}/{totalCount} Completed
                </span>
              </div>
              <h1 className="font-display text-3xl font-extrabold text-fg mt-0.5">
                {disciplineTitle}
                {disciplineSubtitle && (
                  <span className="text-fg-muted font-normal text-xl ml-2">
                    · {disciplineSubtitle}
                  </span>
                )}
              </h1>
              <p className="mt-1 text-sm text-fg-muted max-w-lg">
                {tagline}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-border/60">
            <span
              className={`rounded-full px-3 py-1 font-mono text-xs font-semibold ${
                isAllDone
                  ? 'border border-success/40 bg-success/20 text-success shadow-[0_0_8px_rgba(22,163,74,0.3)]'
                  : completedCount > 0
                  ? 'border border-accent/40 bg-accent/20 text-accent'
                  : 'border border-border bg-surface-2 text-fg-subtle'
              }`}
            >
              {isAllDone ? '✓ Division Mastered' : `${Math.round((completedCount / (totalCount || 1)) * 100)}% Progress`}
            </span>
          </div>
        </div>
      </header>
    </div>
  );
}
