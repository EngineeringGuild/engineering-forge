import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { CircuitCanvas } from '../components/CircuitCanvas';
import { CircuitResultOverlay } from '../components/CircuitResultOverlay';
import { Toolbar } from '../components/Toolbar';
import { getCircuitLevel, nextCircuitLevelId } from '../content/circuitLevels';
import { totalCircuitCost } from '../game/circuitBuild';
import { COMPONENTS } from '../physics/components';
import { useCircuitStore } from '../state/circuitStore';
import { ChallengeTimer } from '../components/ChallengeTimer';
import { getElectricalGuidance } from '../game/guidanceSystem';
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
import type { UniversalBlueprint, CircuitsBlueprintData } from '../state/BlueprintManager';

export function CircuitsPlayLevel() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [showHint, setShowHint] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [timerResetKey, setTimerResetKey] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const level = levelId ? getCircuitLevel(levelId) : undefined;
  const isLevelUnlocked = useCircuitStore((s) => s.isLevelUnlocked);
  const currentLevelId = useCircuitStore((s) => s.currentLevelId);
  const builtNodes = useCircuitStore((s) => s.builtNodes);
  const builtEdges = useCircuitStore((s) => s.builtEdges);
  const pendingNodeId = useCircuitStore((s) => s.pendingNodeId);
  const selectedMaterial = useCircuitStore((s) => s.selectedMaterial);
  const testResult = useCircuitStore((s) => s.testResult);
  const startLevel = useCircuitStore((s) => s.startLevel);
  const addNode = useCircuitStore((s) => s.addNode);
  const removeNode = useCircuitStore((s) => s.removeNode);
  const addEdge = useCircuitStore((s) => s.addEdge);
  const removeEdge = useCircuitStore((s) => s.removeEdge);
  const setSelectedMaterial = useCircuitStore((s) => s.setSelectedMaterial);
  const setPendingNode = useCircuitStore((s) => s.setPendingNode);
  const runTest = useCircuitStore((s) => s.runTest);
  const clearTestResult = useCircuitStore((s) => s.clearTestResult);
  const resetBuild = useCircuitStore((s) => s.resetBuild);
  const restoreBuild = useCircuitStore((s) => s.restoreBuild);

  const {
    lastSavedTime,
    wasRestored,
    saveNow,
    clearDraft,
    dismissRestoredNotice,
    isSaving,
  } = useAutosaveProject<{
    builtNodes: typeof builtNodes;
    builtEdges: typeof builtEdges;
    selectedMaterial: string;
    nextId: number;
  }>({
    discipline: 'circuits',
    levelId: level?.id ?? '',
    getData: () => ({
      builtNodes: useCircuitStore.getState().builtNodes,
      builtEdges: useCircuitStore.getState().builtEdges,
      selectedMaterial: useCircuitStore.getState().selectedMaterial,
      nextId: useCircuitStore.getState().nextId,
    }),
    onRestore: (saved) => {
      restoreBuild(saved.builtNodes, saved.builtEdges, saved.nextId, saved.selectedMaterial);
    },
    isEmpty: (data) => data.builtNodes.length === 0 && data.builtEdges.length === 0,
  });

  const getBlueprint = useCallback((): UniversalBlueprint<'circuits'> => {
    const curLevel = levelId ? getCircuitLevel(levelId) : undefined;
    const estCost = curLevel ? totalCircuitCost(curLevel, builtNodes, builtEdges) : 0;
    return {
      schemaVersion: 1,
      id: `bp_circ_${curLevel?.id || 'custom'}`,
      domain: 'circuits',
      name: `${curLevel?.name || 'Circuit'} Schematic`,
      levelId: curLevel?.id,
      createdAt: new Date().toISOString(),
      estimatedCost: estCost,
      data: {
        nodes: builtNodes,
        edges: builtEdges,
      },
    };
  }, [levelId, builtNodes, builtEdges]);

  useEffect(() => {
    if (level && currentLevelId !== level.id) {
      startLevel(level.id);
      const draft = autosaveManager.load<{
        builtNodes: typeof builtNodes;
        builtEdges: typeof builtEdges;
        selectedMaterial?: string;
        nextId?: number;
      }>('circuits', level.id);
      if (draft && (draft.data.builtNodes.length > 0 || draft.data.builtEdges.length > 0)) {
        restoreBuild(
          draft.data.builtNodes,
          draft.data.builtEdges,
          draft.data.nextId,
          draft.data.selectedMaterial,
        );
      }
    }
  }, [level, currentLevelId, startLevel, restoreBuild]);

  if (!level) return <Navigate to="/circuits" replace />;
  if (!isLevelUnlocked(level.id)) return <Navigate to="/circuits" replace />;

  const cost = totalCircuitCost(level, builtNodes, builtEdges);
  const next = nextCircuitLevelId(level.id);

  function handleSelectNode(nodeId: string) {
    if (pendingNodeId === null) {
      setPendingNode(nodeId);
    } else if (pendingNodeId === nodeId) {
      setPendingNode(null);
    } else {
      addEdge(pendingNodeId, nodeId);
      setPendingNode(null);
    }
  }

  const handleTest = () => {
    setIsSimulating(true);
    setShowResult(false);
    runTest(elapsedSeconds);
  };

  const handleSimulationFinish = () => {
    setIsSimulating(false);
    setShowResult(true);
    if (level && testResult?.status === 'analyzed' && testResult.passed && elapsedSeconds > 0) {
      highScoresManager.recordSolveTime(level.id, elapsedSeconds);
      progressManager.recordLevelCompletion(
        'circuits',
        level.id,
        testResult.stars as 1 | 2 | 3,
        testResult.cost,
        elapsedSeconds,
      );
    }
  };

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setShowResult(false);
    clearTestResult();
  };

  const handleReset = () => {
    setIsSimulating(false);
    setShowResult(false);
    resetBuild();
    clearDraft();
    setTimerResetKey((k) => k + 1);
    setElapsedSeconds(0);
  };

  const isLevelCompleted = testResult?.status === 'analyzed' && testResult.passed;
  const isStuck = !isLevelCompleted && elapsedSeconds >= 60;
  const guidance = getElectricalGuidance(level, builtNodes, builtEdges, cost, testResult);

  const handleLoadBlueprint = (bp: UniversalBlueprint) => {
    if (bp.domain === 'circuits') {
      const data = bp.data as CircuitsBlueprintData;
      restoreBuild(data.nodes, data.edges, data.nextId);
    }
  };

  return (
    <div className="mx-auto flex h-svh max-w-4xl flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent">
              {level.name}
            </p>
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
            title="Open Engineering Glossary (Capacitor, Kirchhoff's Laws, Ohm's Law, IEEE standards)"
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

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-surface-1">
        <CircuitCanvas
          level={level}
          builtNodes={builtNodes}
          builtEdges={builtEdges}
          pendingNodeId={pendingNodeId}
          testResult={testResult}
          isSimulating={isSimulating}
          onSimulationFinish={handleSimulationFinish}
          onResetSimulation={handleResetSimulation}
          onAddNode={addNode}
          onSelectNode={handleSelectNode}
          onRemoveNode={removeNode}
          onRemoveEdge={removeEdge}
        />
      </div>

      <p className="text-center text-xs text-fg-subtle">
        Click empty grid to add a joint · click two joints to connect them · right-click a joint to
        remove it · click a connection to remove it
      </p>

      <Toolbar
        budget={level.budget}
        cost={cost}
        materials={COMPONENTS}
        selectedMaterial={selectedMaterial}
        unlockedMaterials={level.unlockedMaterials}
        onSelectMaterial={setSelectedMaterial}
        onTest={handleTest}
        onReset={handleReset}
        onResetSimulation={handleResetSimulation}
        testing={isSimulating}
        testLabel="Test Circuit"
      />

      {showResult && testResult && (
        <CircuitResultOverlay
          result={testResult}
          budget={level.budget}
          hasNext={Boolean(next)}
          onRetry={handleReset}
          onNext={() => next && navigate(`/circuits/level/${next}`)}
          onLevelSelect={() => navigate('/circuits')}
        />
      )}

      {/* Engineering Glossary Modal */}
      <EngineeringGlossaryModal
        isOpen={showGlossary}
        onClose={() => setShowGlossary(false)}
        defaultCategory="circuits"
      />

      {/* Interactive Onboarding Overlay */}
      <OnboardingOverlay discipline="circuits" levelId={level.id} />

      {/* Blueprint Share & Import Modal */}
      {showBlueprintModal && (
        <BlueprintShareModal
          isOpen={showBlueprintModal}
          onClose={() => setShowBlueprintModal(false)}
          domain="circuits"
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
    </div>
  );
}
