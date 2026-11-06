import { useEffect, useState } from 'react';
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

export function CircuitsPlayLevel() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [showHint, setShowHint] = useState(false);
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

  useEffect(() => {
    if (level && currentLevelId !== level.id) {
      startLevel(level.id);
    }
  }, [level, currentLevelId, startLevel]);

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
    runTest();
  };

  const handleSimulationFinish = () => {
    setIsSimulating(false);
    setShowResult(true);
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
    setTimerResetKey((k) => k + 1);
    setElapsedSeconds(0);
  };

  const isLevelCompleted = testResult?.status === 'analyzed' && testResult.passed;
  const isStuck = !isLevelCompleted && elapsedSeconds >= 60;
  const guidance = getElectricalGuidance(level, builtNodes, builtEdges, cost, testResult);

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
    </div>
  );
}
