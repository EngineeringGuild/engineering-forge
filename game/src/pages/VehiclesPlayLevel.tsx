import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { VehicleResultOverlay } from '../components/VehicleResultOverlay';
import { getVehicleLevel, nextVehicleLevelId } from '../content/vehicleLevels';
import { totalVehicleCost } from '../game/vehicleBuild';
import { CHASSIS, ENGINES } from '../physics/vehicleParts';
import { useVehicleStore } from '../state/vehicleStore';

export function VehiclesPlayLevel() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [showHint, setShowHint] = useState(false);

  const level = levelId ? getVehicleLevel(levelId) : undefined;
  const isLevelUnlocked = useVehicleStore((s) => s.isLevelUnlocked);
  const currentLevelId = useVehicleStore((s) => s.currentLevelId);
  const selectedEngine = useVehicleStore((s) => s.selectedEngine);
  const selectedChassis = useVehicleStore((s) => s.selectedChassis);
  const testResult = useVehicleStore((s) => s.testResult);
  const startLevel = useVehicleStore((s) => s.startLevel);
  const setSelectedEngine = useVehicleStore((s) => s.setSelectedEngine);
  const setSelectedChassis = useVehicleStore((s) => s.setSelectedChassis);
  const runTest = useVehicleStore((s) => s.runTest);
  const resetBuild = useVehicleStore((s) => s.resetBuild);

  useEffect(() => {
    if (level && currentLevelId !== level.id) {
      startLevel(level.id);
    }
  }, [level, currentLevelId, startLevel]);

  if (!level) return <Navigate to="/machines" replace />;
  if (!isLevelUnlocked(level.id)) return <Navigate to="/machines" replace />;

  const cost = totalVehicleCost(selectedEngine, selectedChassis);
  const overBudget = cost > level.budget;
  const next = nextVehicleLevelId(level.id);

  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">{level.name}</p>
          <p className="text-sm text-fg-muted">{level.tagline}</p>
        </div>
        <button
          onClick={() => setShowHint((v) => !v)}
          className="rounded-lg border border-border px-3 py-2 text-sm text-fg-muted hover:text-fg"
        >
          Hint
        </button>
      </header>

      {showHint && (
        <p className="rounded-xl border border-border bg-surface-1 px-4 py-3 text-sm text-fg-muted">
          {level.hint}
        </p>
      )}

      <p className="rounded-xl border border-border bg-surface-1 px-4 py-3 text-center text-sm text-fg-muted">
        Reach <span className="text-fg">{level.targetSpeed} m/s</span> over a{' '}
        <span className="text-fg">{level.distance}m</span> straight run, from a stop.
        {Boolean(level.inclineDegrees) && (
          <>
            {' '}
            Uphill, at <span className="text-fg">{level.inclineDegrees}°</span>.
          </>
        )}
        {Boolean(level.payloadMass) && (
          <>
            {' '}
            Carrying a <span className="text-fg">{level.payloadMass}kg</span> crate.
          </>
        )}
      </p>

      <section>
        <p className="mb-2 text-xs font-mono uppercase tracking-widest text-fg-subtle">Engine</p>
        <div className="grid grid-cols-2 gap-3">
          {level.unlockedEngines.map((id) => {
            const engine = ENGINES[id];
            const active = selectedEngine === id;
            return (
              <button
                key={id}
                onClick={() => setSelectedEngine(id)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  active ? 'border-accent bg-accent/10' : 'border-border bg-surface-1 hover:border-accent'
                }`}
              >
                <p className="font-display text-lg text-fg">{engine.name}</p>
                <p className="font-mono text-sm text-fg-muted">{engine.force}N</p>
                <p className="font-mono text-xs text-fg-subtle">${engine.cost}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="mb-2 text-xs font-mono uppercase tracking-widest text-fg-subtle">Chassis</p>
        <div className="grid grid-cols-2 gap-3">
          {level.unlockedChassis.map((id) => {
            const chassis = CHASSIS[id];
            const active = selectedChassis === id;
            return (
              <button
                key={id}
                onClick={() => setSelectedChassis(id)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  active ? 'border-accent bg-accent/10' : 'border-border bg-surface-1 hover:border-accent'
                }`}
              >
                <p className="font-display text-lg text-fg">{chassis.name}</p>
                <p className="font-mono text-sm text-fg-muted">{chassis.mass}kg</p>
                <p className="font-mono text-xs text-fg-subtle">${chassis.cost}</p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-auto flex items-center gap-4 rounded-xl border border-border bg-surface-1 px-4 py-3">
        <div className="font-mono text-sm">
          <span className={overBudget ? 'text-danger' : 'text-fg-muted'}>${cost}</span>
          <span className="text-fg-subtle"> / ${level.budget}</span>
        </div>
        <button
          onClick={resetBuild}
          className="ml-auto rounded-lg border border-border px-3 py-2 text-sm text-fg-muted hover:text-fg"
        >
          Reset
        </button>
        <button
          onClick={runTest}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          Test Drive
        </button>
      </div>

      {testResult && (
        <VehicleResultOverlay
          result={testResult}
          targetSpeed={level.targetSpeed}
          budget={level.budget}
          hasNext={Boolean(next)}
          onRetry={resetBuild}
          onNext={() => next && navigate(`/machines/level/${next}`)}
          onLevelSelect={() => navigate('/machines')}
        />
      )}
    </div>
  );
}
