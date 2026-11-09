import { useCallback, useEffect, useState, useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { BridgeCanvas } from '../components/BridgeCanvas';
import { ResultOverlay } from '../components/ResultOverlay';
import { Toolbar } from '../components/Toolbar';
import { getLevel, nextLevelId } from '../content/levels';
import { totalCost } from '../game/build';
import { MATERIALS } from '../physics/materials';
import { useGameStore } from '../state/gameStore';
import { exportToGuildRegister } from '../physics/engine/PhysicsRegistry';
import { ChallengeTimer } from '../components/ChallengeTimer';
import { getStructuralGuidance } from '../game/guidanceSystem';
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
import { computeTrussBuildMetrics } from '../physics/buildModePhysics';
import type { UniversalBlueprint, StructuresBlueprintData } from '../state/BlueprintManager';

export function StructuresPlayLevel() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [showHint, setShowHint] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [showManifest, setShowManifest] = useState(false);
  const [manifestText, setManifestText] = useState('');
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [timerResetKey, setTimerResetKey] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showCoGMarker, setShowCoGMarker] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [heatmapEnabled, setHeatmapEnabled] = useState(true);
  const [debugConfig, setDebugConfig] = useState<PhysicsDebugConfig>({
    enabled: false,
    showColliders: true,
    showForceVectors: true,
    showEquilibrium: true,
  });

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
  const restoreBuild = useGameStore((s) => s.restoreBuild);
  const undo = useGameStore((s) => s.undo);
  const redo = useGameStore((s) => s.redo);
  const canUndo = useGameStore((s) => s.undoStack.length > 0);
  const canRedo = useGameStore((s) => s.redoStack.length > 0);

  // Keyboard shortcut listener for Undo (Ctrl+Z) and Redo (Ctrl+Y / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Real-time statics and physics calculations in build mode
  const trussMetrics = useMemo(() => {
    if (!level) return undefined;
    return computeTrussBuildMetrics(level, builtNodes, builtMembers);
  }, [level, builtNodes, builtMembers]);

  const {
    lastSavedTime,
    wasRestored,
    saveNow,
    clearDraft,
    dismissRestoredNotice,
    isSaving,
  } = useAutosaveProject<{
    builtNodes: typeof builtNodes;
    builtMembers: typeof builtMembers;
    selectedMaterial: string;
    nextId: number;
  }>({
    discipline: 'structures',
    levelId: level?.id ?? '',
    getData: () => ({
      builtNodes: useGameStore.getState().builtNodes,
      builtMembers: useGameStore.getState().builtMembers,
      selectedMaterial: useGameStore.getState().selectedMaterial,
      nextId: useGameStore.getState().nextId,
    }),
    onRestore: (saved) => {
      restoreBuild(saved.builtNodes, saved.builtMembers, saved.nextId, saved.selectedMaterial);
    },
    isEmpty: (data) => data.builtNodes.length === 0 && data.builtMembers.length === 0,
  });

  const getBlueprint = useCallback((): UniversalBlueprint<'structures'> => {
    const curLevel = levelId ? getLevel(levelId) : undefined;
    const estCost = curLevel ? totalCost(curLevel, builtNodes, builtMembers) : 0;
    return {
      schemaVersion: 1,
      id: `bp_struct_${curLevel?.id || 'custom'}`,
      domain: 'structures',
      name: `${curLevel?.name || 'Bridge'} Design`,
      levelId: curLevel?.id,
      createdAt: new Date().toISOString(),
      estimatedCost: estCost,
      data: {
        nodes: builtNodes,
        members: builtMembers,
      },
    };
  }, [levelId, builtNodes, builtMembers]);

  const [savedCount, setSavedCount] = useState(() =>
    level ? designSaveManager.getDesignsForLevel('structures', level.id).length : 0,
  );

  useEffect(() => {
    if (!level) return;
    return designSaveManager.subscribe(() => {
      setSavedCount(designSaveManager.getDesignsForLevel('structures', level.id).length);
    });
  }, [level]);

  const debugStats = useMemo(() => {
    if (!level) return undefined;
    const j = level.fixedNodes.length + builtNodes.length;
    const m = level.deckMembers.length + builtMembers.length;
    const diff = m - (2 * j - 3);
    return {
      colliderCount: j + m + level.fixedNodes.length,
      vectorCount: builtNodes.length + level.fixedNodes.length + builtMembers.length,
      equilibriumStatus: (diff >= 0 ? 'balanced' : 'unbalanced') as 'balanced' | 'unbalanced',
      equilibriumDetail:
        diff === 0
          ? 'Determinate (m=2j-3)'
          : diff > 0
            ? `Redundant (+${diff})`
            : `Mechanism (${diff})`,
    };
  }, [level, builtNodes, builtMembers]);

  const handleRestoreSavedDesign = useCallback(
    (
      design: SavedDesign<{
        builtNodes: typeof builtNodes;
        builtMembers: typeof builtMembers;
        selectedMaterial: string;
        nextId: number;
      }>,
    ) => {
      restoreBuild(
        design.data.builtNodes,
        design.data.builtMembers,
        design.data.nextId,
        design.data.selectedMaterial,
      );
    },
    [restoreBuild],
  );

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
      const draft = autosaveManager.load<{
        builtNodes: typeof builtNodes;
        builtMembers: typeof builtMembers;
        selectedMaterial?: string;
        nextId?: number;
      }>('structures', level.id);
      if (draft && (draft.data.builtNodes.length > 0 || draft.data.builtMembers.length > 0)) {
        restoreBuild(
          draft.data.builtNodes,
          draft.data.builtMembers,
          draft.data.nextId,
          draft.data.selectedMaterial,
        );
      }
    }
  }, [level, currentLevelId, startLevel, restoreBuild]);

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
    runTest(elapsedSeconds);
  };

  const handleSimulationFinish = () => {
    setIsSimulating(false);
    setShowResult(true);
    if (level && testResult?.status === 'analyzed' && testResult.passed && elapsedSeconds > 0) {
      highScoresManager.recordSolveTime(level.id, elapsedSeconds);
      progressManager.recordLevelCompletion(
        'structures',
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
  const guidance = getStructuralGuidance(level, builtNodes, builtMembers, cost, testResult);

  const handleLoadBlueprint = (bp: UniversalBlueprint) => {
    if (bp.domain === 'structures') {
      const data = bp.data as StructuresBlueprintData;
      restoreBuild(data.nodes, data.members, data.nextId);
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
          {/* Toggle-able Physics Debug Overlay Panel */}
          <PhysicsDebugPanel config={debugConfig} onChange={setDebugConfig} stats={debugStats} />

          {/* Design Save & Resume System */}
          <button
            onClick={() => setShowSaveModal(true)}
            title="Save current design or resume previously saved designs"
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
            title="Open Engineering Glossary (Truss, Buckling, Elastic Modulus, AISC/ASME standards)"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-fg-muted hover:border-accent hover:text-fg transition-colors"
          >
            <span>📖</span>
            <span>Glossary</span>
          </button>
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

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-surface-1">
        {/* Real-time Build Mode Physics HUD Overlay */}
        {!isSimulating && !testResult && trussMetrics && (
          <div className="absolute top-3 left-3 z-20 pointer-events-auto">
            <BuildModePhysicsHUD
              discipline="structures"
              trussMetrics={trussMetrics}
              showCoGMarker={showCoGMarker}
              onToggleCoGMarker={() => setShowCoGMarker((v) => !v)}
              heatmapEnabled={heatmapEnabled}
              onToggleHeatmap={() => setHeatmapEnabled((v) => !v)}
              playbackSpeed={playbackSpeed}
              onSpeedChange={setPlaybackSpeed}
            />
          </div>
        )}

        <BridgeCanvas
          level={level}
          builtNodes={builtNodes}
          builtMembers={builtMembers}
          pendingNodeId={pendingNodeId}
          testResult={testResult}
          debugConfig={debugConfig}
          cog={trussMetrics?.cog}
          showCoGMarker={showCoGMarker}
          heatmapEnabled={heatmapEnabled}
          onToggleHeatmap={() => setHeatmapEnabled((v) => !v)}
          playbackSpeed={playbackSpeed}
          onSpeedChange={setPlaybackSpeed}
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
        remove it · click a member to remove it · <span className="font-mono text-[11px]">Ctrl+Z</span> to undo · <span className="font-mono text-[11px]">Ctrl+Y</span> to redo
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
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
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

      {/* Engineering Glossary Modal */}
      <EngineeringGlossaryModal
        isOpen={showGlossary}
        onClose={() => setShowGlossary(false)}
        defaultCategory="structures"
      />

      {/* Interactive Onboarding Overlay */}
      <OnboardingOverlay discipline="structures" levelId={level.id} />

      {/* Blueprint Share & Import Modal */}
      {showBlueprintModal && (
        <BlueprintShareModal
          isOpen={showBlueprintModal}
          onClose={() => setShowBlueprintModal(false)}
          domain="structures"
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
          discipline="structures"
          levelId={level.id}
          levelName={level.name}
          currentData={{
            builtNodes,
            builtMembers,
            selectedMaterial,
            nextId: useGameStore.getState().nextId,
          }}
          currentStats={{
            partCount: builtMembers.length,
            cost,
            summary: `${builtNodes.length} joints, ${builtMembers.length} members`,
          }}
          onRestoreDesign={handleRestoreSavedDesign}
          canSave={builtNodes.length > 0 || builtMembers.length > 0}
        />
      )}
    </div>
  );
}
