import { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MECHATRONICS_LEVELS, WINCHES } from '../content/mechatronicsLevels';
import { useMechatronicsStore } from '../state/mechatronicsStore';
import { MechatronicsCanvas } from '../components/MechatronicsCanvas';
import { TechnicalSpecReportModal } from '../components/TechnicalSpecReportModal';
import { DifficultySelector } from '../components/DifficultySelector';
import { PlayLevelHeaderNav } from '../components/PlayLevelHeaderNav';

export function MechatronicsPlayLevel() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const store = useMechatronicsStore();
  const [showSpecSheet, setShowSpecSheet] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const currentLevel = useMemo(() => {
    return MECHATRONICS_LEVELS.find((l) => l.id === levelId) ?? MECHATRONICS_LEVELS[0];
  }, [levelId]);

  useEffect(() => {
    if (levelId && currentLevel) {
      store.setLevel(levelId);
    }
  }, [levelId, currentLevel, store]);

  // Animation frame loop for smooth physics simulation
  useEffect(() => {
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - (lastTimeRef.current || now)) / 1000);
      lastTimeRef.current = now;

      if (store.isSimulating) {
        store.stepSimulationTick(dt);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [store]);

  const selectedWinch = WINCHES[store.selectedWinchId] ?? WINCHES['winch-heavy'];
  const effectiveDeck = {
    ...currentLevel.deck,
    counterweightKg: currentLevel.deck.counterweightKg + store.counterweightAdjustmentKg,
  };

  // Cost calculation
  const winchCost = selectedWinch.ratedVoltage * 60;
  const cwCost = Math.abs(store.counterweightAdjustmentKg) * 0.4;
  const totalCost = 1200 + winchCost + cwCost;

  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col gap-5 p-6 font-mono">
      {/* Top Level Navigation & Breadcrumbs */}
      <PlayLevelHeaderNav
        divisionTitle="Mecatrônica & Sistemas"
        divisionPath="/mechatronics"
        currentLevelId={currentLevel.id}
        currentLevelName={currentLevel.name}
        levels={MECHATRONICS_LEVELS}
        levelBasePath="/mechatronics/level"
      />

      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/mechatronics"
              className="text-xs text-accent hover:underline flex items-center gap-1 font-bold"
            >
              ← Mechatronics Systems
            </Link>
            <span className="text-fg-subtle">/</span>
            <span className="text-xs text-fg-muted font-bold uppercase tracking-wider">
              Level {currentLevel.order} of {MECHATRONICS_LEVELS.length}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-fg mt-1">
            {currentLevel.name}
          </h1>
          <p className="text-xs text-fg-muted font-sans mt-0.5 max-w-xl">
            {currentLevel.brief.problem}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DifficultySelector levelId={currentLevel.id} compact />

          <button
            onClick={() => setShowSpecSheet(true)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-bold text-fg hover:border-accent transition-colors flex items-center gap-1.5"
          >
            <span>📋</span>
            <span>BOM Spec Sheet</span>
          </button>

          <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-1.5 border border-border text-xs">
            <span className="text-fg-muted">Cost:</span>
            <strong className={totalCost > currentLevel.budget ? 'text-danger' : 'text-fg'}>
              ${totalCost.toFixed(0)}
            </strong>
            <span className="text-fg-subtle">/ ${currentLevel.budget}</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Visualizer Canvas */}
        <div className="flex flex-col gap-4 lg:col-span-8">
          <MechatronicsCanvas
            deck={effectiveDeck}
            winch={selectedWinch}
            bridgeAngleDeg={store.currentAngleDeg}
            motorCurrentA={store.motorCurrentA}
            winchTensionKn={store.winchTensionKn}
            limitCutoffAngleDeg={store.limitCutoffAngleDeg}
            limitSwitchTripped={store.limitSwitchTripped}
            relayClosed={store.relayClosed}
            isCableSnapped={store.isCableSnapped}
            isStalled={store.isStalled}
            logicGates={store.userLogicGates}
            logicSignals={store.inputSignals}
            onToggleInputSignal={store.toggleInputSignal}
            width={740}
            height={430}
          />

          {/* Simulation Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-1 p-3">
            <div className="flex items-center gap-2">
              {!store.isSimulating ? (
                <button
                  onClick={store.startSimulation}
                  className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-accent-fg shadow hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <span>▶</span>
                  <span>Power System</span>
                </button>
              ) : (
                <button
                  onClick={store.stopSimulation}
                  className="rounded-lg bg-surface-3 px-4 py-2 text-xs font-bold text-fg border border-border hover:bg-surface-2 transition-colors flex items-center gap-1.5"
                >
                  <span>⏸</span>
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={store.resetSimulation}
                className="rounded-lg bg-surface-2 px-3 py-2 text-xs font-bold text-fg-muted hover:text-fg border border-border transition-colors flex items-center gap-1.5"
              >
                <span>↺</span>
                <span>Reset</span>
              </button>
            </div>

            {/* Speed slider */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-fg-muted">Sim Speed:</span>
              {[0.5, 1.0, 2.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => store.setTimeScale(spd)}
                  className={`rounded px-2 py-1 font-mono font-bold text-[11px] border ${
                    store.timeScale === spd
                      ? 'border-accent bg-accent/20 text-accent'
                      : 'border-border bg-surface-2 text-fg-muted hover:text-fg'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Time elapsed */}
            <div className="rounded bg-surface-2 px-3 py-1.5 border border-border text-xs text-fg">
              ⏱ {store.simulationTimeSec.toFixed(2)}s
            </div>
          </div>
        </div>

        {/* Right Column: Actuator & Interlock Tuning Console */}
        <div className="flex flex-col gap-4 lg:col-span-4">
          <div className="rounded-xl border border-border bg-surface-1 p-4 flex flex-col gap-4 shadow-sm">
            <h3 className="text-sm font-bold text-fg uppercase tracking-wider flex items-center gap-1.5">
              <span>⚙️</span>
              <span>Actuator & Control Tuning</span>
            </h3>

            {/* Winch Motor Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-fg-muted">Electromechanical Winch Motor</label>
              <div className="flex flex-col gap-1.5">
                {currentLevel.availableWinches.map((w) => {
                  const isSel = store.selectedWinchId === w.id;
                  return (
                    <button
                      key={w.id}
                      onClick={() => store.setSelectedWinch(w.id)}
                      className={`flex flex-col text-left rounded-lg p-2.5 border text-xs transition-all ${
                        isSel
                          ? 'border-accent bg-accent/10 text-fg ring-1 ring-accent/30'
                          : 'border-border bg-surface-2 text-fg-muted hover:border-border/80'
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold">
                        <span>{w.name}</span>
                        <span className="text-accent">{w.ratedVoltage}V</span>
                      </div>
                      <div className="text-[10px] text-fg-subtle mt-0.5 font-sans">
                        Torque: {w.stallTorqueNm}Nm | Ratio: {w.gearRatio}:1 | Max Tension: {w.maxCableTensionKn}kN
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Counterweight Slider */}
            <div className="flex flex-col gap-1.5 border-t border-border/60 pt-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-fg-muted">Counterweight Balance:</span>
                <span className="text-accent font-bold">
                  {effectiveDeck.counterweightKg} kg ({store.counterweightAdjustmentKg >= 0 ? `+${store.counterweightAdjustmentKg}` : store.counterweightAdjustmentKg} kg)
                </span>
              </div>
              <input
                type="range"
                min="-2000"
                max="3000"
                step="250"
                value={store.counterweightAdjustmentKg}
                onChange={(e) => store.setCounterweightAdjustment(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
              <span className="text-[10px] text-fg-subtle font-sans">
                Higher counterweight reduces winch lifting work but increases closing inertia.
              </span>
            </div>

            {/* Limit Switch Cutoff Angle */}
            <div className="flex flex-col gap-1.5 border-t border-border/60 pt-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-fg-muted">Limit Switch Cutoff Angle:</span>
                <span className="text-warning font-bold">{store.limitCutoffAngleDeg}°</span>
              </div>
              <input
                type="range"
                min={currentLevel.targetClearanceAngleDeg}
                max="75"
                step="1"
                value={store.limitCutoffAngleDeg}
                onChange={(e) => store.setLimitCutoffAngle(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-fg-subtle font-sans">
                De-energizes winch relay once reached to prevent cable break or motor burnout.
              </span>
            </div>

            {/* Voltage Rail */}
            <div className="flex flex-col gap-1.5 border-t border-border/60 pt-3">
              <label className="text-xs font-bold text-fg-muted">DC Power Supply Rail</label>
              <div className="flex items-center gap-2">
                {[12, 24, 48].map((v) => (
                  <button
                    key={v}
                    onClick={() => store.setVoltageSupply(v)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold border transition-colors ${
                      store.voltageSupplyV === v
                        ? 'border-accent bg-accent text-accent-fg'
                        : 'border-border bg-surface-2 text-fg-muted hover:text-fg'
                    }`}
                  >
                    {v}V DC
                  </button>
                ))}
              </div>
            </div>

            {/* Pedagogical Lesson Card */}
            <div className="rounded-lg bg-surface-2/60 p-3 border border-border/60 text-[11px] text-fg-muted font-sans leading-relaxed">
              <strong className="text-accent font-mono uppercase text-[10px] block mb-1">
                SYSTEM PRINCIPLE:
              </strong>
              {currentLevel.brief.physicsLesson}
            </div>
          </div>
        </div>
      </div>

      {/* Victory / Solved Modal Banner */}
      {store.isSolved && (
        <div className="rounded-xl border border-success/60 bg-success/10 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏆</span>
              <div>
                <h3 className="text-lg font-bold text-success font-display">
                  MECHATRONIC SPECIFICATION VERIFIED!
                </h3>
                <p className="text-xs text-fg-muted font-sans mt-0.5">
                  Clearance angle reached ({store.currentAngleDeg.toFixed(1)}° ≥ {currentLevel.targetClearanceAngleDeg}°) in {store.simulationTimeSec.toFixed(2)}s with cable tension safe at {store.winchTensionKn.toFixed(1)} kN.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xl text-warning font-bold">
                {'★'.repeat(store.earnedStars)}
              </span>
              <button
                onClick={() => {
                  const nextIdx = currentLevel.order;
                  if (nextIdx < MECHATRONICS_LEVELS.length) {
                    navigate(`/mechatronics/level/${MECHATRONICS_LEVELS[nextIdx].id}`);
                  } else {
                    navigate('/mechatronics');
                  }
                }}
                className="rounded-lg bg-success px-4 py-2 text-xs font-bold text-zinc-950 shadow hover:opacity-90 transition-opacity"
              >
                Next Challenge →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Technical Spec Sheet Modal */}
      <TechnicalSpecReportModal
        isOpen={showSpecSheet}
        onClose={() => setShowSpecSheet(false)}
        discipline="vehicles"
        totalMassKg={effectiveDeck.deckMassKg + effectiveDeck.counterweightKg}
        topSpeedKmh={store.angularVelocityRadPerSec * 10}
        totalCost={totalCost}
        engineId={store.selectedWinchId}
        chassisId="chassis-medium"
        voltage={store.voltageSupplyV}
        totalCurrentA={store.motorCurrentA}
        totalPowerW={store.voltageSupplyV * store.motorCurrentA}
      />
    </div>
  );
}
