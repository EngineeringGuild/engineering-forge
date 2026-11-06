import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { BridgeCanvas } from '../components/BridgeCanvas';
import { ResultOverlay } from '../components/ResultOverlay';
import { Toolbar } from '../components/Toolbar';
import { getLevel, nextLevelId } from '../content/levels';
import { totalCost } from '../game/build';
import { MATERIALS } from '../physics/materials';
import { useGameStore } from '../state/gameStore';
import { exportToGuildRegister } from '../physics/engine/PhysicsRegistry';

export function StructuresPlayLevel() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [showHint, setShowHint] = useState(false);
  const [showManifest, setShowManifest] = useState(false);
  const [manifestText, setManifestText] = useState('');
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showResult, setShowResult] = useState(false);

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
  const clearTestResult = useGameStore((s) => s.clearTestResult);
  const resetBuild = useGameStore((s) => s.resetBuild);

  const handleOpenManifest = () => {
    if (!level) return;
    const allNodes = [...level.fixedNodes, ...builtNodes];
    const nodeMap = new Map(allNodes.map((n) => [n.id, n]));
    const entries = [];

    // Register all nodes (joints)
    for (const n of allNodes) {
      const isFixed = level.fixedNodes.some((fn) => fn.id === n.id);
      const basisVal: 'LOCKED' | 'ESTIMATE' = isFixed ? 'LOCKED' : 'ESTIMATE';
      entries.push({
        group: 'STR_NODE',
        element: n.id,
        parameter: 'pos_x',
        value: n.x,
        unit: 'm',
        basis: basisVal,
        source: isFixed ? 'Level Definition' : 'Player Placement',
        status: 'EM_DIA' as const,
        note: `Joint position X (snapped to ${level.gridSize}m grid)`,
      });
      entries.push({
        group: 'STR_NODE',
        element: n.id,
        parameter: 'pos_y',
        value: n.y,
        unit: 'm',
        basis: basisVal,
        source: isFixed ? 'Level Definition' : 'Player Placement',
        status: 'EM_DIA' as const,
        note: `Joint position Y (snapped to ${level.gridSize}m grid)`,
      });
    }

    // Register all structural members
    for (const m of builtMembers) {
      const na = nodeMap.get(m.nodeA);
      const nb = nodeMap.get(m.nodeB);
      const len = na && nb ? Math.hypot(nb.x - na.x, nb.y - na.y) : 0;
      const mat = MATERIALS[m.materialId];
      entries.push({
        group: 'STR_MEMBER',
        element: m.id,
        parameter: 'length',
        value: Number(len.toFixed(3)),
        unit: 'm',
        basis: 'DERIVADO' as const,
        source: 'Euclidean distance from joints',
        status: 'EM_DIA' as const,
        note: `Material: ${mat ? mat.name : m.materialId}, Allowable Stress=${mat ? (mat.allowableStress / 1e6).toFixed(0) : 'N/A'} MPa`,
      });
    }

    const output = exportToGuildRegister(
      'Bridge Structural Assembly',
      level.name.replace(/\s+/g, '-').toUpperCase(),
      entries,
    );
    setManifestText(output);
    setShowManifest(true);
    setCopiedManifest(false);
  };

  const handleCopyManifest = async () => {
    try {
      await navigator.clipboard.writeText(manifestText);
      setCopiedManifest(true);
      setTimeout(() => setCopiedManifest(false), 2000);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    if (level && currentLevelId !== level.id) {
      startLevel(level.id);
    }
  }, [level, currentLevelId, startLevel]);

  if (!level) return <Navigate to="/structures" replace />;
  if (!isLevelUnlocked(level.id)) return <Navigate to="/structures" replace />;

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
  };

  return (
    <div className="mx-auto flex h-svh max-w-4xl flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            {level.name}
          </p>
          <p className="text-sm text-fg-muted">{level.tagline}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenManifest}
            title="Export full bridge geometry to Engineering Guild Dimension Register (python Dim format)"
            className="flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-xs font-semibold text-accent hover:bg-accent/20 transition-colors"
          >
            <span>📜</span>
            <span>Guild Register</span>
          </button>
          <button
            onClick={() => setShowHint((v) => !v)}
            className="rounded-lg border border-border px-3 py-2 text-sm text-fg-muted hover:text-fg"
          >
            Hint
          </button>
        </div>
      </header>

      {showHint && (
        <p className="rounded-xl border border-border bg-surface-1 px-4 py-3 text-sm text-fg-muted">
          {level.hint}
        </p>
      )}

      {/* Guild Dimension Register Export Modal */}
      {showManifest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-accent/40 bg-surface-1 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/80 bg-surface-2/60 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="text-accent text-lg">📜</span>
                <div>
                  <h3 className="font-mono text-sm font-bold text-fg">
                    Guild Dimension Register Export
                  </h3>
                  <p className="text-[11px] text-fg-muted">
                    ASME Section III/VIII compliant <code className="text-accent">Dim()</code> specification for EngineeringGuild/parque-uranio
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowManifest(false)}
                className="rounded-lg p-1 text-fg-muted hover:bg-surface-2 hover:text-fg"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <pre className="rounded-xl bg-surface-base p-4 font-mono text-xs text-fg-muted leading-relaxed border border-border select-all overflow-x-auto whitespace-pre">
                {manifestText}
              </pre>
            </div>

            <div className="flex items-center justify-between border-t border-border bg-surface-2/40 px-5 py-3">
              <span className="text-xs text-fg-subtle font-mono">
                {builtMembers.length} members · {builtNodes.length + level.fixedNodes.length} nodes
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyManifest}
                  className="rounded-lg bg-accent px-4 py-1.5 font-mono text-xs font-semibold text-accent-fg hover:bg-accent/90 transition-colors"
                >
                  {copiedManifest ? '✓ Copied to Clipboard!' : 'Copy Python Register'}
                </button>
                <button
                  onClick={() => setShowManifest(false)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-fg hover:bg-surface-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-surface-1">
        <BridgeCanvas
          level={level}
          builtNodes={builtNodes}
          builtMembers={builtMembers}
          pendingNodeId={pendingNodeId}
          testResult={testResult}
          isSimulating={isSimulating}
          onSimulationFinish={handleSimulationFinish}
          onResetSimulation={handleResetSimulation}
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
        materials={MATERIALS}
        selectedMaterial={selectedMaterial}
        unlockedMaterials={level.unlockedMaterials}
        onSelectMaterial={setSelectedMaterial}
        onTest={handleTest}
        onReset={handleReset}
        onResetSimulation={handleResetSimulation}
        testing={isSimulating}
        testLabel="Test Bridge"
      />

      {showResult && testResult && (
        <ResultOverlay
          result={testResult}
          budget={level.budget}
          hasNext={Boolean(next)}
          onRetry={handleReset}
          onNext={() => next && navigate(`/structures/level/${next}`)}
          onLevelSelect={() => navigate('/structures')}
        />
      )}
    </div>
  );
}
