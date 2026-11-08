import { Link } from 'react-router-dom';
import { LevelSelectList } from '../components/LevelSelectList';
import { CIRCUIT_LEVELS } from '../content/circuitLevels';
import { useCircuitStore } from '../state/circuitStore';
import { usePackProgress } from '../state/useProgressTracker';
import { CompletionBadge } from '../components/CompletionBadge';

export function CircuitsLevelSelect() {
  const progress = useCircuitStore((s) => s.progress);
  const isLevelUnlocked = useCircuitStore((s) => s.isLevelUnlocked);
  const { completed, total } = usePackProgress('circuits');

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link to="/" className="text-sm text-fg-muted hover:text-fg">
        ← Packs
      </Link>
      <header className="mb-8 mt-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Circuits</p>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-fg-muted border border-border">
            {completed}/{total} Completed
          </span>
        </div>
        <h1 className="font-display text-4xl font-semibold text-fg mt-1">Wiring</h1>
        <p className="mt-2 text-fg-muted">
          Wire a circuit, then let Ohm's law decide if it lights up.
        </p>
      </header>

      {/* Persistent Category Completion Badge */}
      <CompletionBadge category="circuits" className="mb-6" />

      <LevelSelectList
        levels={CIRCUIT_LEVELS}
        basePath="/circuits/level"
        isLevelUnlocked={isLevelUnlocked}
        starsFor={(id) => progress[id]?.stars ?? 0}
      />
    </div>
  );
}
