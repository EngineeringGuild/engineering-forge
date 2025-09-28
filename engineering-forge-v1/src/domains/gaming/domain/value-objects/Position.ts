export interface Position {
  x: number;
  y: number;
}

export class PositionVO {
  constructor(
    public readonly x: number,
    public readonly y: number
  ) {
    if (x < 0 || y < 0) {
      throw new Error('Position coordinates must be non-negative');
    }
  }

  equals(other: PositionVO): boolean {
    return this.x === other.x && this.y === other.y;
  }

  distanceTo(other: PositionVO): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  move(dx: number, dy: number): PositionVO {
    return new PositionVO(this.x + dx, this.y + dy);
  }

  toString(): string {
    return `(${this.x}, ${this.y})`;
  }
}
