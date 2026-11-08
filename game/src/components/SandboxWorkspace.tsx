import { useState } from 'react';
import { BridgeCanvas } from './BridgeCanvas';
import { CircuitCanvas } from './CircuitCanvas';
import { VehicleTrackCanvas } from './VehicleTrackCanvas';
import { Toolbar } from './Toolbar';
import { MATERIALS } from '../physics/materials';
import { COMPONENTS } from '../physics/components';
import { ENGINES, CHASSIS } from '../physics/vehicleParts';
import type { LevelDef } from '../content/types';
import type { CircuitLevelDef } from '../content/circuitTypes';
import type { VehicleLevelDef } from '../content/vehicleTypes';
import type { BuiltNode, BuiltMember } from '../game/build';
import type { BuiltEdge } from '../game/circuitBuild';
import { toTrussModel, totalCost } from '../game/build';
import { toCircuitModel, totalCircuitCost } from '../game/circuitBuild';
import { totalVehicleCost } from '../game/vehicleBuild';
import { analyzeTruss, type TrussAnalysis } from '../physics/truss';
import { analyzeCircuit, type CircuitAnalysis } from '../physics/circuit';
import { analyzeVehicle, type VehicleAnalysis } from '../physics/vehicle';
import { exportToGuildRegister } from '../physics/engine/PhysicsRegistry';
import { AutosaveIndicator } from './AutosaveIndicator';
import { useAutosaveProject } from '../state/useAutosaveProject';

export type SandboxDomain = 'structures' | 'circuits' | 'vehicles';

// Default Infinite / Free Sandbox Level Definitions
const SANDBOX_STRUCTURES_LEVEL: LevelDef = {
  id: 'sandbox-structures',
  order: 999,
  name: 'Structures Free Sandbox',
  tagline: 'Infinite budget chasm: design arches, cantilevers, or suspension bridges freely.',
  hint: 'No budget constraints. Build any truss configuration and test load capacity.',
  fixedNodes: [
    { id: 'anchor-left-low', x: 0, y: 0, support: 'pin', isDeck: true },
    { id: 'deck-mid-1', x: 4, y: 0, support: 'none', isDeck: true },
    { id: 'deck-mid-2', x: 8, y: 0, support: 'none', isDeck: true },
    { id: 'deck-mid-3', x: 12, y: 0, support: 'none', isDeck: true },
    { id: 'anchor-right-low', x: 16, y: 0, support: 'roller', isDeck: true },
  ],
  deckMembers: [
    { id: 'deck-0-1', nodeA: 'anchor-left-low', nodeB: 'deck-mid-1' },
    { id: 'deck-1-2', nodeA: 'deck-mid-1', nodeB: 'deck-mid-2' },
    { id: 'deck-2-3', nodeA: 'deck-mid-2', nodeB: 'deck-mid-3' },
    { id: 'deck-3-4', nodeA: 'deck-mid-3', nodeB: 'anchor-right-low' },
  ],
  loads: [
    { nodeId: 'deck-mid-1', force: 45_000 },
    { nodeId: 'deck-mid-2', force: 60_000 },
    { nodeId: 'deck-mid-3', force: 45_000 },
  ],
  budget: 999_999, // Infinite / unconstrained budget
  unlockedMaterials: ['wood', 'steel', 'cable', 'strut'],
  buildArea: { minX: -2, maxX: 18, minY: -8, maxY: 6 },
  gridSize: 0.5,
};

