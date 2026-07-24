import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { CircuitCanvas } from '../components/CircuitCanvas';
import { CircuitResultOverlay } from '../components/CircuitResultOverlay';
import { Toolbar } from '../components/Toolbar';
import { getCircuitLevel, nextCircuitLevelId } from '../content/circuitLevels';
import { totalCircuitCost } from '../game/circuitBuild';
import { COMPONENTS } from '../physics/components';
import { useCircuitStore } from '../state/circuitStore';

export function CircuitsPlayLevel() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [showHint, setShowHint] = useState(false);

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

  return (
    <div className="mx-auto flex h-svh max-w-4xl flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            {level.name}
          </p>
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

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-surface-1">
        <CircuitCanvas
          level={level}
          builtNodes={builtNodes}
          builtEdges={builtEdges}
          pendingNodeId={pendingNodeId}
          testResult={testResult}
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
        onTest={runTest}
        onReset={resetBuild}
        testing={false}
        testLabel="Test Circuit"
      />

      {testResult && (
        <CircuitResultOverlay
          result={testResult}
          budget={level.budget}
          hasNext={Boolean(next)}
          onRetry={resetBuild}
          onNext={() => next && navigate(`/circuits/level/${next}`)}
          onLevelSelect={() => navigate('/circuits')}
        />
      )}
    </div>
  );
}
