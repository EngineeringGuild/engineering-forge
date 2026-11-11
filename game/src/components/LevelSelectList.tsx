import { Link } from 'react-router-dom';
import { soundFx } from '../audio/soundFx';

export interface LevelSelectItem {
  id: string;
  name: string;
  tagline: string;
}

interface Props {
  levels: LevelSelectItem[];
  basePath: string;
  isLevelUnlocked: (levelId: string) => boolean;
  starsFor: (levelId: string) => number;
  isCompleted?: (levelId: string) => boolean;
  showProgressHeader?: boolean;
}

export function LevelSelectList({
  levels,
  basePath,
  isLevelUnlocked,
  starsFor,
  isCompleted,
  showProgressHeader = true,
}: Props) {
  const completedLevels = levels.filter((lvl) => {
    const unlocked = isLevelUnlocked(lvl.id);
    const stars = starsFor(lvl.id);
    return unlocked && (isCompleted ? isCompleted(lvl.id) : stars > 0);
  });
  const completedCount = completedLevels.length;
  const totalCount = levels.length;
  const earnedStars = levels.reduce((acc, lvl) => {
    return acc + (isLevelUnlocked(lvl.id) ? starsFor(lvl.id) : 0);
  }, 0);
  const maxStars = totalCount * 3;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-4">
      {showProgressHeader && (
        <div className="industrial-panel rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/20 text-success border border-success/30">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-fg-subtle font-medium">
                DISCIPLINE DIVISION PROGRESS
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="text-fg-subtle">
                Completed: <strong className="text-fg">{completedCount}/{totalCount}</strong>
              </span>
              <span className="text-fg-subtle">
                Stars: <strong className="text-warning">★ {earnedStars}/{maxStars}</strong>
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${
                  completedCount === totalCount && totalCount > 0
                    ? 'border border-success/40 bg-success/20 text-success'
                    : completedCount > 0
                    ? 'border border-accent/40 bg-accent/20 text-accent'
                    : 'border border-border bg-surface-2 text-fg-subtle'
                }`}
              >
                {completedCount === totalCount && totalCount > 0 ? '✓ All Completed' : `${percent}%`}
              </span>
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-2 border border-border/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-success transition-all duration-500 shadow-[0_0_10px_rgba(22,163,74,0.4)]"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      <ol className="flex flex-col gap-3">
        {levels.map((level, index) => {
          const unlocked = isLevelUnlocked(level.id);
          const stars = starsFor(level.id);
          const completed = unlocked && (isCompleted ? isCompleted(level.id) : stars > 0);
          const statusText = unlocked
            ? completed
              ? `Completed, ${stars} of 3 stars`
              : ', not yet completed'
            : ', locked';

          const cardStyle = !unlocked
            ? 'border-border/50 bg-surface-1/40 opacity-50'
            : completed
            ? 'border-success/60 bg-surface-1/90 shadow-[0_0_15px_-2px_rgba(22,163,74,0.35)] ring-1 ring-success/30 hover:border-success hover:shadow-[0_0_20px_-2px_rgba(22,163,74,0.5)]'
            : 'border-border/90 bg-surface-1/90 hover:border-accent hover:shadow-[0_0_12px_-3px_rgba(255,106,44,0.25)]';

          const content = (
            <div
              onMouseEnter={() => unlocked && soundFx.playSubtleHover()}
              onClick={() => unlocked && soundFx.playTactileClick()}
              className={`flex items-center justify-between rounded-xl border px-5 py-4 transition-all duration-200 active:scale-[0.99] ${cardStyle}`}
            >
              <div className="flex items-center gap-3.5 text-left">
                {completed ? (
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/20 text-success border border-success/40 shadow-[0_0_8px_rgba(22,163,74,0.3)]"
                    title="Level completed"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                ) : unlocked ? (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-fg-muted border border-border text-xs font-mono font-medium">
                    {index + 1}
                  </div>
                ) : (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2/40 text-fg-subtle/50 border border-border/30 text-xs">
                    🔒
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-lg text-fg">{level.name}</p>
                    {completed && (
                      <span className="inline-flex items-center gap-1 rounded bg-success/15 px-1.5 py-0.5 font-mono text-[11px] font-medium text-success border border-success/30">
                        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Done
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-fg-muted">{level.tagline}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {unlocked ? (
                  <div className="text-xl text-warning tracking-wider" aria-hidden="true">
                    {stars > 0 ? (
                      '★'.repeat(stars).padEnd(3, '☆')
                    ) : (
                      <span className="text-fg-subtle/30">☆☆☆</span>
                    )}
                  </div>
                ) : (
                  <div className="text-xs font-mono text-fg-subtle/60" aria-hidden="true">
                    Locked
                  </div>
                )}
              </div>
              <span className="sr-only">{statusText}</span>
            </div>
          );
          return (
            <li key={level.id}>
              {unlocked ? (
                <Link to={`${basePath}/${level.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl">
                  {content}
                </Link>
              ) : (
                <div className="cursor-not-allowed" aria-disabled="true">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

