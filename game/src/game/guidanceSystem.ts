import type { LevelDef } from '../content/types';
import type { CircuitLevelDef } from '../content/circuitTypes';
import type { VehicleLevelDef } from '../content/vehicleTypes';
import type { BuiltNode, BuiltMember } from './build';
import type { BuiltEdge } from './circuitBuild';
import type { TestResult } from '../state/gameStore';
import type { CircuitTestResult } from '../state/circuitStore';
import type { VehicleTestResult } from '../state/vehicleStore';

export interface ContextualGuidance {
  /** Short punchy headline, e.g. "Structural Instability Detected" */
  headline: string;
  /** Direct engineering guidance explaining the physics and next step */
  advice: string;
  /** Categorized severity */
  severity: 'info' | 'warning' | 'tip';
  /** Highlighted domain */
  domain: 'structural' | 'electrical' | 'mechanical';
}

/**
 * Evaluates the current state of a Bridge / Structure level and returns specific engineering guidance.
 */
export function getStructuralGuidance(
  level: LevelDef,
  _builtNodes: BuiltNode[],
  builtMembers: BuiltMember[],
  cost: number,
  testResult: TestResult | null,
): ContextualGuidance {
  const totalMembers = builtMembers.length;

  // Case 1: No or minimal player members added
  if (totalMembers === 0) {
    return {
      headline: 'Begin With Triangulation',
      advice: `The roadway deck is unsupported across the gap. Place joints within the build area (${level.buildArea.minY}m to ${level.buildArea.maxY}m elevation) and connect them to form rigid triangular trusses between supports and road nodes.`,
      severity: 'tip',
      domain: 'structural',
    };
  }

  // Case 2: Unstable mechanism reported
  if (testResult?.status === 'unstable') {
    return {
      headline: 'Kinematic Mechanism (Unstable)',
      advice:
        'The current assembly can deform without stretching any members. In truss mechanics, every interior joint must be pinned by at least two non-collinear members forming closed triangles (2j - 3 rule). Add diagonal bracing to eliminate rectangular sway.',
      severity: 'warning',
      domain: 'structural',
    };
  }

  // Case 3: Over budget
  if (cost > level.budget) {
    const diff = (cost - level.budget).toFixed(0);
    return {
      headline: `Over Budget by $${diff}`,
      advice: `Your current layout costs $${cost.toFixed(0)} against a $${level.budget} limit. Substitute expensive steel with wood on lightly loaded members, or remove redundant members that have low stress.`,
      severity: 'info',
      domain: 'structural',
    };
  }

  // Case 4: Member overload / buckling / failure
  if (testResult?.status === 'analyzed' && testResult.anyFailed) {
    const slackCable = testResult.members.find((m) => m.wentSlack);
    if (slackCable) {
      return {
        headline: 'Cable in Compression (Went Slack)',
        advice:
          'Cables possess tensile capacity but zero compressive stiffness. Under the applied vehicle loads, this member went into compression and slackened. Switch it to rigid wood/steel, or rearrange the web geometry so it stays in tension.',
        severity: 'warning',
        domain: 'structural',
      };
    }

    const buckled = testResult.members.find((m) => m.isBuckled);
    if (buckled) {
      return {
        headline: 'Euler Column Buckling Instability',
        advice:
          'A slender compression member exceeded its Euler critical load (P_cr = π²EI / L²). Either subdivide the span with an intermediate joint to halve the effective length L, or swap to steel with higher modulus.',
        severity: 'warning',
        domain: 'structural',
      };
    }

    const pulledApart = testResult.members.find((m) => m.pulledApart);
    if (pulledApart) {
      return {
        headline: 'Strut in Tension (Pulled Apart)',
        advice:
          'Struts rest in compressive bearing and cannot carry tension. This member is being pulled outward by the load. Switch it to wood or steel capable of tensile anchoring.',
        severity: 'warning',
        domain: 'structural',
      };
    }

    // Generic stress overload
    return {
      headline: 'Material Yield / Stress Exceeded',
      advice:
        'One or more members exceeded allowable tensile/compressive strength. Reinforce high-stress load paths with steel, or add load-distributing truss diagonals to share the reaction forces.',
      severity: 'warning',
      domain: 'structural',
    };
  }

  // Case 5: Default guidance based on level hint and load geometry
  return {
    headline: 'Engineering Recommendation',
    advice: level.hint,
    severity: 'info',
    domain: 'structural',
  };
}

/**
 * Evaluates the current state of a DC Circuit level and returns specific electrical guidance.
 */
