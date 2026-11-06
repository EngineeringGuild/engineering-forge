import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { VehicleResultOverlay } from '../components/VehicleResultOverlay';
import { VehicleTrackCanvas } from '../components/VehicleTrackCanvas';
import { getVehicleLevel, nextVehicleLevelId } from '../content/vehicleLevels';
import { totalVehicleCost } from '../game/vehicleBuild';
import { CHASSIS, ENGINES } from '../physics/vehicleParts';
import { useVehicleStore } from '../state/vehicleStore';
import { soundFx } from '../audio/soundFx';
import { ChallengeTimer } from '../components/ChallengeTimer';
import { getVehicleGuidance } from '../game/guidanceSystem';
import { ContextualHintBanner } from '../components/ContextualHintBanner';

export function VehiclesPlayLevel() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [showHint, setShowHint] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [timerResetKey, setTimerResetKey] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

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
  const clearTestResult = useVehicleStore((s) => s.clearTestResult);
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

  const handleSelectEngine = (id: string) => {
    soundFx.playSnapNode();
    setSelectedEngine(id);
  };

  const handleSelectChassis = (id: string) => {
    soundFx.playSnapNode();
    setSelectedChassis(id);
  };

  const handleTestDrive = () => {
    setIsSimulating(true);
    setShowResult(false);
    runTest();
  };

  const handleSimulationFinish = () => {
    setIsSimulating(false);
    setShowResult(true);
  };

  const handleResetSimulation = () => {
    soundFx.playSnapNode();
    setIsSimulating(false);
    setShowResult(false);
    clearTestResult();
  };

  const handleReset = () => {
    soundFx.playSnapNode();
    setIsSimulating(false);
    setShowResult(false);
    resetBuild();
    setTimerResetKey((k) => k + 1);
    setElapsedSeconds(0);
  };

  const isLevelCompleted = Boolean(testResult?.passed);
  const isStuck = !isLevelCompleted && elapsedSeconds >= 60;
  const guidance = getVehicleGuidance(level, selectedEngine, selectedChassis, cost, testResult);

  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent">{level.name}</p>
            <p className="text-sm text-fg-muted">{level.tagline}</p>
          </div>
          <ChallengeTimer
            isRunning={!isLevelCompleted}
            resetTrigger={`${level.id}-${timerResetKey}`}
            onTimeUpdate={setElapsedSeconds}
          />
        </div>
        <button
          onClick={() => setShowHint((v) => !v)}
          className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
            isStuck
              ? 'border-accent bg-accent/10 font-medium text-accent animate-pulse'
              : 'border-border text-fg-muted hover:text-fg'
          }`}
        >
          {isStuck ? '💡 Guidance Ready' : 'Hint'}
        </button>
      </header>

      <ContextualHintBanner
        guidance={guidance}
        isStuck={isStuck}
        elapsedSeconds={elapsedSeconds}
        fallbackHint={level.hint}
        manualOpen={showHint}
        onDismiss={() => setShowHint(false)}
      />

      {/* Dynamic Runway Track Canvas */}
      <VehicleTrackCanvas
        level={level}
        selectedEngineId={selectedEngine}
        selectedChassisId={selectedChassis}
        testResult={testResult}
        isSimulating={isSimulating}
        onSimulationFinish={handleSimulationFinish}
        onResetSimulation={handleResetSimulation}
      />

      <p className="rounded-xl border border-border bg-surface-1 px-4 py-3 text-center text-sm text-fg-muted">
        {level.maxSpeed !== undefined ? (
          <>
            Land between <span className="text-fg">{level.targetSpeed}</span> and{' '}
            <span className="text-fg">{level.maxSpeed} m/s</span>
          </>
        ) : (
          <>
            Reach <span className="text-fg">{level.targetSpeed} m/s</span>
          </>
        )}{' '}
        over a <span className="text-fg">{level.distance}m</span> straight run, from a stop.
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
                onClick={() => handleSelectEngine(id)}
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
                onClick={() => handleSelectChassis(id)}
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
          <span className={overBudget ? 'text-danger font-semibold' : 'text-fg-muted'}>${cost}</span>
          <span className="text-fg-subtle"> / ${level.budget}</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={handleResetSimulation}
            className="rounded-lg border border-border px-3 py-2 text-sm text-fg-muted hover:text-fg hover:border-accent transition-colors flex items-center gap-1.5"
            title="Reset Matter.js vehicle bodies to starting position without changing configuration"
          >
            <span>↺</span> Reset Simulation
          </button>
          <button
            onClick={handleReset}
            className="rounded-lg border border-border px-3 py-2 text-sm text-fg-muted hover:text-fg transition-colors"
            title="Reset selected parts"
          >
            Reset Parts
          </button>
          <button
            onClick={handleTestDrive}
            disabled={isSimulating}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isSimulating ? 'Driving…' : 'Test Drive'}
          </button>
        </div>
      </div>

      {showResult && testResult && (
        <VehicleResultOverlay
          result={testResult}
          targetSpeed={level.targetSpeed}
          maxSpeed={level.maxSpeed}
          budget={level.budget}
          hasNext={Boolean(next)}
          onRetry={handleReset}
          onNext={() => next && navigate(`/machines/level/${next}`)}
          onLevelSelect={() => navigate('/machines')}
        />
      )}
    </div>
  );
}

