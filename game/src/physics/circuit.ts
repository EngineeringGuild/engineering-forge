import { solveLinearSystem } from './linalg';
import { COMPONENTS } from './components';

export type Terminal = 'positive' | 'negative' | 'none';

export interface CircuitNode {
  id: string;
  x: number;
  y: number;
  terminal: Terminal;
}

export interface CircuitEdge {
  id: string;
  nodeA: string;
  nodeB: string;
  componentId: string;
}

export interface CircuitModel {
  nodes: CircuitNode[];
  edges: CircuitEdge[];
  /** Voltage of the positive terminal; the negative terminal is ground (0V). */
  sourceVoltage: number;
}

export interface EdgeResult {
  edgeId: string;
  /** Current from nodeA to nodeB, Amps. Sign indicates direction. */
  current: number;
  /** Power dissipated, Watts — always non-negative. */
  power: number;
  maxPower: number;
  burnedOut: boolean;
  /** Only meaningful for load components (e.g. a bulb). */
  underpowered: boolean;
}

export type CircuitAnalysis =
  | { status: 'open' }
  | { status: 'analyzed'; edges: EdgeResult[]; anyBurnedOut: boolean };

/**
 * Solves a resistive DC network via nodal analysis: assembles the conductance
 * matrix (a weighted graph Laplacian — the same mathematical structure as the
 * truss stiffness matrix in physics/truss.ts, with one DOF per node instead
 * of two), fixes the two battery terminals to known voltages, and solves for
 * every other node's voltage under Kirchhoff's Current Law. A singular
 * reduced system means some part of the circuit has no path to a terminal —
 * an open circuit, reported before any current/power is computed.
 */
export function analyzeCircuit(model: CircuitModel): CircuitAnalysis {
  const { nodes, edges, sourceVoltage } = model;
  const index = new Map(nodes.map((n, i) => [n.id, i]));
  const n = nodes.length;

  const knownVoltage = new Array<number | null>(n).fill(null);
  nodes.forEach((node, i) => {
    if (node.terminal === 'positive') knownVoltage[i] = sourceVoltage;
    else if (node.terminal === 'negative') knownVoltage[i] = 0;
  });

  const G = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (const edge of edges) {
    const a = index.get(edge.nodeA)!;
    const b = index.get(edge.nodeB)!;
    const g = 1 / COMPONENTS[edge.componentId].resistance;
    G[a][a] += g;
    G[b][b] += g;
    G[a][b] -= g;
    G[b][a] -= g;
  }

  const freeIdx: number[] = [];
  for (let i = 0; i < n; i++) if (knownVoltage[i] === null) freeIdx.push(i);

  const V = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) if (knownVoltage[i] !== null) V[i] = knownVoltage[i]!;

  if (freeIdx.length > 0) {
    const Gff = freeIdx.map((r) => freeIdx.map((c) => G[r][c]));
    const bf = freeIdx.map((r) => {
      let sum = 0;
      for (let c = 0; c < n; c++) {
        if (knownVoltage[c] !== null) sum -= G[r][c] * knownVoltage[c]!;
      }
      return sum;
    });

    const Vf = solveLinearSystem(Gff, bf);
    if (Vf === null) {
      return { status: 'open' };
    }
    freeIdx.forEach((globalIdx, i) => {
      V[globalIdx] = Vf[i];
    });
  }

  const results: EdgeResult[] = edges.map((edge) => {
    const a = index.get(edge.nodeA)!;
    const b = index.get(edge.nodeB)!;
    const component = COMPONENTS[edge.componentId];
    const current = (V[a] - V[b]) / component.resistance;
    const power = current * current * component.resistance;
    return {
      edgeId: edge.id,
      current,
      power,
      maxPower: component.maxPower,
      burnedOut: power > component.maxPower,
      underpowered: component.minPower !== undefined && power < component.minPower,
    };
  });

  return {
    status: 'analyzed',
    edges: results,
    anyBurnedOut: results.some((r) => r.burnedOut),
  };
}
