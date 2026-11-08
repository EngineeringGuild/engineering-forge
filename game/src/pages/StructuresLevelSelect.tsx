import { Link } from 'react-router-dom';
import { LevelSelectList } from '../components/LevelSelectList';
import { LEVELS } from '../content/levels';
import { useGameStore } from '../state/gameStore';
import { usePackProgress } from '../state/useProgressTracker';
import { CompletionBadge } from '../components/CompletionBadge';

export function StructuresLevelSelect() {
  const progress = useGameStore((s) => s.progress);
  const isLevelUnlocked = useGameStore((s) => s.isLevelUnlocked);
  const { completed, total } = usePackProgress('structures');

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link to="/" className="text-sm text-fg-muted hover:text-fg">
        ← Packs
      </Link>
      <header className="mb-8 mt-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Structures</p>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-fg-muted border border-border">
            {completed}/{total} Completed
          </span>
        </div>
        <h1 className="font-display text-4xl font-semibold text-fg mt-1">Bridges</h1>
        <p className="mt-2 text-fg-muted">
          Build a bridge, then let the physics decide if it holds.
        </p>
      </header>

      {/* Persistent Category Completion Badge */}
      <CompletionBadge category="structures" className="mb-6" />

      <LevelSelectList
        levels={LEVELS}
        basePath="/structures/level"
        isLevelUnlocked={isLevelUnlocked}
        starsFor={(id) => progress[id]?.stars ?? 0}
      />
    </div>
  );
}
