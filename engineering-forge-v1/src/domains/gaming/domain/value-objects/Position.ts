/**
 * Position Value Object
 * Represents a 2D position with x and y coordinates
 *
 * This value object is immutable and provides utility methods
 * for common position operations in the gaming domain.
 */
export class PositionVO {
  constructor(public readonly x: number, public readonly y: number) {
    // Allow negative coordinates for drag operations and relative positioning
    // Only validate for NaN and Infinity
    if (!isFinite(x) || !isFinite(y)) {
      throw new Error("Position coordinates must be finite numbers");
    }
  }

  /**
   * Check if this position equals another position
   */
  equals(other: PositionVO): boolean {
    return this.x === other.x && this.y === other.y;
  }

  /**
   * Calculate distance to another position
   */
  distanceTo(other: PositionVO): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Move position by delta values
   */
  move(dx: number, dy: number): PositionVO {
    return new PositionVO(this.x + dx, this.y + dy);
  }

  /**
   * Add another position to this position
   */
  add(other: PositionVO): PositionVO {
    return new PositionVO(this.x + other.x, this.y + other.y);
  }

  /**
   * Subtract another position from this position
   */
  subtract(other: PositionVO): PositionVO {
    return new PositionVO(this.x - other.x, this.y - other.y);
  }

  /**
   * Multiply position by a scalar value
   */
  multiply(scalar: number): PositionVO {
    return new PositionVO(this.x * scalar, this.y * scalar);
  }

  /**
   * Divide position by a scalar value
   */
  divide(scalar: number): PositionVO {
    if (scalar === 0) {
      throw new Error("Cannot divide position by zero");
    }
    return new PositionVO(this.x / scalar, this.y / scalar);
  }

  /**
   * Get the magnitude (length) of the position vector
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Normalize the position to unit length
   */
  normalize(): PositionVO {
    const mag = this.magnitude();
    if (mag === 0) {
      return new PositionVO(0, 0);
    }
    return new PositionVO(this.x / mag, this.y / mag);
  }

  /**
   * Create a copy of this position
   */
  clone(): PositionVO {
    return new PositionVO(this.x, this.y);
  }

  /**
   * Snap position to grid
   */
  snapToGrid(gridSize: number): PositionVO {
    const snappedX = Math.round(this.x / gridSize) * gridSize;
    const snappedY = Math.round(this.y / gridSize) * gridSize;
    return new PositionVO(snappedX, snappedY);
  }

  /**
   * Check if position is within bounds
   */
  isWithinBounds(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
  ): boolean {
    return this.x >= minX && this.x <= maxX && this.y >= minY && this.y <= maxY;
  }

  /**
   * Clamp position to bounds
   */
  clamp(minX: number, minY: number, maxX: number, maxY: number): PositionVO {
    const clampedX = Math.max(minX, Math.min(maxX, this.x));
    const clampedY = Math.max(minY, Math.min(maxY, this.y));
    return new PositionVO(clampedX, clampedY);
  }

  /**
   * Linear interpolation between this position and another
   */
  lerp(other: PositionVO, t: number): PositionVO {
    const clampedT = Math.max(0, Math.min(1, t));
    return new PositionVO(
      this.x + (other.x - this.x) * clampedT,
      this.y + (other.y - this.y) * clampedT
    );
  }

  /**
   * Get string representation
   */
  toString(): string {
    return `PositionVO(${this.x}, ${this.y})`;
  }

  /**
   * Create position from object
   */
  static fromObject(obj: { x: number; y: number }): PositionVO {
    return new PositionVO(obj.x, obj.y);
  }

  /**
   * Create zero position
   */
  static zero(): PositionVO {
    return new PositionVO(0, 0);
  }

  /**
   * Create position from polar coordinates
   */
  static fromPolar(radius: number, angle: number): PositionVO {
    return new PositionVO(radius * Math.cos(angle), radius * Math.sin(angle));
  }
}
