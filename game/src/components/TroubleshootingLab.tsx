import { useState } from 'react';
import { BridgeCanvas } from './BridgeCanvas';
import { CircuitCanvas } from './CircuitCanvas';
import { VehicleTrackCanvas } from './VehicleTrackCanvas';
import { DigitalMultimeter } from './DigitalMultimeter';
import { soundFx } from '../audio/soundFx';
import type { LevelDef } from '../content/types';
import type { CircuitLevelDef } from '../content/circuitTypes';
import type { VehicleLevelDef } from '../content/vehicleTypes';
import type { BuiltNode, BuiltMember } from '../game/build';
import type { BuiltEdge } from '../game/circuitBuild';
import { toTrussModel } from '../game/build';
import { toCircuitModel } from '../game/circuitBuild';
import { analyzeTruss, type TrussAnalysis } from '../physics/truss';
import { analyzeCircuit, type CircuitAnalysis } from '../physics/circuit';
import { analyzeVehicle, type VehicleAnalysis } from '../physics/vehicle';
import { ENGINES, CHASSIS } from '../physics/vehicleParts';

interface PuzzleDef {
  id: string;
  discipline: 'structures' | 'circuits' | 'vehicles';
  title: string;
  tagline: string;
  symptom: string;
  clue: string;
  targetObjective: string;
}

const PUZZLES: PuzzleDef[] = [
  {
    id: 'puzzle-truss-buckle',
    discipline: 'structures',
    title: 'The Buckling Diagonal',
    tagline: 'A truss member fails catastrophically under compressive load.',
    symptom: 'Bridge collapses immediately under vehicle transit with member rupture.',
    clue: 'Use the Heatmap overlay to spot which member turns Crimson Red under compression. A cable cannot resist compression!',
    targetObjective: 'Replace the slack cable with a rigid steel strut that can withstand compressive forces.',
  },
  {
    id: 'puzzle-circuit-short',
    discipline: 'circuits',
    title: 'The Breaker Trip Mystery',
    tagline: 'An overcurrent condition trips the safety breaker immediately upon switch closure.',
    symptom: 'Breaker trips with electrical sparks (Overcurrent fault I > 5A).',
    clue: 'Use the Digital Multimeter to test resistance and voltage across branches. A zero-ohm wire bypass is shorting the power supply!',
    targetObjective: 'Remove the short-circuiting wire and install a 5Ω or 15Ω resistor to regulate current below 2.5A.',
  },
  {
    id: 'puzzle-vehicle-stall',
    discipline: 'vehicles',
    title: 'The 15° Grade Stall',
    tagline: 'A delivery truck stalls out halfway up an uphill incline.',
    symptom: 'Vehicle speed drops to 0 m/s with a STALLED failure message.',
    clue: 'The grade force mg·sin(15°) exceeds the small engine thrust. Upgrade to a higher torque engine and optimize chassis mass.',
    targetObjective: 'Spec an engine-chassis combination that reaches the 100m summit at minimum 25 m/s.',
  },
];

// Puzzle 1 Level Def: Truss with incorrect cable in compression
const PUZZLE_TRUSS_LEVEL: LevelDef = {
  id: 'puzzle-truss',
  order: 1,
  name: 'Truss Diagnostic Bench',
  tagline: 'Find the incorrectly specified member.',
  hint: 'Inspect which member fails under dead-load or dynamic transit.',
  fixedNodes: [
    { id: 'left-bank', x: 0, y: 0, support: 'pin', isDeck: true },
    { id: 'deck-mid', x: 5, y: 0, support: 'none', isDeck: true },
    { id: 'right-bank', x: 10, y: 0, support: 'roller', isDeck: true },
  ],
  deckMembers: [
    { id: 'deck-l', nodeA: 'left-bank', nodeB: 'deck-mid' },
    { id: 'deck-r', nodeA: 'deck-mid', nodeB: 'right-bank' },
  ],
  loads: [{ nodeId: 'deck-mid', force: 40_000 }],
  budget: 500,
  unlockedMaterials: ['wood', 'steel', 'cable', 'strut'],
  buildArea: { minX: -1, maxX: 11, minY: -4, maxY: 4 },
  gridSize: 1,
};

