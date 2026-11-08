import { useState, useEffect } from 'react';
import { highScoresManager, type LevelHighScore } from '../state/HighScoresManager';

export interface PersonalBestBadgeProps {
  levelId: string;
  className?: string;
  /** Whether to show a compact version without the full label */
  compact?: boolean;
}

export function PersonalBestBadge({
  levelId,
  className = '',
  compact = false,
}: PersonalBestBadgeProps) {
  const [record, setRecord] = useState<LevelHighScore | null>(() =>
    highScoresManager.getPersonalBest(levelId),
  );
  const [prevLevelId, setPrevLevelId] = useState(levelId);

  // Synchronize during render when levelId changes (React recommended pattern)
  if (levelId !== prevLevelId) {
    setPrevLevelId(levelId);
    setRecord(highScoresManager.getPersonalBest(levelId));
  }

  useEffect(() => {
    // Subscribe to external updates from HighScoresManager
    const unsubscribe = highScoresManager.subscribe((updatedLevelId) => {
      if (!updatedLevelId || updatedLevelId === levelId) {
        setRecord(highScoresManager.getPersonalBest(levelId));
      }
    });

    return unsubscribe;
  }, [levelId]);

  if (!record) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-surface-1/60 px-2 py-0.5 text-xs font-mono text-fg-subtle ${className}`}
        title="Personal Best solve time: Not yet set"
      >
        <span className="text-[11px] opacity-60">🏆</span>
        <span className="text-[11px]">PB: --:--</span>
      </div>
    );
  }

  const formatted = highScoresManager.getFormattedPersonalBest(levelId);

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-mono text-amber-400 font-medium tracking-wide shadow-xs ${className}`}
      title={`Personal Best solve time: ${formatted}`}
    >
      <span className="text-[12px] select-none" aria-hidden="true">
        🏆
      </span>
      <span className="text-[11px] font-bold text-fg">
        {!compact && <span className="text-amber-400 font-normal mr-1">PB:</span>}
        {formatted}
      </span>
    </div>
  );
}
