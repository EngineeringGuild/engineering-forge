/**
 * Generic undo/redo history manager for engineering editor states.
 * Provides immutable state snapshotting, history branching, and bounded depth.
 */

export interface EditorSnapshot<T> {
  state: T;
  timestamp: number;
}

export interface EditorHistory<T> {
  past: T[];
  future: T[];
}

export const DEFAULT_MAX_HISTORY_DEPTH = 40;

/**
 * Creates an empty editor history state.
 */
export function createEditorHistory<T>(): EditorHistory<T> {
  return {
    past: [],
    future: [],
  };
}

/**
 * Records a new snapshot before an edit occurs.
 * Clears any redo (future) stack because new actions branch history.
 */
export function pushHistorySnapshot<T>(
  history: EditorHistory<T>,
  currentState: T,
  maxDepth: number = DEFAULT_MAX_HISTORY_DEPTH,
): EditorHistory<T> {
  const newPast = [...history.past, currentState];
  if (newPast.length > maxDepth) {
    newPast.shift(); // Evict oldest entry
  }
  return {
    past: newPast,
    future: [],
  };
}

/**
 * Reverts to the most recent snapshot in past.
 * Pushes the current state onto future for redo capability.
 */
export function undoHistory<T>(
  history: EditorHistory<T>,
  currentState: T,
): { history: EditorHistory<T>; previousState: T } | null {
  if (history.past.length === 0) {
    return null;
  }

  const previousState = history.past[history.past.length - 1];
  const newPast = history.past.slice(0, -1);
  const newFuture = [currentState, ...history.future];

  return {
    history: {
      past: newPast,
      future: newFuture,
    },
    previousState,
  };
}

/**
 * Advances to the most recent undone state in future.
 * Pushes the current state onto past for undo capability.
 */
export function redoHistory<T>(
  history: EditorHistory<T>,
  currentState: T,
  maxDepth: number = DEFAULT_MAX_HISTORY_DEPTH,
): { history: EditorHistory<T>; nextState: T } | null {
  if (history.future.length === 0) {
    return null;
  }

  const nextState = history.future[0];
  const newFuture = history.future.slice(1);
  const newPast = [...history.past, currentState];
  if (newPast.length > maxDepth) {
    newPast.shift();
  }

  return {
    history: {
      past: newPast,
      future: newFuture,
    },
    nextState,
  };
}
