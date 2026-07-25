import { Link } from 'react-router-dom';
import { LevelSelectList } from '../components/LevelSelectList';
import { LEVELS } from '../content/levels';
import { useGameStore } from '../state/gameStore';

export function StructuresLevelSelect() {
  const progress = useGameStore((s) => s.progress);
  const isLevelUnlocked = useGameStore((s) => s.isLevelUnlocked);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link to="/" className="text-sm text-fg-muted hover:text-fg">
        ← Packs
      </Link>
      <header className="mb-10 mt-4 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Structures</p>
        <h1 className="font-display text-4xl font-semibold text-fg">Bridges</h1>
        <p className="mt-2 text-fg-muted">
          Build a bridge, then let the physics decide if it holds.
        </p>
      </header>

      <LevelSelectList
        levels={LEVELS}
        basePath="/structures/level"
        isLevelUnlocked={isLevelUnlocked}
        starsFor={(id) => progress[id]?.stars ?? 0}
      />
    </div>
  );
}
