import { useAchievementStore, ACHIEVEMENTS } from '../state/achievementStore';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  const { unlocked, getTotalPoints } = useAchievementStore();

  if (!isOpen) return null;

  const totalPossiblePoints = ACHIEVEMENTS.reduce((sum, a) => sum + a.points, 0);
  const earnedPoints = getTotalPoints();
  const unlockedCount = Object.keys(unlocked).length;
  const progressPercent = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm font-mono">
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-surface-1 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-surface-2/40">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <div>
              <h2 className="text-base font-bold text-fg">Engineering Milestones & Trophy Shelf</h2>
              <p className="text-xs text-fg-muted font-sans">
                Track your accomplishments across all engineering disciplines.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-border bg-surface-2 p-1.5 text-xs text-fg-muted hover:text-fg hover:border-accent"
          >
            ✕
          </button>
        </div>

        {/* Overview Bar */}
        <div className="border-b border-border/80 bg-surface-2/20 p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-fg-muted">
              Milestones: <strong className="text-fg">{unlockedCount} / {ACHIEVEMENTS.length}</strong>
            </span>
            <span className="text-warning font-bold">
              {earnedPoints} / {totalPossiblePoints} Engineering XP ({progressPercent}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-warning transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = !!unlocked[ach.id];
            const unlockData = unlocked[ach.id];

            return (
              <div
                key={ach.id}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                  isUnlocked
                    ? 'border-warning/40 bg-warning/5 shadow-sm'
                    : 'border-border/40 bg-surface-2/30 opacity-60'
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-2xl border ${
                    isUnlocked
                      ? 'bg-warning/20 border-warning/40'
                      : 'bg-surface-3 border-border/50 grayscale'
                  }`}
                >
                  {ach.icon}
                </span>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-fg flex items-center gap-1.5">
                      <span>{ach.title}</span>
                      {isUnlocked && (
                        <span className="text-[10px] text-success font-bold">✓ UNLOCKED</span>
                      )}
                    </h3>
                    <span className="text-[11px] font-bold text-accent">+{ach.points} XP</span>
                  </div>

                  <p className="text-xs text-fg-muted font-sans mt-0.5 leading-snug">
                    {ach.description}
                  </p>

                  <div className="mt-2 flex items-center gap-3 text-[10px] text-fg-subtle">
                    <span className="capitalize text-accent/80 font-bold">
                      {ach.category}
                    </span>
                    {unlockData?.unlockedAt && (
                      <span>
                        Achieved on {new Date(unlockData.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-3 flex justify-end bg-surface-2/40">
          <button
            onClick={onClose}
            className="rounded-lg bg-accent px-4 py-1.5 text-xs font-bold text-accent-fg hover:opacity-90"
          >
            Close Trophy Shelf
          </button>
        </div>
      </div>
    </div>
  );
}
