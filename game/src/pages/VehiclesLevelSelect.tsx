import { Link } from 'react-router-dom';
import { LevelSelectList } from '../components/LevelSelectList';
import { VEHICLE_LEVELS } from '../content/vehicleLevels';
import { useVehicleStore } from '../state/vehicleStore';
import { usePackProgress } from '../state/useProgressTracker';
import { CompletionBadge } from '../components/CompletionBadge';

export function VehiclesLevelSelect() {
  const progress = useVehicleStore((s) => s.progress);
  const isLevelUnlocked = useVehicleStore((s) => s.isLevelUnlocked);
  const { completed, total } = usePackProgress('machines');

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link to="/" className="text-sm text-fg-muted hover:text-fg">
        ← Packs
      </Link>
      <header className="mb-8 mt-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Machines</p>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-fg-muted border border-border">
            {completed}/{total} Completed
          </span>
        </div>
        <h1 className="font-display text-4xl font-semibold text-fg mt-1">Vehicles</h1>
        <p className="mt-2 text-fg-muted">
          Spec an engine and a chassis, then let Newton's second law decide how fast it goes.
        </p>
      </header>

      {/* Persistent Category Completion Badge */}
      <CompletionBadge category="machines" className="mb-6" />

      <LevelSelectList
        levels={VEHICLE_LEVELS}
        basePath="/machines/level"
        isLevelUnlocked={isLevelUnlocked}
        starsFor={(id) => progress[id]?.stars ?? 0}
      />
    </div>
  );
}
