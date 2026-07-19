import { Link } from 'react-router-dom';
import { LEVELS } from '../content/levels';
import { useGameStore } from '../state/gameStore';

export function LevelSelect() {
  const progress = useGameStore((s) => s.progress);
  const isLevelUnlocked = useGameStore((s) => s.isLevelUnlocked);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-10 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Engineering Forge
        </p>
        <h1 className="font-display text-4xl font-semibold text-fg">The Forge</h1>
        <p className="mt-2 text-fg-muted">
          Structures pack — build a bridge, then let the physics decide if it holds.
        </p>
      </header>

      <ol className="flex flex-col gap-3">
        {LEVELS.map((level) => {
          const unlocked = isLevelUnlocked(level.id);
          const stars = progress[level.id]?.stars ?? 0;
          const content = (
            <div
              className={`flex items-center justify-between rounded-xl border px-5 py-4 transition-colors ${
                unlocked
                  ? 'border-border bg-surface-1 hover:border-accent'
                  : 'border-border/50 bg-surface-1/40 opacity-50'
              }`}
            >
              <div className="text-left">
                <p className="font-display text-lg text-fg">{level.name}</p>
                <p className="text-sm text-fg-muted">{level.tagline}</p>
              </div>
              <div className="text-xl text-warning">
                {unlocked ? (stars > 0 ? '★'.repeat(stars).padEnd(3, '☆') : '☆☆☆') : '🔒'}
              </div>
            </div>
          );
          return (
            <li key={level.id}>
              {unlocked ? (
                <Link to={`/level/${level.id}`}>{content}</Link>
              ) : (
                <div className="cursor-not-allowed">{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