const SANDBOX_CIRCUITS_LEVEL: CircuitLevelDef = {
  id: 'sandbox-circuits',
  order: 999,
  name: 'Circuits Free Breadboard',
  tagline: 'Unrestricted electrical prototyping: wire series, parallel, or multi-load networks.',
  hint: 'Freely connect power supplies, resistors, and loads without budget limits.',
  sourceVoltage: 24,
  fixedNodes: [
    { id: 'ps-pos', x: 0, y: 0, terminal: 'positive' },
    { id: 'ps-neg', x: 10, y: 0, terminal: 'negative' },
    { id: 'bulb-terminal-a', x: 5, y: -2, terminal: 'none' },
    { id: 'bulb-terminal-b', x: 5, y: 2, terminal: 'none' },
  ],
  givenEdges: [
    { id: 'sandbox-bulb', nodeA: 'bulb-terminal-a', nodeB: 'bulb-terminal-b', componentId: 'bulb' },
  ],
  budget: 999_999,
  unlockedMaterials: ['wire', 'resistor_small', 'resistor_large'],
  buildArea: { minX: 0, maxX: 10, minY: -4, maxY: 4 },
  gridSize: 0.5,
};

const SANDBOX_VEHICLES_LEVEL: VehicleLevelDef = {
  id: 'sandbox-vehicles',
  order: 999,
  name: 'Vehicles Proving Ground',
  tagline: 'Custom test track: dial incline, distance, and cargo mass to benchmark powertrains.',
  hint: 'Freely adjust runway incline, distance, and payload to test Pacejka tire traction.',
  distance: 120,
  targetSpeed: 25,
  inclineDegrees: 0,
  payloadMass: 0,
  budget: 999_999,
  unlockedEngines: ['small', 'large', 'turbo'],
  unlockedChassis: ['light', 'heavy'],
};