export function getElectricalGuidance(
  level: CircuitLevelDef,
  _builtNodes: BuiltNode[],
  builtEdges: BuiltEdge[],
  cost: number,
  testResult: CircuitTestResult | null,
): ContextualGuidance {
  const totalEdges = builtEdges.length;

  // Case 1: No connections built yet
  if (totalEdges === 0) {
    return {
      headline: 'Form a Complete Galvanic Loop',
      advice: `To drive current from the ${level.sourceVoltage}V supply, route conductors from the positive (+) terminal through the designated load and return back to the negative (−) terminal.`,
      severity: 'tip',
      domain: 'electrical',
    };
  }

  // Case 2: Open circuit detected
  if (testResult?.status === 'open') {
    return {
      headline: 'Open Circuit Detected',
      advice:
        'The conductance matrix is singular — charge cannot circulate because there is no closed loop connecting the battery source (+) and return (−) through the load. Inspect joints to confirm wires touch both terminals.',
      severity: 'warning',
      domain: 'electrical',
    };
  }

  // Case 3: Over budget
  if (cost > level.budget) {
    const diff = (cost - level.budget).toFixed(0);
    return {
      headline: `Wiring Over Budget by $${diff}`,
      advice: `Current wiring cost is $${cost.toFixed(0)} exceeding the $${level.budget} threshold. Reroute connections with shorter paths or eliminate unnecessary intermediary joints to save cost.`,
      severity: 'info',
      domain: 'electrical',
    };
  }

  // Case 4: Burned out component
  if (testResult?.status === 'analyzed' && testResult.anyBurnedOut) {
    return {
      headline: 'Overcurrent: Thermal Burnout',
      advice:
        'Dissipated power (P = I²R) exceeded rated component dissipation. Add series resistance to limit current flow (Ohm’s law I = V/R), protecting the delicate elements.',
      severity: 'warning',
      domain: 'electrical',
    };
  }

  // Case 5: Underpowered bulb / load
  if (testResult?.status === 'analyzed' && testResult.anyUnderpowered) {
    return {
      headline: 'Insufficient Voltage / Power',
      advice:
        'The load is receiving insufficient operating voltage due to excessive series resistance. Reduce series resistors or connect branches in parallel to elevate terminal potential.',
      severity: 'warning',
      domain: 'electrical',
    };
  }

  // Case 6: Default guidance
  return {
    headline: 'Circuit Design Hint',
    advice: level.hint,
    severity: 'info',
    domain: 'electrical',
  };
}

/**
 * Evaluates the current state of a Vehicle Dynamics level and returns specific guidance.
 */
export function getVehicleGuidance(
  level: VehicleLevelDef,
  _selectedEngineId: string,
  _selectedChassisId: string,
  cost: number,
  testResult: VehicleTestResult | null,
): ContextualGuidance {
  // Case 1: Stalled on grade
  if (testResult?.analysis.stalled) {
    return {
      headline: 'Grade Resistance Exceeds Traction/Torque',
      advice: `Gravity force along the ${level.inclineDegrees || 0}° incline (F_g = m·g·sinθ) overwhelmed available wheel force. Select a higher-torque powertrain or choose a lighter chassis to reduce downward slope drag.`,
      severity: 'warning',
      domain: 'mechanical',
    };
  }

  // Case 2: Traction limited (wheel slip)
  if (testResult?.analysis.tractionLimited) {
    return {
      headline: 'Tire Slip (Traction Limited)',
      advice:
        'Engine drive force exceeded normal road friction (F_drive > μ·F_normal). Upgrading engine power will not increase acceleration. Consider a slightly heavier chassis or downforce to increase tire normal force.',
      severity: 'tip',
      domain: 'mechanical',
    };
  }

  // Case 3: Too slow
  if (testResult && testResult.analysis.finalSpeed < level.targetSpeed) {
    const shortfall = (level.targetSpeed - testResult.analysis.finalSpeed).toFixed(1);
    return {
      headline: `Speed Deficit of ${shortfall} m/s`,
      advice: `Vehicle reached ${testResult.analysis.finalSpeed.toFixed(1)} m/s, short of target ${level.targetSpeed} m/s. Fit a higher-power engine or shed chassis mass to increase power-to-weight ratio (P/m).`,
      severity: 'info',
      domain: 'mechanical',
    };
  }

  // Case 4: Over budget
  if (cost > level.budget) {
    return {
      headline: 'Vehicle Exceeds Budget',
      advice: `Assembly costs $${cost} vs budget of $${level.budget}. Downscale either chassis or engine to an efficient tier that still clears the speed threshold.`,
      severity: 'info',
      domain: 'mechanical',
    };
  }

  // Case 5: Default guidance
  return {
    headline: 'Powertrain Calibration',
    advice: level.hint,
    severity: 'info',
    domain: 'mechanical',
  };
}
