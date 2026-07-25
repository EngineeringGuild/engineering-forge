import { Link } from 'react-router-dom';
import { LevelSelectList } from '../components/LevelSelectList';
import { VEHICLE_LEVELS } from '../content/vehicleLevels';
import { useVehicleStore } from '../state/vehicleStore';

export function VehiclesLevelSelect() {
  const progress = useVehicleStore((s) => s.progress);
  const isLevelUnlocked = useVehicleStore((s) => s.isLevelUnlocked);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link to="/" className="text-sm text-fg-muted hover:text-fg">
        ← Packs
      </Link>
      <header className="mb-10 mt-4 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Machines</p>
        <h1 className="font-display text-4xl font-semibold text-fg">Vehicles</h1>
        <p className="mt-2 text-fg-muted">
          Spec an engine and a chassis, then let Newton's second law decide how fast it goes.
        </p>
      </header>

      <LevelSelectList
        levels={VEHICLE_LEVELS}
        basePath="/machines/level"
        isLevelUnlocked={isLevelUnlocked}
        starsFor={(id) => progress[id]?.stars ?? 0}
      />
    </div>
  );
}