export function SandboxWorkspace() {
  const [domain, setDomain] = useState<SandboxDomain>('structures');

  // Structures Sandbox State
  const [structNodes, setStructNodes] = useState<BuiltNode[]>([]);
  const [structMembers, setStructMembers] = useState<BuiltMember[]>([]);
  const [structSelectedMaterial, setStructSelectedMaterial] = useState('steel');
  const [structPendingNode, setStructPendingNode] = useState<string | null>(null);
  const [structSimulating, setStructSimulating] = useState(false);
  const [structAnalysis, setStructAnalysis] = useState<TrussAnalysis | null>(null);
  const [structNextId, setStructNextId] = useState(1);

  // Circuits Sandbox State
  const [circuitNodes, setCircuitNodes] = useState<BuiltNode[]>([]);
  const [circuitEdges, setCircuitEdges] = useState<BuiltEdge[]>([]);
  const [circuitSelectedComponent, setCircuitSelectedComponent] = useState('wire');
  const [circuitPendingNode, setCircuitPendingNode] = useState<string | null>(null);
  const [circuitSimulating, setCircuitSimulating] = useState(false);
  const [circuitAnalysis, setCircuitAnalysis] = useState<CircuitAnalysis | null>(null);
  const [circuitNextId, setCircuitNextId] = useState(1);
  const [customVoltage, setCustomVoltage] = useState(24);

  // Vehicles Sandbox State
  const [vehicleEngine, setVehicleEngine] = useState('large');
  const [vehicleChassis, setVehicleChassis] = useState('light');
  const [vehicleDistance, setVehicleDistance] = useState(120);
  const [vehicleIncline, setVehicleIncline] = useState(0);
  const [vehiclePayload, setVehiclePayload] = useState(0);
  const [vehicleSimulating, setVehicleSimulating] = useState(false);
  const [vehicleResult, setVehicleResult] = useState<VehicleAnalysis | null>(null);

  // Blueprint Export Modal State
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportCode, setExportCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Autosave for free sandbox workspace
  const {
    lastSavedTime,
    wasRestored,
    saveNow,
    clearDraft,
    dismissRestoredNotice,
    isSaving,
  } = useAutosaveProject<{
    nodes?: BuiltNode[];
    members?: BuiltMember[];
    edges?: BuiltEdge[];
    material?: string;
    component?: string;
    nextId?: number;
    voltage?: number;
    engine?: string;
    chassis?: string;
    distance?: number;
    incline?: number;
    payload?: number;
  }>({
    discipline: `sandbox-${domain}`,
    levelId: 'free-canvas',
    getData: () => {
      if (domain === 'structures') {
        return {
          nodes: structNodes,
          members: structMembers,
          material: structSelectedMaterial,
          nextId: structNextId,
        };
      }
      if (domain === 'circuits') {
        return {
          nodes: circuitNodes,
          edges: circuitEdges,
          component: circuitSelectedComponent,
          voltage: customVoltage,
          nextId: circuitNextId,
        };
      }
      return {
        engine: vehicleEngine,
        chassis: vehicleChassis,
        distance: vehicleDistance,
        incline: vehicleIncline,
        payload: vehiclePayload,
      };
    },
    onRestore: (saved) => {
      if (domain === 'structures' && saved.nodes) {
        setStructNodes(saved.nodes);
        if (saved.members) setStructMembers(saved.members);
        if (saved.material) setStructSelectedMaterial(saved.material);
        if (saved.nextId) setStructNextId(saved.nextId);
      } else if (domain === 'circuits' && saved.nodes) {
        setCircuitNodes(saved.nodes);
        if (saved.edges) setCircuitEdges(saved.edges);
        if (saved.component) setCircuitSelectedComponent(saved.component);
        if (saved.voltage) setCustomVoltage(saved.voltage);
        if (saved.nextId) setCircuitNextId(saved.nextId);
      } else if (domain === 'vehicles' && saved.engine) {
        setVehicleEngine(saved.engine);
        if (saved.chassis) setVehicleChassis(saved.chassis);
        if (saved.distance) setVehicleDistance(saved.distance);
        if (saved.incline !== undefined) setVehicleIncline(saved.incline);
        if (saved.payload !== undefined) setVehiclePayload(saved.payload);
      }
    },
    isEmpty: (data) => {
      if (domain === 'structures') return (data.nodes?.length ?? 0) === 0 && (data.members?.length ?? 0) === 0;
      if (domain === 'circuits') return (data.nodes?.length ?? 0) === 0 && (data.edges?.length ?? 0) === 0;
      return false;
    },
  });

  // --- STRUCTURES HANDLERS ---
  const handleAddStructNode = (x: number, y: number) => {
    const id = `node-${structNextId}`;
    setStructNodes((prev) => [...prev, { id, x, y }]);
    setStructNextId((n) => n + 1);
  };

  const handleSelectStructNode = (nodeId: string) => {
    if (!structPendingNode) {
      setStructPendingNode(nodeId);
    } else if (structPendingNode === nodeId) {
      setStructPendingNode(null);
    } else {
      const id = `member-${structNextId}`;
      setStructMembers((prev) => [
        ...prev,
        { id, nodeA: structPendingNode, nodeB: nodeId, materialId: structSelectedMaterial },
      ]);
      setStructNextId((n) => n + 1);
      setStructPendingNode(null);
    }
  };

  const handleRemoveStructNode = (nodeId: string) => {
    setStructNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setStructMembers((prev) => prev.filter((m) => m.nodeA !== nodeId && m.nodeB !== nodeId));
  };

  const handleRemoveStructMember = (memberId: string) => {
    setStructMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const handleRunStructTest = () => {
    const model = toTrussModel(SANDBOX_STRUCTURES_LEVEL, structNodes, structMembers);
    const analysis = analyzeTruss(model);
    setStructAnalysis(analysis);
    setStructSimulating(true);
  };

  const handleResetStructBuild = () => {
    setStructNodes([]);
    setStructMembers([]);
    setStructPendingNode(null);
    setStructSimulating(false);
    setStructAnalysis(null);
    clearDraft();
  };

  // --- CIRCUITS HANDLERS ---
  const handleAddCircuitNode = (x: number, y: number) => {
    const id = `cnode-${circuitNextId}`;
    setCircuitNodes((prev) => [...prev, { id, x, y }]);
    setCircuitNextId((n) => n + 1);
  };

  const handleSelectCircuitNode = (nodeId: string) => {
    if (!circuitPendingNode) {
      setCircuitPendingNode(nodeId);
    } else if (circuitPendingNode === nodeId) {
      setCircuitPendingNode(null);
    } else {
      const id = `cedge-${circuitNextId}`;
      setCircuitEdges((prev) => [
        ...prev,
        { id, nodeA: circuitPendingNode, nodeB: nodeId, componentId: circuitSelectedComponent },
      ]);
      setCircuitNextId((n) => n + 1);
      setCircuitPendingNode(null);
    }
  };

  const handleRemoveCircuitNode = (nodeId: string) => {
    setCircuitNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setCircuitEdges((prev) => prev.filter((e) => e.nodeA !== nodeId && e.nodeB !== nodeId));
  };

  const handleRemoveCircuitEdge = (edgeId: string) => {
    setCircuitEdges((prev) => prev.filter((e) => e.id !== edgeId));
  };

  const handleRunCircuitTest = () => {
    const customCircuitLevel: CircuitLevelDef = {
      ...SANDBOX_CIRCUITS_LEVEL,
      sourceVoltage: customVoltage,
    };
    const model = toCircuitModel(customCircuitLevel, circuitNodes, circuitEdges);
    const analysis = analyzeCircuit(model);
    setCircuitAnalysis(analysis);
    setCircuitSimulating(true);
  };

  const handleResetCircuitBuild = () => {
    setCircuitNodes([]);
    setCircuitEdges([]);
    setCircuitPendingNode(null);
    setCircuitSimulating(false);
    setCircuitAnalysis(null);
    clearDraft();
  };

  // --- VEHICLES HANDLERS ---
  const dynamicVehicleLevel: VehicleLevelDef = {
    ...SANDBOX_VEHICLES_LEVEL,
    distance: vehicleDistance,
    inclineDegrees: vehicleIncline,
    payloadMass: vehiclePayload,
  };

  const handleRunVehicleTest = () => {
    const engine = ENGINES[vehicleEngine];
    const chassis = CHASSIS[vehicleChassis];
    const result = analyzeVehicle(
      engine,
      chassis,
      vehicleDistance,
      vehicleIncline,
      vehiclePayload,
    );
    setVehicleResult(result);
    setVehicleSimulating(true);
  };

  const handleResetVehicle = () => {
    setVehicleSimulating(false);
    setVehicleResult(null);
  };

  // --- BLUEPRINT EXPORT GENERATOR ---
  const handleExportBlueprint = () => {
    let manifest = '';
    if (domain === 'structures') {
      const allNodes = [...SANDBOX_STRUCTURES_LEVEL.fixedNodes, ...structNodes];
      const entries = allNodes.map((n) => ({
        group: 'SANDBOX_NODE',
        element: n.id,
        parameter: 'coords',
        value: `(${n.x}, ${n.y})`,
        unit: 'm',
        basis: 'ESTIMATE' as const,
        source: 'Player Sandbox Assembly',
        status: 'EM_DIA' as const,
        note: 'Free sandbox joint',
      }));
      manifest = exportToGuildRegister('Sandbox Truss Assembly', 'SANDBOX-TRUSS-01', entries);
    } else if (domain === 'circuits') {
      const blueprintObj = {
        type: 'circuits-sandbox',
        voltage: customVoltage,
        nodes: circuitNodes,
        edges: circuitEdges,
      };
      manifest = JSON.stringify(blueprintObj, null, 2);
    } else {
      const blueprintObj = {
        type: 'vehicle-sandbox',
        engine: vehicleEngine,
        chassis: vehicleChassis,
        distance: vehicleDistance,
        incline: vehicleIncline,
        payload: vehiclePayload,
      };
      manifest = JSON.stringify(blueprintObj, null, 2);
    }

    setExportCode(manifest);
    setExportModalOpen(true);
    setCopied(false);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(exportCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const structCost = totalCost(SANDBOX_STRUCTURES_LEVEL, structNodes, structMembers);
  const circuitCost = totalCircuitCost(SANDBOX_CIRCUITS_LEVEL, circuitNodes, circuitEdges);
  const vehicleCost = totalVehicleCost(vehicleEngine, vehicleChassis);

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface-1 p-6 font-mono text-xs shadow-xl">
      {/* Top Controls: Domain Switcher & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-xl border border-accent/30 text-accent">
            🛠️
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-fg tracking-wide">
                Free Engineering Sandbox & Tinkerer's Workshop
              </h2>
              <span className="rounded-md bg-accent/20 border border-accent/40 px-2 py-0.5 text-[10px] text-accent font-semibold">
                UNCONSTRAINED PROTOTYPING
              </span>
            </div>
            <p className="text-xs text-fg-muted font-sans">
              Build unconstrained trusses, custom circuits, and tuned powertrains without budget caps or strict objectives.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Domain switcher */}
          <div className="flex items-center gap-1 rounded-xl bg-surface-2 p-1 border border-border">
            <button
              onClick={() => setDomain('structures')}
              className={`rounded-lg px-3 py-1.5 font-bold text-xs transition-colors ${
                domain === 'structures'
                  ? 'bg-accent text-accent-fg shadow-sm'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              🌉 Structures
            </button>
            <button
              onClick={() => setDomain('circuits')}
              className={`rounded-lg px-3 py-1.5 font-bold text-xs transition-colors ${
                domain === 'circuits'
                  ? 'bg-accent text-accent-fg shadow-sm'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              ⚡ Circuits
            </button>
            <button
              onClick={() => setDomain('vehicles')}
              className={`rounded-lg px-3 py-1.5 font-bold text-xs transition-colors ${
                domain === 'vehicles'
                  ? 'bg-accent text-accent-fg shadow-sm'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              🚗 Vehicles
            </button>
          </div>

          <div className="flex items-center gap-3">
            <AutosaveIndicator
              lastSavedTime={lastSavedTime}
              isSaving={isSaving}
              wasRestored={wasRestored}
              onSaveNow={saveNow}
              onClearDraft={clearDraft}
              onDismissRestored={dismissRestoredNotice}
            />

            <button
              onClick={handleExportBlueprint}
              className="flex items-center gap-1.5 rounded-xl border border-accent/50 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent hover:bg-accent/20 transition-colors"
            >
              <span>📜</span>
              <span>Export Blueprint</span>
            </button>
          </div>
        </div>
      </div>

      {/* DOMAIN 1: STRUCTURES FREE CANVAS */}
      {domain === 'structures' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-fg-muted">
            <span>
              Total Members: <strong className="text-fg">{structMembers.length}</strong> | Total Joints:{' '}
              <strong className="text-fg">{structNodes.length + 5}</strong>
            </span>
            <span className="font-mono text-accent">
              Prototyping Cost: ${structCost.toFixed(0)} (Budget: ∞)
            </span>
          </div>

          <div className="h-[460px] overflow-hidden rounded-2xl border border-border bg-surface-2/30">
            <BridgeCanvas
              level={SANDBOX_STRUCTURES_LEVEL}
              builtNodes={structNodes}
              builtMembers={structMembers}
              pendingNodeId={structPendingNode}
              testResult={
                structAnalysis
                  ? structAnalysis.status === 'unstable'
                    ? { status: 'unstable' }
                    : {
                        status: 'analyzed',
                        members: structAnalysis.members,
                        anyFailed: structAnalysis.anyFailed,
                        passed: !structAnalysis.anyFailed,
                        cost: structCost,
                        stars: structAnalysis.anyFailed ? 0 : 3,
                      }
                  : null
              }
              isSimulating={structSimulating}
              onSimulationFinish={() => setStructSimulating(false)}
              onResetSimulation={() => setStructSimulating(false)}
              onAddNode={handleAddStructNode}
              onSelectNode={handleSelectStructNode}
              onRemoveNode={handleRemoveStructNode}
              onRemoveMember={handleRemoveStructMember}
            />
          </div>

          <Toolbar
            budget={999_999}
            cost={structCost}
            materials={MATERIALS}
            selectedMaterial={structSelectedMaterial}
            unlockedMaterials={SANDBOX_STRUCTURES_LEVEL.unlockedMaterials}
            onSelectMaterial={setStructSelectedMaterial}
            onTest={handleRunStructTest}
            onReset={handleResetStructBuild}
            onResetSimulation={() => setStructSimulating(false)}
            testing={structSimulating}
            testLabel="Simulate Free Bridge"
          />
        </div>
      )}

      {/* DOMAIN 2: CIRCUITS FREE CANVAS */}
      {domain === 'circuits' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-fg-muted">
            <div className="flex items-center gap-3">
              <span>Source Voltage:</span>
              <input
                type="range"
                min="3"
                max="48"
                step="1"
                value={customVoltage}
                onChange={(e) => setCustomVoltage(parseInt(e.target.value, 10))}
                className="w-32 accent-accent"
              />
              <span className="font-bold text-accent">{customVoltage} V</span>
            </div>

            <span className="font-mono text-accent">
              Wiring Cost: ${circuitCost.toFixed(0)} (Budget: ∞)
            </span>
          </div>

          <div className="h-[460px] overflow-hidden rounded-2xl border border-border bg-surface-2/30">
            <CircuitCanvas
              level={{ ...SANDBOX_CIRCUITS_LEVEL, sourceVoltage: customVoltage }}
              builtNodes={circuitNodes}
              builtEdges={circuitEdges}
              pendingNodeId={circuitPendingNode}
              testResult={
                circuitAnalysis
                  ? circuitAnalysis.status === 'open'
                    ? { status: 'open' }
                    : {
                        status: 'analyzed',
                        edges: circuitAnalysis.edges,
                        anyBurnedOut: circuitAnalysis.anyBurnedOut,
                        anyUnderpowered: circuitAnalysis.edges.some((e) => e.underpowered),
                        passed: !circuitAnalysis.anyBurnedOut,
                        cost: circuitCost,
                        stars: circuitAnalysis.anyBurnedOut ? 0 : 3,
                      }
                  : null
              }
              isSimulating={circuitSimulating}
              onSimulationFinish={() => setCircuitSimulating(false)}
              onResetSimulation={() => setCircuitSimulating(false)}
              onAddNode={handleAddCircuitNode}
              onSelectNode={handleSelectCircuitNode}
              onRemoveNode={handleRemoveCircuitNode}
              onRemoveEdge={handleRemoveCircuitEdge}
            />
          </div>

          <Toolbar
            budget={999_999}
            cost={circuitCost}
            materials={COMPONENTS}
            selectedMaterial={circuitSelectedComponent}
            unlockedMaterials={SANDBOX_CIRCUITS_LEVEL.unlockedMaterials}
            onSelectMaterial={setCircuitSelectedComponent}
            onTest={handleRunCircuitTest}
            onReset={handleResetCircuitBuild}
            onResetSimulation={() => setCircuitSimulating(false)}
            testing={circuitSimulating}
            testLabel="Simulate Breadboard"
          />
        </div>
      )}

      {/* DOMAIN 3: VEHICLES PROVING GROUND */}
      {domain === 'vehicles' && (
        <div className="flex flex-col gap-6">
          {/* Custom Proving Ground Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-xl border border-border bg-surface-2/50 p-4">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-fg-muted">Runway Distance:</span>
                <span className="font-bold text-accent">{vehicleDistance} m</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={vehicleDistance}
                onChange={(e) => setVehicleDistance(parseInt(e.target.value, 10))}
                className="accent-accent"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-fg-muted">Track Incline:</span>
                <span className="font-bold text-accent">{vehicleIncline}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={vehicleIncline}
                onChange={(e) => setVehicleIncline(parseInt(e.target.value, 10))}
                className="accent-accent"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-fg-muted">Payload Cargo:</span>
                <span className="font-bold text-accent">{vehiclePayload} kg</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={vehiclePayload}
                onChange={(e) => setVehiclePayload(parseInt(e.target.value, 10))}
                className="accent-accent"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleResetVehicle}
                className="rounded-lg border border-border px-3 py-2 text-xs text-fg-muted hover:text-fg"
              >
                Reset
              </button>
              <button
                onClick={handleRunVehicleTest}
                className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-accent-fg hover:opacity-90"
              >
                Launch Test Run
              </button>
            </div>
          </div>

          {/* Loadout Part Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-surface-2/30 p-4">
              <h4 className="text-xs font-bold uppercase text-fg-subtle mb-3">Select Powertrain Engine</h4>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(ENGINES).map((eng) => (
                  <button
                    key={eng.id}
                    onClick={() => setVehicleEngine(eng.id)}
                    className={`rounded-lg border p-2 text-left transition-colors ${
                      vehicleEngine === eng.id
                        ? 'border-accent bg-accent/20 text-accent font-bold'
                        : 'border-border bg-surface-1 text-fg hover:border-accent/40'
                    }`}
                  >
                    <div className="text-xs">{eng.name}</div>
                    <div className="text-[10px] text-fg-muted">{eng.force} N</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface-2/30 p-4">
              <h4 className="text-xs font-bold uppercase text-fg-subtle mb-3">Select Rolling Chassis</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(CHASSIS).map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setVehicleChassis(ch.id)}
                    className={`rounded-lg border p-2 text-left transition-colors ${
                      vehicleChassis === ch.id
                        ? 'border-accent bg-accent/20 text-accent font-bold'
                        : 'border-border bg-surface-1 text-fg hover:border-accent/40'
                    }`}
                  >
                    <div className="text-xs">{ch.name}</div>
                    <div className="text-[10px] text-fg-muted">{ch.mass} kg</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Track Canvas */}
          <VehicleTrackCanvas
            level={dynamicVehicleLevel}
            selectedEngineId={vehicleEngine}
            selectedChassisId={vehicleChassis}
            testResult={
              vehicleResult
                ? {
                    analysis: {
                      effectiveForce: vehicleResult.effectiveForce,
                      tractionLimit: vehicleResult.tractionLimit,
                      tractionLimited: vehicleResult.tractionLimited,
                      acceleration: vehicleResult.acceleration,
                      finalSpeed: vehicleResult.finalSpeed,
                      stalled: vehicleResult.stalled,
                      slipRatio: 0.12,
                    },
                    passed: !vehicleResult.stalled,
                    stars: vehicleResult.stalled ? 0 : 3,
                    cost: vehicleCost,
                  }
                : null
            }
            isSimulating={vehicleSimulating}
            onSimulationFinish={() => setVehicleSimulating(false)}
            onResetSimulation={() => setVehicleSimulating(false)}
          />
        </div>
      )}

      {/* Blueprint Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-surface-1/90 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="text-accent text-lg">📜</span>
                <div>
                  <h3 className="font-mono text-sm font-bold text-fg">
                    Sandbox Blueprint & Dimension Manifest
                  </h3>
                  <p className="text-[11px] text-fg-muted">
                    Engineering Guild standards compliant export format
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                className="rounded-lg p-1 text-fg-muted hover:text-fg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              <textarea
                readOnly
                value={exportCode}
                rows={16}
                className="w-full rounded-xl border border-border bg-surface-2/70 p-3 font-mono text-xs text-fg focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-between border-t border-border bg-surface-1/90 px-5 py-3">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 font-mono text-xs font-semibold text-accent-fg hover:opacity-90"
              >
                <span>{copied ? '✓ Copied!' : '📋 Copy to Clipboard'}</span>
              </button>
              <button
                onClick={() => setExportModalOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-xs text-fg-muted hover:text-fg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
