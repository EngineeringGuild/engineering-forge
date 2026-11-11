import { useCallback, useEffect, useState, useMemo } from 'react';
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
import { EngineeringGlossaryModal } from '../components/EngineeringGlossaryModal';
import { PersonalBestBadge } from '../components/PersonalBestBadge';
import { highScoresManager } from '../state/HighScoresManager';
import { OnboardingOverlay } from '../components/OnboardingOverlay';
import { AutosaveIndicator } from '../components/AutosaveIndicator';
import { useAutosaveProject } from '../state/useAutosaveProject';
import { autosaveManager } from '../state/AutosaveManager';
import { progressManager } from '../state/ProgressManager';
import { BlueprintShareModal } from '../components/BlueprintShareModal';
import { SoundSettingsModal } from '../components/SoundSettingsModal';
import { PhysicsDebugPanel, type PhysicsDebugConfig } from '../components/PhysicsDebugPanel';
import { DesignSaveModal } from '../components/DesignSaveModal';
import { designSaveManager, type SavedDesign } from '../state/DesignSaveManager';
import { BuildModePhysicsHUD } from '../components/BuildModePhysicsHUD';
import { computeVehicleBuildMetrics } from '../physics/buildModePhysics';
import { DifficultySelector } from '../components/DifficultySelector';
import type { UniversalBlueprint, MachinesBlueprintData } from '../state/BlueprintManager';
import { VehicleNftMintModal } from '../components/VehicleNftMintModal';

