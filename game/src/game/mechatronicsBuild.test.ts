import { describe, it, expect, beforeEach } from 'vitest';
import { MECHATRONICS_LEVELS, WINCHES } from '../content/mechatronicsLevels';
import { useMechatronicsStore } from '../state/mechatronicsStore';
import { stepMechatronicSimulation, evaluateLogicNetwork } from '../physics/mechatronics';

describe('Mechatronics Integration & Progression Store', () => {
  beforeEach(() => {
    useMechatronicsStore.setState({
      currentLevelId: 'mechatronics-1',
      selectedWinchId: 'winch-heavy',
      counterweightAdjustmentKg: 0,
      limitCutoffAngleDeg: 48,
      voltageSupplyV: 24,
      isSimulating: false,
      progress: {},
    });
  });

  it('initializes level 1 correctly and allows unlocking sequentially', () => {
    const store = useMechatronicsStore.getState();
    expect(store.isLevelUnlocked('mechatronics-1')).toBe(true);
    // Level 2 should initially be locked until Level 1 has stars
    expect(store.isLevelUnlocked('mechatronics-2')).toBe(false);

    // Simulate completion of Level 1
    useMechatronicsStore.setState({
      progress: {
        'mechatronics-1': {
          stars: 3,
          bestTimeSeconds: 4.2,
          completedAt: new Date().toISOString(),
        },
      },
    });

    expect(useMechatronicsStore.getState().isLevelUnlocked('mechatronics-2')).toBe(true);
  });

  it('evaluates Level 1 bascule drawbridge physics to clear the 45 degree target', () => {
    const lvl = MECHATRONICS_LEVELS[0];
    const winch = WINCHES['winch-heavy'];

    let angle = 0;
    let omega = 0;
    const dt = 0.1;
    let reachedTarget = false;

    for (let step = 0; step < 160; step++) {
      const state = stepMechatronicSimulation(
        lvl.deck,
        winch,
        angle,
        omega,
        24, // 24V supply
        true, // relay active
        48, // cutoff at 48 deg
        dt,
      );

      angle = state.bridgeAngleDeg;
      omega = state.angularVelocityRadPerSec;

      expect(state.isCableSnapped).toBe(false);
      expect(state.winchTensionKn).toBeLessThanOrEqual(lvl.maxAllowableTensionKn);

      if (state.isTargetAngleReached) {
        reachedTarget = true;
        break;
      }
    }

    expect(reachedTarget).toBe(true);
    expect(angle).toBeGreaterThanOrEqual(lvl.targetClearanceAngleDeg);
  });

  it('evaluates Level 3 fail-safe interlock logic truth conditions', () => {
    const lvl = MECHATRONICS_LEVELS[2];
    expect(lvl.requiredLogicInterlock).toBeDefined();

    const logicGates = [
      { id: 'g_not', type: 'NOT' as const, inputA: 'estop_pressed', output: 'estop_ok' },
      { id: 'g_and1', type: 'AND' as const, inputA: 'deck_locked', inputB: 'ship_cleared', output: 'clear_ok' },
      { id: 'g_and2', type: 'AND' as const, inputA: 'clear_ok', inputB: 'estop_ok', output: 'traffic_gate_enable' },
    ];

    // Safe state: deck locked, ship cleared, no estop -> Gate enabled (TRUE)
    const safeResult = evaluateLogicNetwork(logicGates, {
      deck_locked: true,
      ship_cleared: true,
      estop_pressed: false,
    });
    expect(safeResult.traffic_gate_enable).toBe(true);

    // Hazard state: E-stop pressed -> Gate must be disabled (FALSE)
    const estopResult = evaluateLogicNetwork(logicGates, {
      deck_locked: true,
      ship_cleared: true,
      estop_pressed: true,
    });
    expect(estopResult.traffic_gate_enable).toBe(false);

    // Hazard state: Ship under bridge (ship_cleared = false) -> Gate must be disabled (FALSE)
    const shipResult = evaluateLogicNetwork(logicGates, {
      deck_locked: true,
      ship_cleared: false,
      estop_pressed: false,
    });
    expect(shipResult.traffic_gate_enable).toBe(false);
  });
});
