import { Link } from 'react-router-dom';
import { LevelSelectList } from '../components/LevelSelectList';
import { CIRCUIT_LEVELS } from '../content/circuitLevels';
import { useCircuitStore } from '../state/circuitStore';

export function CircuitsLevelSelect() {
  const progress = useCircuitStore((s) => s.progress);
  const isLevelUnlocked = useCircuitStore((s) => s.isLevelUnlocked);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link to="/" className="text-sm text-fg-muted hover:text-fg">
        ← Packs
      </Link>
      <header className="mb-10 mt-4 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Circuits</p>
        <h1 className="font-display text-4xl font-semibold text-fg">Wiring</h1>
        <p className="mt-2 text-fg-muted">
          Wire a circuit, then let Ohm's law decide if it lights up.
        </p>
      </header>

      <LevelSelectList
        levels={CIRCUIT_LEVELS}
        basePath="/circuits/level"
        isLevelUnlocked={isLevelUnlocked}
        starsFor={(id) => progress[id]?.stars ?? 0}
      />
    </div>
  );
}
