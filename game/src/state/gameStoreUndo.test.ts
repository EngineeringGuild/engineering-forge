import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';
import { useCircuitStore } from './circuitStore';

describe('useGameStore undo/redo stack', () => {
  beforeEach(() => {
    useGameStore.getState().startLevel('tutorial');
  });

  it('records added nodes in undo stack and undoes them correctly', () => {
    const store = useGameStore.getState();
    expect(store.canUndo()).toBe(false);
    expect(store.canRedo()).toBe(false);

    // Place node 1
    useGameStore.getState().addNode(1, 2);
    expect(useGameStore.getState().builtNodes.length).toBe(1);
    expect(useGameStore.getState().canUndo()).toBe(true);
    expect(useGameStore.getState().canRedo()).toBe(false);

    // Place node 2
    useGameStore.getState().addNode(3, 4);
    expect(useGameStore.getState().builtNodes.length).toBe(2);

    // Undo once
    const undoSuccess1 = useGameStore.getState().undo();
    expect(undoSuccess1).toBe(true);
    expect(useGameStore.getState().builtNodes.length).toBe(1);
    expect(useGameStore.getState().canRedo()).toBe(true);

    // Undo again (back to empty)
    const undoSuccess2 = useGameStore.getState().undo();
    expect(undoSuccess2).toBe(true);
    expect(useGameStore.getState().builtNodes.length).toBe(0);
    expect(useGameStore.getState().canUndo()).toBe(false);

    // Redo once
    const redoSuccess1 = useGameStore.getState().redo();
    expect(redoSuccess1).toBe(true);
    expect(useGameStore.getState().builtNodes.length).toBe(1);
    expect(useGameStore.getState().builtNodes[0].x).toBe(1);

    // Redo second node
    const redoSuccess2 = useGameStore.getState().redo();
    expect(redoSuccess2).toBe(true);
    expect(useGameStore.getState().builtNodes.length).toBe(2);
    expect(useGameStore.getState().canRedo()).toBe(false);
  });

  it('supports undoing member additions and deletions', () => {
    useGameStore.getState().addNode(0, 0); // n0
    useGameStore.getState().addNode(4, 0); // n1
    useGameStore.getState().addMember('n0', 'n1');

    expect(useGameStore.getState().builtMembers.length).toBe(1);

    // Undo member addition
    useGameStore.getState().undo();
    expect(useGameStore.getState().builtMembers.length).toBe(0);
    expect(useGameStore.getState().builtNodes.length).toBe(2);

    // Redo member addition
    useGameStore.getState().redo();
    expect(useGameStore.getState().builtMembers.length).toBe(1);
  });

  it('allows undoing a full resetBuild', () => {
    useGameStore.getState().addNode(2, 2);
    useGameStore.getState().addNode(4, 2);
    expect(useGameStore.getState().builtNodes.length).toBe(2);

    useGameStore.getState().resetBuild();
    expect(useGameStore.getState().builtNodes.length).toBe(0);

    // Undo the accidental reset
    useGameStore.getState().undo();
    expect(useGameStore.getState().builtNodes.length).toBe(2);
  });
});

describe('useCircuitStore undo/redo stack', () => {
  beforeEach(() => {
    useCircuitStore.getState().startLevel('tutorial');
  });

  it('records added nodes and edges in circuit undo stack', () => {
    useCircuitStore.getState().addNode(1, 1);
    useCircuitStore.getState().addNode(3, 1);
    useCircuitStore.getState().addEdge('n0', 'n1');

    expect(useCircuitStore.getState().builtEdges.length).toBe(1);

    useCircuitStore.getState().undo();
    expect(useCircuitStore.getState().builtEdges.length).toBe(0);
    expect(useCircuitStore.getState().builtNodes.length).toBe(2);

    useCircuitStore.getState().redo();
    expect(useCircuitStore.getState().builtEdges.length).toBe(1);
  });
});
