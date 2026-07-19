import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { BridgeCanvas } from '../components/BridgeCanvas';
import { ResultOverlay } from '../components/ResultOverlay';
import { Toolbar } from '../components/Toolbar';
import { getLevel, nextLevelId } from '../content/levels';
import { totalCost } from '../game/build';
import { useGameStore } from '../state/gameStore';

export function PlayLevel() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [showHint, setShowHint] = useState(false);

  const level = levelId ? getLevel(levelId) : undefined;
  const isLevelUnlocked = useGameStore((s) => s.isLevelUnlocked);
  const currentLevelId = useGameStore((s) => s.currentLevelId);
  const builtNodes = useGameStore((s) => s.builtNodes);
  const builtMembers = useGameStore((s) => s.builtMembers);
  const pendingNodeId = useGameStore((s) => s.pendingNodeId);
  const selectedMaterial = useGameStore((s) => s.selectedMaterial);
  const testResult = useGameStore((s) => s.testResult);
  const startLevel = useGameStore((s) => s.startLevel);
  const addNode = useGameStore((s) => s.addNode);
  const removeNode = useGameStore((s) => s.removeNode);
  const addMember = useGameStore((s) => s.addMember);
  const removeMember = useGameStore((s) => s.removeMember);
  const setSelectedMaterial = useGameStore((s) => s.setSelectedMaterial);
  const setPendingNode = useGameStore((s) => s.setPendingNode);
  const runTest = useGameStore((s) => s.runTest);
  const resetBuild = useGameStore((s) => s.resetBuild);

  useEffect(() => {
    if (level && currentLevelId !== level.id) {
      startLevel(level.id);
    }
  }, [level, currentLevelId, startLevel]);

  if (!level) return <Navigate to="/" replace />;
  if (!isLevelUnlocked(level.id)) return <Navigate to="/" replace />;

  const cost = totalCost(level, builtNodes, builtMembers);
  const next = nextLevelId(level.id);

  function handleSelectNode(nodeId: string) {
    if (pendingNodeId === null) {
      setPendingNode(nodeId);
    } else if (pendingNodeId === nodeId) {
      setPendingNode(null);
    } else {
      addMember(pendingNodeId, nodeId);
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
        <BridgeCanvas
          level={level}
          builtNodes={builtNodes}
          builtMembers={builtMembers}
          pendingNodeId={pendingNodeId}
          testResult={testResult}
          onAddNode={addNode}
          onSelectNode={handleSelectNode}
          onRemoveNode={removeNode}
          onRemoveMember={removeMember}
        />
      </div>

      <p className="text-center text-xs text-fg-subtle">
        Click empty grid to add a joint · click two joints to connect them · right-click a joint to
        remove it · click a member to remove it
      </p>

      <Toolbar
        budget={level.budget}
        cost={cost}
        selectedMaterial={selectedMaterial}
        unlockedMaterials={level.unlockedMaterials}
        onSelectMaterial={setSelectedMaterial}
        onTest={runTest}
        onReset={resetBuild}
        testing={false}
      />

      {testResult && (
        <ResultOverlay
          result={testResult}
          budget={level.budget}
          hasNext={Boolean(next)}
          onRetry={resetBuild}
          onNext={() => next && navigate(`/level/${next}`)}
          onLevelSelect={() => navigate('/')}
        />
      )}
    </div>
  );
}
