/**
 * Minimal dense linear algebra needed by the truss solver: solve a symmetric
 * system Ax = b via Gaussian elimination with partial pivoting. No external
 * dependency — truss systems in this game stay small (tens of DOFs).
 */

export function solveLinearSystem(aInput: number[][], bInput: number[]): number[] | null {
  const n = bInput.length;
  const a = aInput.map((row) => row.slice());
  const b = bInput.slice();

  for (let col = 0; col < n; col++) {
    // Partial pivot: find the largest absolute value in this column at/below the diagonal.
    let pivotRow = col;
    let pivotValue = Math.abs(a[col][col]);
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(a[row][col]) > pivotValue) {
        pivotValue = Math.abs(a[row][col]);
        pivotRow = row;
      }
    }

    // A near-zero pivot means the matrix is singular — the structure has an
    // unconstrained mechanism and cannot carry any load in that direction.
    if (pivotValue < 1e-9) {
      return null;
    }

    if (pivotRow !== col) {
      [a[col], a[pivotRow]] = [a[pivotRow], a[col]];
      [b[col], b[pivotRow]] = [b[pivotRow], b[col]];
    }

    for (let row = col + 1; row < n; row++) {
      const factor = a[row][col] / a[col][col];
      if (factor === 0) continue;
      for (let k = col; k < n; k++) {
        a[row][k] -= factor * a[col][k];
      }
      b[row] -= factor * b[col];
    }
  }

  const x = new Array<number>(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let sum = b[row];
    for (let col = row + 1; col < n; col++) {
      sum -= a[row][col] * x[col];
    }
    x[row] = sum / a[row][row];
  }
  return x;
}
