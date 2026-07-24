import { Link } from 'react-router-dom';
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

      <ol className="flex flex-col gap-3">
        {VEHICLE_LEVELS.map((level) => {
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
                <Link to={`/machines/level/${level.id}`}>{content}</Link>
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