export function VehiclesPlayLevel() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [showHint, setShowHint] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [showNftModal, setShowNftModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [timerResetKey, setTimerResetKey] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [debugConfig, setDebugConfig] = useState<PhysicsDebugConfig>({
    enabled: false,
    showColliders: true,
    showForceVectors: true,
    showEquilibrium: true,
  });

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
  const restoreBuild = useVehicleStore((s) => s.restoreBuild);

  const {
    lastSavedTime,
    wasRestored,
    saveNow,
    clearDraft,
    dismissRestoredNotice,
    isSaving,
  } = useAutosaveProject<{
    selectedEngine: string;
    selectedChassis: string;
  }>({
    discipline: 'vehicles',
    levelId: level?.id ?? '',
    getData: () => ({
      selectedEngine: useVehicleStore.getState().selectedEngine,
      selectedChassis: useVehicleStore.getState().selectedChassis,
    }),
    onRestore: (saved) => {
      restoreBuild(saved.selectedEngine, saved.selectedChassis);
    },
  });

  const getBlueprint = useCallback((): UniversalBlueprint<'machines'> => {
    const curLevel = levelId ? getVehicleLevel(levelId) : undefined;
    const estCost = totalVehicleCost(selectedEngine, selectedChassis);
    return {
      schemaVersion: 1,
      id: `bp_mech_${curLevel?.id || 'custom'}`,
      domain: 'machines',
      name: `${curLevel?.name || 'Machine'} Spec`,
      levelId: curLevel?.id,
      createdAt: new Date().toISOString(),
      estimatedCost: estCost,
      data: {
        selectedEngine,
        selectedChassis,
      },
    };
  }, [levelId, selectedEngine, selectedChassis]);

  const [savedCount, setSavedCount] = useState(() =>
    level ? designSaveManager.getDesignsForLevel('machines', level.id).length : 0,
  );

  useEffect(() => {
    if (!level) return;
    return designSaveManager.subscribe(() => {
      setSavedCount(designSaveManager.getDesignsForLevel('machines', level.id).length);
    });
  }, [level]);

  const debugStats = useMemo(() => {
    return {
      colliderCount: 5, // Chassis hull, 2 wheels, 2 contact patches
      vectorCount: 4, // Gravity, Normal, Thrust, Drag
      equilibriumStatus: 'balanced' as const,
      equilibriumDetail: 'Newton 2nd Law (ΣF=ma)',
    };
  }, []);

  const vehicleMetrics = useMemo(() => {
    return computeVehicleBuildMetrics(selectedEngine, selectedChassis);
  }, [selectedEngine, selectedChassis]);

  const handleRestoreSavedDesign = useCallback(
    (
      design: SavedDesign<{
        selectedEngine: string;
        selectedChassis: string;
      }>,
    ) => {
      restoreBuild(design.data.selectedEngine, design.data.selectedChassis);
    },
    [restoreBuild],
  );

  useEffect(() => {
    if (level && currentLevelId !== level.id) {
      startLevel(level.id);
      const draft = autosaveManager.load<{
        selectedEngine: string;
        selectedChassis: string;
      }>('vehicles', level.id);
      if (draft && (draft.data.selectedEngine || draft.data.selectedChassis)) {
        restoreBuild(draft.data.selectedEngine, draft.data.selectedChassis);
      }
    }
  }, [level, currentLevelId, startLevel, restoreBuild]);

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
    runTest(elapsedSeconds);
  };

  const handleSimulationFinish = () => {
    setIsSimulating(false);
    setShowResult(true);
    if (level && testResult?.passed && elapsedSeconds > 0) {
      highScoresManager.recordSolveTime(level.id, elapsedSeconds);
      progressManager.recordLevelCompletion(
        'machines',
        level.id,
        testResult.stars as 1 | 2 | 3,
        testResult.cost,
        elapsedSeconds,
      );
    }
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
    clearDraft();
    setTimerResetKey((k) => k + 1);
    setElapsedSeconds(0);
  };

  const isLevelCompleted = Boolean(testResult?.passed);
  const isStuck = !isLevelCompleted && elapsedSeconds >= 60;
  const guidance = getVehicleGuidance(level, selectedEngine, selectedChassis, cost, testResult);

  const handleLoadBlueprint = (bp: UniversalBlueprint) => {
    if (bp.domain === 'machines') {
      const data = bp.data as MachinesBlueprintData;
      restoreBuild(data.selectedEngine, data.selectedChassis);
    }
  };

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
          <PersonalBestBadge levelId={level.id} />
          <AutosaveIndicator
            lastSavedTime={lastSavedTime}
            isSaving={isSaving}
            wasRestored={wasRestored}
            onSaveNow={saveNow}
            onClearDraft={clearDraft}
            onDismissRestored={dismissRestoredNotice}
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Difficulty Selector (Easy / Medium / Hard) */}
          <DifficultySelector levelId={level.id} compact />

          {/* Toggle-able Physics Debug Overlay Panel */}
          <PhysicsDebugPanel config={debugConfig} onChange={setDebugConfig} stats={debugStats} />

          {/* Web3 Digital Twin NFT Mint */}
          <button
            onClick={() => {
              soundFx.playTactileClick();
              setShowNftModal(true);
            }}
            title="Mint Proof-of-Engineering Web3 Vehicle NFT Digital Twin"
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-950/20 px-3 py-2 text-sm text-amber-300 hover:bg-amber-950/40 hover:border-amber-400 transition-colors"
          >
            <span>💎</span>
            <span className="font-mono text-xs font-semibold">Web3 NFT</span>
          </button>

          {/* Design Save & Resume System */}
          <button
            onClick={() => setShowSaveModal(true)}
            title="Save current vehicle configuration or resume previously saved specs"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-fg-muted hover:border-accent hover:text-fg transition-colors"
          >
            <span>💾</span>
            <span>Designs</span>
            {savedCount > 0 && (
              <span className="rounded-full bg-accent/20 px-1.5 py-0.2 text-[10px] font-mono font-bold text-accent">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowBlueprintModal(true)}
            title="Universal Blueprint Exchange (Share, Export, Import, Library)"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-fg-muted hover:border-accent hover:text-fg transition-colors"
          >
            <span>📐</span>
            <span>Blueprint</span>
          </button>
          <button
            onClick={() => setShowSoundSettings(true)}
            title="Audio & Sound Synthesizer Settings"
            className="flex items-center justify-center rounded-lg border border-border px-2.5 py-2 text-sm text-fg-muted hover:border-accent hover:text-fg transition-colors"
          >
            <span>🔊</span>
          </button>
          <button
            onClick={() => setShowGlossary(true)}
            title="Open Engineering Glossary (Torque, Pacejka Tire Slip, Power-to-Weight, ISO/SAE standards)"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-fg-muted hover:border-accent hover:text-fg transition-colors"
          >
            <span>📖</span>
            <span>Glossary</span>
          </button>
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
        </div>
      </header>

      <ContextualHintBanner
        guidance={guidance}
        isStuck={isStuck}
        elapsedSeconds={elapsedSeconds}
        fallbackHint={level.hint}
        manualOpen={showHint}
        onDismiss={() => setShowHint(false)}
      />

      {/* Dynamic Runway Track Canvas with Build Mode Dynamics HUD */}
      <div className="relative">
        {!isSimulating && !testResult && (
          <div className="absolute top-3 left-3 z-20 pointer-events-auto">
            <BuildModePhysicsHUD discipline="vehicles" vehicleMetrics={vehicleMetrics} />
          </div>
        )}
        <VehicleTrackCanvas
          level={level}
          selectedEngineId={selectedEngine}
          selectedChassisId={selectedChassis}
          testResult={testResult}
          debugConfig={debugConfig}
          isSimulating={isSimulating}
          onSimulationFinish={handleSimulationFinish}
          onResetSimulation={handleResetSimulation}
        />
      </div>

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

      {/* Engineering Glossary Modal */}
      <EngineeringGlossaryModal
        isOpen={showGlossary}
        onClose={() => setShowGlossary(false)}
        defaultCategory="vehicles"
      />

      {/* Interactive Onboarding Overlay */}
      <OnboardingOverlay discipline="vehicles" levelId={level.id} />

      {/* Blueprint Share & Import Modal */}
      {showBlueprintModal && (
        <BlueprintShareModal
          isOpen={showBlueprintModal}
          onClose={() => setShowBlueprintModal(false)}
          domain="machines"
          getBlueprint={getBlueprint}
          onLoadBlueprint={handleLoadBlueprint}
        />
      )}

      {/* Sound Settings Modal */}
      {showSoundSettings && (
        <SoundSettingsModal
          isOpen={showSoundSettings}
          onClose={() => setShowSoundSettings(false)}
        />
      )}

      {/* LocalStorage-based User Design Save & Resume Modal */}
      {showSaveModal && (
        <DesignSaveModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          discipline="machines"
          levelId={level.id}
          levelName={level.name}
          currentData={{
            selectedEngine,
            selectedChassis,
          }}
          currentStats={{
            partCount: 2, // Engine + Chassis powertrain
            cost,
            summary: `${ENGINES[selectedEngine]?.name || selectedEngine} + ${CHASSIS[selectedChassis]?.name || selectedChassis}`,
          }}
          onRestoreDesign={handleRestoreSavedDesign}
          canSave={Boolean(selectedEngine || selectedChassis)}
        />
      )}

      {/* Web3 Digital Twin Vehicle NFT Mint Modal */}
      {showNftModal && (
        <VehicleNftMintModal
          telemetry={{
            vehicleId: `veh-${level.id}-${selectedEngine}-${selectedChassis}`,
            vehicleName: `${ENGINES[selectedEngine]?.name || 'Engine'} + ${CHASSIS[selectedChassis]?.name || 'Chassis'}`,
            builderAddress: '0x3cA17E9b8eA45F1c9022649B7b2F3d2D78a10Ec1',
            totalMassKg: vehicleMetrics.totalMassKg,
            enginePowerWatts: (ENGINES[selectedEngine]?.force ?? 3000) * 12,
            maxVelocityMs: testResult?.passed ? 15.5 : 8.0,
            tireFrictionMu: 0.85,
            safetyFactorNominal: testResult?.passed ? 1.6 : 0.9,
            energyJoulesConsumed: 450000,
            slopeAngleDegPassed: level.inclineDegrees ?? 0,
            timestamp: 1731320000000,
          }}
          onClose={() => setShowNftModal(false)}
        />
      )}
    </div>
  );
}

