import { describe, it, expect } from 'vitest';
import {
  createEditorHistory,
  pushHistorySnapshot,
  undoHistory,
  redoHistory,
} from './editorHistory';

describe('editorHistory', () => {
  it('initializes with empty past and future stacks', () => {
    const history = createEditorHistory<number>();
    expect(history.past).toEqual([]);
    expect(history.future).toEqual([]);
  });

  it('pushes snapshots and clears redo future on new branch', () => {
    let history = createEditorHistory<string>();
    history = pushHistorySnapshot(history, 'state-1');
    history = pushHistorySnapshot(history, 'state-2');
    expect(history.past).toEqual(['state-1', 'state-2']);
    expect(history.future).toEqual([]);
  });

  it('performs undo and redo cycles correctly', () => {
    let history = createEditorHistory<number>();
    let current = 0;

    // Change 1: 0 -> 10
    history = pushHistorySnapshot(history, current);
    current = 10;

    // Change 2: 10 -> 20
    history = pushHistorySnapshot(history, current);
    current = 20;

    // Undo from 20 -> should get 10
    const undoRes1 = undoHistory(history, current);
    expect(undoRes1).not.toBeNull();
    if (!undoRes1) return;
    history = undoRes1.history;
    current = undoRes1.previousState;
    expect(current).toBe(10);
    expect(history.future).toEqual([20]);

    // Undo from 10 -> should get 0
    const undoRes2 = undoHistory(history, current);
    expect(undoRes2).not.toBeNull();
    if (!undoRes2) return;
    history = undoRes2.history;
    current = undoRes2.previousState;
    expect(current).toBe(0);
    expect(history.future).toEqual([10, 20]);

    // Can't undo further
    expect(undoHistory(history, current)).toBeNull();

    // Redo from 0 -> should get 10
    const redoRes1 = redoHistory(history, current);
    expect(redoRes1).not.toBeNull();
    if (!redoRes1) return;
    history = redoRes1.history;
    current = redoRes1.nextState;
    expect(current).toBe(10);
    expect(history.future).toEqual([20]);

    // Redo from 10 -> should get 20
    const redoRes2 = redoHistory(history, current);
    expect(redoRes2).not.toBeNull();
    if (!redoRes2) return;
    history = redoRes2.history;
    current = redoRes2.nextState;
    expect(current).toBe(20);
    expect(history.future).toEqual([]);

    // Can't redo further
    expect(redoHistory(history, current)).toBeNull();
  });

  it('respects maximum history depth and discards oldest entries', () => {
    let history = createEditorHistory<number>();
    const maxDepth = 3;

    history = pushHistorySnapshot(history, 1, maxDepth);
    history = pushHistorySnapshot(history, 2, maxDepth);
    history = pushHistorySnapshot(history, 3, maxDepth);
    history = pushHistorySnapshot(history, 4, maxDepth);

    expect(history.past).toEqual([2, 3, 4]); // 1 was pruned
  });

  it('clears redo stack when user performs a new edit after undoing', () => {
    let history = createEditorHistory<string>();
    let current = 'A';

    history = pushHistorySnapshot(history, current);
    current = 'B';

    // Undo back to A
    const undoRes = undoHistory(history, current)!;
    history = undoRes.history;
    current = undoRes.previousState; // 'A'
    expect(history.future).toEqual(['B']);

    // Branch: new edit from 'A' to 'C'
    history = pushHistorySnapshot(history, current);
    current = 'C';

    expect(history.future).toEqual([]); // 'B' was discarded due to branching
    expect(history.past).toEqual(['A']);
  });
});