// Puzzle 2 Level Def: Circuit with a short circuit wire
const PUZZLE_CIRCUIT_LEVEL: CircuitLevelDef = {
  id: 'puzzle-circuit',
  order: 2,
  name: 'Circuit Diagnostic Bench',
  tagline: 'Locate the short circuit with the multimeter.',
  hint: 'Probe nodal voltages to locate zero-resistance paths.',
  sourceVoltage: 18,
  fixedNodes: [
    { id: 'ps-pos', x: 0, y: 0, terminal: 'positive' },
    { id: 'ps-neg', x: 8, y: 0, terminal: 'negative' },
    { id: 'bulb-top', x: 4, y: -2, terminal: 'none' },
    { id: 'bulb-bot', x: 4, y: 2, terminal: 'none' },
  ],
  givenEdges: [
    { id: 'given-bulb', nodeA: 'bulb-top', nodeB: 'bulb-bot', componentId: 'bulb' },
  ],
  budget: 500,
  unlockedMaterials: ['wire', 'resistor_small', 'resistor_large'],
  buildArea: { minX: 0, maxX: 8, minY: -3, maxY: 3 },
  gridSize: 1,
};

// Puzzle 3 Level Def: Vehicle climbing steep hill
const PUZZLE_VEHICLE_LEVEL: VehicleLevelDef = {
  id: 'puzzle-vehicle',
  order: 3,
  name: 'Steep Incline Proving Ground',
  tagline: 'Solve powertrain stall under 15° grade.',
  hint: 'Slope gravity opposes engine thrust.',
  distance: 100,
  targetSpeed: 25,
  inclineDegrees: 15,
  payloadMass: 400,
  budget: 3000,
  unlockedEngines: ['small', 'large', 'turbo'],
  unlockedChassis: ['light', 'heavy'],
};

