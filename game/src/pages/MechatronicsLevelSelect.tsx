import { Link } from 'react-router-dom';
import { MECHATRONICS_LEVELS } from '../content/mechatronicsLevels';
import { useMechatronicsStore } from '../state/mechatronicsStore';
import { useGameProgressionStore } from '../state/gameProgressionStore';

export function MechatronicsLevelSelect() {
  const store = useMechatronicsStore();
  const progressionStore = useGameProgressionStore();
  const badge = progressionStore.getCategoryBadge('mechatronics');

  return (
    <div className="mx-auto flex min-h-svh max-w-4xl flex-col gap-6 p-6 font-mono">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-xs text-accent hover:underline flex items-center gap-1 font-bold"
            >
              ← Back to The Forge
            </Link>
            <span className="text-fg-subtle">/</span>
            <span className="text-xs text-fg-muted font-bold uppercase tracking-wider">
              Mechatronics & Automation
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-fg mt-1">
            Mechatronics & Systems Fusion
          </h1>
          <p className="text-sm text-fg-muted font-sans mt-0.5 max-w-xl">
            Where structures, circuits, and kinematics converge. Couple electric winches,
            electromechanical relays, and safety logic interlocks to control dynamic engineering systems.
          </p>
        </div>

        {/* Mastery Badge Card */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-1 p-3">
          <span className="text-3xl" role="img" aria-label="badge">
            {badge.icon}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-fg uppercase tracking-wider">
                {badge.title}
              </span>
              <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                {badge.percent}%
              </span>
            </div>
            <p className="text-[11px] text-fg-muted mt-0.5 font-sans">
              {badge.completedCount} of {badge.totalCount} levels verified ({badge.earnedStars}★)
            </p>
          </div>
        </div>
      </header>

      {/* Level Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {MECHATRONICS_LEVELS.map((lvl, idx) => {
          const unlocked = store.isLevelUnlocked(lvl.id);
          const progress = store.progress[lvl.id];
          const completed = (progress?.stars ?? 0) > 0;
          const stars = progress?.stars ?? 0;

          return (
            <div
              key={lvl.id}
              className={`relative flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 ${
                !unlocked
                  ? 'border-border/40 bg-surface-1/40 opacity-60'
                  : completed
                  ? 'border-success/60 bg-surface-1/90 shadow-md ring-1 ring-success/20 hover:border-success'
                  : 'border-border bg-surface-1 hover:border-accent hover:shadow-lg'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent">
                    CHALLENGE 0{idx + 1}
                  </span>
                  {completed ? (
                    <span className="flex items-center gap-1 text-xs text-warning font-bold">
                      {'★'.repeat(stars)}
                      <span className="text-fg-subtle">{'☆'.repeat(3 - stars)}</span>
                    </span>
                  ) : unlocked ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-fg-muted bg-surface-2 px-2 py-0.5 rounded">
                      Available
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-fg-subtle bg-surface-2/40 px-2 py-0.5 rounded">
                      Locked
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-bold text-fg mt-2 font-display">{lvl.name}</h2>
                <p className="text-xs text-fg-muted mt-1 font-sans line-clamp-2">
                  {lvl.tagline}
                </p>

                <div className="mt-4 flex flex-col gap-1 border-t border-border/40 pt-3 text-[11px] text-fg-subtle">
                  <div className="flex justify-between">
                    <span>Target Clearance:</span>
                    <strong className="text-fg font-mono">{lvl.targetClearanceAngleDeg}°</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Allowable Tension:</span>
                    <strong className="text-fg font-mono">{lvl.maxAllowableTensionKn} kN</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Budget Limit:</span>
                    <strong className="text-fg font-mono">${lvl.budget}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-2">
                {unlocked ? (
                  <Link
                    to={`/mechatronics/level/${lvl.id}`}
                    className={`block w-full text-center rounded-lg py-2 text-xs font-bold transition-colors ${
                      completed
                        ? 'bg-surface-2 text-fg hover:bg-surface-3 border border-border'
                        : 'bg-accent text-accent-fg hover:opacity-90 shadow'
                    }`}
                  >
                    {completed ? 'Review Solution' : 'Engage System →'}
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full rounded-lg bg-surface-2/50 py-2 text-xs font-bold text-fg-subtle cursor-not-allowed border border-border/30"
                  >
                    Complete Prior Challenge
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