export function TroubleshootingLab() {
  const [activePuzzleId, setActivePuzzleId] = useState<string>('puzzle-truss-buckle');

  // Puzzle 1 State: Initial flawed structure with a cable in compression
  const [p1Nodes] = useState<BuiltNode[]>([
    { id: 'p1-apex', x: 5, y: -3 },
  ]);
  const [p1Members, setP1Members] = useState<BuiltMember[]>([
    { id: 'p1-m1', nodeA: 'left-bank', nodeB: 'p1-apex', materialId: 'cable' }, // Flaw: Cable in compression!
    { id: 'p1-m2', nodeA: 'p1-apex', nodeB: 'right-bank', materialId: 'cable' }, // Flaw: Cable in compression!
    { id: 'p1-m3', nodeA: 'p1-apex', nodeB: 'deck-mid', materialId: 'steel' },
  ]);
  const [p1PendingNode, setP1PendingNode] = useState<string | null>(null);
  const [p1SelectedMaterial, setP1SelectedMaterial] = useState<string>('steel');
  const [p1Simulating, setP1Simulating] = useState(false);
  const [p1Analysis, setP1Analysis] = useState<TrussAnalysis | null>(null);

  // Puzzle 2 State: Circuit with a dead-short wire
  const [p2Nodes] = useState<BuiltNode[]>([
    { id: 'p2-mid-pos', x: 2, y: 0 },
    { id: 'p2-mid-neg', x: 6, y: 0 },
  ]);
  const [p2Edges, setP2Edges] = useState<BuiltEdge[]>([
    { id: 'p2-e1', nodeA: 'ps-pos', nodeB: 'p2-mid-pos', componentId: 'wire' },
    { id: 'p2-e2', nodeA: 'p2-mid-pos', nodeB: 'bulb-top', componentId: 'wire' },
    { id: 'p2-e3', nodeA: 'bulb-bot', nodeB: 'p2-mid-neg', componentId: 'wire' },
    { id: 'p2-e4', nodeA: 'p2-mid-neg', nodeB: 'ps-neg', componentId: 'wire' },
    { id: 'p2-short', nodeA: 'p2-mid-pos', nodeB: 'p2-mid-neg', componentId: 'wire' }, // Flaw: Short circuit wire!
  ]);
  const [p2PendingNode, setP2PendingNode] = useState<string | null>(null);
  const p2SelectedComponent = 'resistor-small';
  const [p2Simulating, setP2Simulating] = useState(false);
  const [p2Analysis, setP2Analysis] = useState<CircuitAnalysis | null>(null);
  const [multimeterOpen, setMultimeterOpen] = useState(false);

  // Puzzle 3 State: Underpowered vehicle stalling
  const [p3Engine, setP3Engine] = useState<string>('small'); // Flaw: small engine on hill with 400kg payload
  const [p3Chassis, setP3Chassis] = useState<string>('heavy');
  const [p3Simulating, setP3Simulating] = useState(false);
  const [p3Result, setP3Result] = useState<VehicleAnalysis | null>(null);

  // Puzzle 1 Handlers
  const handleTestP1 = () => {
    const model = toTrussModel(PUZZLE_TRUSS_LEVEL, p1Nodes, p1Members);
    const analysis = analyzeTruss(model);
    setP1Analysis(analysis);
    setP1Simulating(true);
    if (analysis.status === 'analyzed' && !analysis.anyFailed) {
      soundFx.playVictory(3);
    }
  };

  const handleSelectP1Node = (nodeId: string) => {
    if (!p1PendingNode) {
      setP1PendingNode(nodeId);
    } else if (p1PendingNode === nodeId) {
      setP1PendingNode(null);
    } else {
      const id = `p1-m-${Date.now()}`;
      setP1Members((prev) => [
        ...prev,
        { id, nodeA: p1PendingNode, nodeB: nodeId, materialId: p1SelectedMaterial },
      ]);
      setP1PendingNode(null);
    }
  };

  // Puzzle 2 Handlers
  const handleTestP2 = () => {
    const model = toCircuitModel(PUZZLE_CIRCUIT_LEVEL, p2Nodes, p2Edges);
    const analysis = analyzeCircuit(model);
    setP2Analysis(analysis);
    setP2Simulating(true);
    if (analysis.status === 'analyzed' && !analysis.anyBurnedOut && !analysis.edges.some((e) => e.underpowered)) {
      soundFx.playVictory(3);
    }
  };

  const handleSelectP2Node = (nodeId: string) => {
    if (!p2PendingNode) {
      setP2PendingNode(nodeId);
    } else if (p2PendingNode === nodeId) {
      setP2PendingNode(null);
    } else {
      const id = `p2-e-${Date.now()}`;
      setP2Edges((prev) => [
        ...prev,
        { id, nodeA: p2PendingNode, nodeB: nodeId, componentId: p2SelectedComponent },
      ]);
      setP2PendingNode(null);
    }
  };

  // Puzzle 3 Handlers
  const handleTestP3 = () => {
    const eng = ENGINES[p3Engine];
    const ch = CHASSIS[p3Chassis];
    const res = analyzeVehicle(eng, ch, 100, 15, 400);
    setP3Result(res);
    setP3Simulating(true);
    if (!res.stalled && res.finalSpeed >= 25) {
      soundFx.playVictory(3);
    }
  };

  const activePuzzle = PUZZLES.find((p) => p.id === activePuzzleId) ?? PUZZLES[0];

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface-1 p-6 font-mono text-xs shadow-xl">
      {/* Top Banner & Puzzle Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-xl border border-amber-500/30 text-amber-400">
            🔍
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-fg tracking-wide">
                Reverse Engineering & Failure Diagnostic Lab
              </h2>
              <span className="rounded-md bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] text-amber-400 font-semibold">
                FAULTS INJECTION
              </span>
            </div>
            <p className="text-xs text-fg-muted font-sans">
              Diagnose flawed pre-built designs using the Stress Heatmap, Digital Multimeter, and Telemetry to fix structural buckling, short-circuits, and mechanical stalls.
            </p>
          </div>
        </div>

        {/* Puzzle Selector Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl bg-surface-2 p-1 border border-border">
          {PUZZLES.map((pz) => (
            <button
              key={pz.id}
              onClick={() => setActivePuzzleId(pz.id)}
              className={`rounded-lg px-3 py-1.5 font-bold text-xs transition-colors flex items-center gap-1.5 ${
                activePuzzleId === pz.id
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              <span>{pz.discipline === 'structures' ? '🌉' : pz.discipline === 'circuits' ? '⚡' : '🚗'}</span>
              <span>{pz.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Diagnostic Briefing Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-amber-500/30 bg-amber-950/15 p-4 text-xs font-sans">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 font-bold">
            Reported Failure Symptom
          </span>
          <p className="text-fg font-medium">{activePuzzle.symptom}</p>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold">
            Diagnostic Instrument Clue
          </span>
          <p className="text-fg-muted">{activePuzzle.clue}</p>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
            Repair Objective
          </span>
          <p className="text-fg-muted">{activePuzzle.targetObjective}</p>
        </div>
      </div>

      {/* PUZZLE 1: THE BUCKLING TRUSS */}
      {activePuzzleId === 'puzzle-truss-buckle' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-fg-muted">
              Click cable members to delete · Select Steel/Strut to replace them.
            </span>
            <div className="flex items-center gap-2">
              <span className="text-fg-subtle">Material:</span>
              {(['steel', 'strut', 'wood', 'cable'] as const).map((mat) => (
                <button
                  key={mat}
                  onClick={() => setP1SelectedMaterial(mat)}
                  className={`rounded px-2 py-1 text-[11px] font-bold border capitalize transition-colors ${
                    p1SelectedMaterial === mat
                      ? 'border-accent bg-accent/20 text-accent'
                      : 'border-border text-fg-muted hover:text-fg'
                  }`}
                >
                  {mat}
                </button>
              ))}
              <button
                onClick={handleTestP1}
                className="ml-3 rounded-xl bg-accent px-4 py-1.5 font-bold text-accent-fg hover:opacity-90"
              >
                Run Test Transit
              </button>
            </div>
          </div>

          <div className="h-[420px] rounded-2xl border border-border bg-surface-2/30 overflow-hidden">
            <BridgeCanvas
              level={PUZZLE_TRUSS_LEVEL}
              builtNodes={p1Nodes}
              builtMembers={p1Members}
              pendingNodeId={p1PendingNode}
              testResult={
                p1Analysis
                  ? p1Analysis.status === 'unstable'
                    ? { status: 'unstable' }
                    : {
                        status: 'analyzed',
                        members: p1Analysis.members,
                        anyFailed: p1Analysis.anyFailed,
                        passed: !p1Analysis.anyFailed,
                        cost: 250,
                        stars: p1Analysis.anyFailed ? 0 : 3,
                      }
                  : null
              }
              isSimulating={p1Simulating}
              heatmapEnabled={true}
              onSimulationFinish={() => setP1Simulating(false)}
              onResetSimulation={() => setP1Simulating(false)}
              onAddNode={() => {}}
              onSelectNode={handleSelectP1Node}
              onRemoveNode={() => {}}
              onRemoveMember={(id) => setP1Members((prev) => prev.filter((m) => m.id !== id))}
            />
          </div>

          {p1Analysis && p1Analysis.status === 'analyzed' && !p1Analysis.anyFailed && (
            <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/30 p-3 text-center text-emerald-300 font-bold">
              ✓ REPAIR VERIFIED: Buckling diagonal resolved! Structure passed transit test with zero member rupture.
            </div>
          )}
        </div>
      )}

      {/* PUZZLE 2: THE BREAKER TRIP SHORT */}
      {activePuzzleId === 'puzzle-circuit-short' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-fg-muted">
              Click the short wire to remove it · Connect resistor in series to regulate current.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMultimeterOpen((m) => !m)}
                className={`rounded-lg px-3 py-1 font-bold border transition-colors ${
                  multimeterOpen
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                    : 'border-border bg-surface-2 text-fg hover:border-amber-400'
                }`}
              >
                📟 {multimeterOpen ? 'Hide Multimeter' : 'Use Digital Multimeter'}
              </button>
              <button
                onClick={handleTestP2}
                className="rounded-xl bg-accent px-4 py-1.5 font-bold text-accent-fg hover:opacity-90"
              >
                Close Breaker & Test
              </button>
            </div>
          </div>

          <div className="relative h-[420px] rounded-2xl border border-border bg-surface-2/30 overflow-hidden">
            <CircuitCanvas
              level={PUZZLE_CIRCUIT_LEVEL}
              builtNodes={p2Nodes}
              builtEdges={p2Edges}
              pendingNodeId={p2PendingNode}
              testResult={
                p2Analysis
                  ? p2Analysis.status === 'open'
                    ? { status: 'open' }
                    : {
                        status: 'analyzed',
                        edges: p2Analysis.edges,
                        anyBurnedOut: p2Analysis.anyBurnedOut,
                        anyUnderpowered: p2Analysis.edges.some((e: { underpowered: boolean }) => e.underpowered),
                        passed: !p2Analysis.anyBurnedOut,
                        cost: 120,
                        stars: p2Analysis.anyBurnedOut ? 0 : 3,
                      }
                  : null
              }
              isSimulating={p2Simulating}
              onSimulationFinish={() => setP2Simulating(false)}
              onResetSimulation={() => setP2Simulating(false)}
              onAddNode={() => {}}
              onSelectNode={handleSelectP2Node}
              onRemoveNode={() => {}}
              onRemoveEdge={(id) => setP2Edges((prev) => prev.filter((e) => e.id !== id))}
            />

            {/* Floating Multimeter Tool */}
            {multimeterOpen && (
              <div className="absolute top-4 right-4 z-30 shadow-2xl">
                <DigitalMultimeter
                  nodes={[...PUZZLE_CIRCUIT_LEVEL.fixedNodes, ...p2Nodes]}
                  nodalVoltages={
                    p2Analysis?.status === 'analyzed'
                      ? Object.fromEntries(p2Analysis.nodeVoltages.entries())
                      : { 'ps-pos': 18, 'ps-neg': 0, 'p2-mid-pos': 18, 'p2-mid-neg': 0 }
                  }
                  isOpen={multimeterOpen}
                  onClose={() => setMultimeterOpen(false)}
                />
              </div>
            )}
          </div>

          {p2Analysis && p2Analysis.status === 'analyzed' && !p2Analysis.anyBurnedOut && !p2Analysis.edges.some((e) => e.underpowered) && (
            <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/30 p-3 text-center text-emerald-300 font-bold">
              ✓ REPAIR VERIFIED: Short circuit removed! Bulb illuminates within safe operating limits without breaker tripping.
            </div>
          )}
        </div>
      )}

      {/* PUZZLE 3: THE 15° HILLCLIMB STALL */}
      {activePuzzleId === 'puzzle-vehicle-stall' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-surface-2/40 p-4">
              <h4 className="text-xs font-bold text-fg-muted uppercase mb-2">Select Engine</h4>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(ENGINES).map((eng) => (
                  <button
                    key={eng.id}
                    onClick={() => setP3Engine(eng.id)}
                    className={`rounded-lg border p-2 text-left transition-colors ${
                      p3Engine === eng.id
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

            <div className="rounded-xl border border-border bg-surface-2/40 p-4">
              <h4 className="text-xs font-bold text-fg-muted uppercase mb-2">Select Chassis</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(CHASSIS).map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setP3Chassis(ch.id)}
                    className={`rounded-lg border p-2 text-left transition-colors ${
                      p3Chassis === ch.id
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

          <div className="flex items-center justify-between">
            <span className="text-fg-muted">
              Current Loadout: {ENGINES[p3Engine]?.name} + {CHASSIS[p3Chassis]?.name} (Grade: 15°, Payload: 400kg)
            </span>
            <button
              onClick={handleTestP3}
              className="rounded-xl bg-accent px-5 py-2 font-bold text-accent-fg hover:opacity-90"
            >
              Test Hillclimb Launch
            </button>
          </div>

          <VehicleTrackCanvas
            level={PUZZLE_VEHICLE_LEVEL}
            selectedEngineId={p3Engine}
            selectedChassisId={p3Chassis}
            testResult={
              p3Result
                ? {
                    analysis: {
                      effectiveForce: p3Result.effectiveForce,
                      tractionLimit: p3Result.tractionLimit,
                      tractionLimited: p3Result.tractionLimited,
                      acceleration: p3Result.acceleration,
                      finalSpeed: p3Result.finalSpeed,
                      stalled: p3Result.stalled,
                      slipRatio: 0.1,
                    },
                    passed: !p3Result.stalled && p3Result.finalSpeed >= 25,
                    stars: p3Result.stalled ? 0 : 3,
                    cost: 1500,
                  }
                : null
            }
            isSimulating={p3Simulating}
            onSimulationFinish={() => setP3Simulating(false)}
            onResetSimulation={() => setP3Simulating(false)}
          />

          {p3Result && !p3Result.stalled && p3Result.finalSpeed >= 25 && (
            <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/30 p-3 text-center text-emerald-300 font-bold">
              ✓ REPAIR VERIFIED: Powertrain successfully scaled the 15° hill at {p3Result.finalSpeed.toFixed(1)} m/s without stalling!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
