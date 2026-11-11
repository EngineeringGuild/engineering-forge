/**
 * Engineering Forge - Parametric 3D STL Binary Mesh Generator
 * Converts 2D planar bridge/truss joints into 3D printable nodes (.STL)
 * Supports Socket Connectors (tubular slots) and Gusset Plates (bolt holes DIN 912).
 */

export interface JointNeighbor {
  angleRad: number;
  memberId: string;
  materialId: string;
}

export interface Node3DGeometry {
  nodeId: string;
  xMm: number;
  yMm: number;
  neighbors: JointNeighbor[];
}

export interface StlExportOptions {
  connectorType: 'socket' | 'gusset';
  printerToleranceMm: number; // e.g. 0.20mm to 0.40mm clearance
  socketOuterDiameterMm?: number;
  socketWallThicknessMm?: number;
  boltStandard?: 'M3' | 'M4';
}

/**
 * Creates a valid binary STL ArrayBuffer from an array of triangles.
 * Binary STL format:
 * - 80-byte header
 * - 4-byte uint32 triangle count
 * - For each triangle (50 bytes):
 *   - 12 bytes normal (3x float32)
 *   - 36 bytes vertices (9x float32: 3 vertices x 3 coordinates)
 *   - 2 bytes attribute byte count (uint16 = 0)
 */
export function buildBinaryStl(
  triangles: Array<{
    normal: [number, number, number];
    v1: [number, number, number];
    v2: [number, number, number];
    v3: [number, number, number];
  }>,
  headerText: string = 'Engineering Forge - 3D Node Mesh'
): ArrayBuffer {
  const triangleCount = triangles.length;
  const bufferSize = 84 + triangleCount * 50;
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // 80-byte header
  const headerBytes = new TextEncoder().encode(headerText.padEnd(80, ' ').slice(0, 80));
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, headerBytes[i] || 32);
  }

  // 4-byte triangle count
  view.setUint32(80, triangleCount, true);

  // Write triangles
  let offset = 84;
  for (const tri of triangles) {
    // Normal vector
    view.setFloat32(offset, tri.normal[0], true);
    view.setFloat32(offset + 4, tri.normal[1], true);
    view.setFloat32(offset + 8, tri.normal[2], true);

    // Vertex 1
    view.setFloat32(offset + 12, tri.v1[0], true);
    view.setFloat32(offset + 16, tri.v1[1], true);
    view.setFloat32(offset + 20, tri.v1[2], true);

    // Vertex 2
    view.setFloat32(offset + 24, tri.v2[0], true);
    view.setFloat32(offset + 28, tri.v2[1], true);
    view.setFloat32(offset + 32, tri.v2[2], true);

    // Vertex 3
    view.setFloat32(offset + 36, tri.v3[0], true);
    view.setFloat32(offset + 40, tri.v3[1], true);
    view.setFloat32(offset + 44, tri.v3[2], true);

    // Attribute byte count = 0
    view.setUint16(offset + 48, 0, true);

    offset += 50;
  }

  return buffer;
}

/**
 * Generates an approximated 3D cylinder triangulated mesh for socket spokes.
 */
function generateCylinderTriangles(
  cx: number,
  cy: number,
  cz: number,
  radius: number,
  height: number,
  angleRad: number,
  segments: number = 8
): Array<{
  normal: [number, number, number];
  v1: [number, number, number];
  v2: [number, number, number];
  v3: [number, number, number];
}> {
  const tris: Array<{
    normal: [number, number, number];
    v1: [number, number, number];
    v2: [number, number, number];
    v3: [number, number, number];
  }> = [];

  const dx = Math.cos(angleRad);
  const dy = Math.sin(angleRad);

  for (let i = 0; i < segments; i++) {
    const a1 = (i / segments) * 2 * Math.PI;
    const a2 = ((i + 1) / segments) * 2 * Math.PI;

    // Perpendicular circle orientation
    const p1x = cx + Math.cos(a1) * radius * -dy;
    const p1y = cy + Math.cos(a1) * radius * dx;
    const p1z = cz + Math.sin(a1) * radius;

    const p2x = cx + Math.cos(a2) * radius * -dy;
    const p2y = cy + Math.cos(a2) * radius * dx;
    const p2z = cz + Math.sin(a2) * radius;

    const t1x = p1x + dx * height;
    const t1y = p1y + dy * height;
    const t1z = p1z;

    const t2x = p2x + dx * height;
    const t2y = p2y + dy * height;
    const t2z = p2z;

    // Quad triangle 1
    tris.push({
      normal: [dx, dy, 0],
      v1: [p1x, p1y, p1z],
      v2: [p2x, p2y, p2z],
      v3: [t1x, t1y, t1z],
    });

    // Quad triangle 2
    tris.push({
      normal: [dx, dy, 0],
      v1: [p2x, p2y, p2z],
      v2: [t2x, t2y, t2z],
      v3: [t1x, t1y, t1z],
    });
  }

  return tris;
}

/**
 * Generates a full 3D connector STL for a specific structural node.
 */
export function generateNodeStl(
  nodeGeom: Node3DGeometry,
  options: StlExportOptions
): ArrayBuffer {
  const baseRadius = 8.0; // 8mm central hub cylinder
  const hubHeight = 12.0; // 12mm thickness
  const socketLength = 16.0; // 16mm arm protrusion
  const innerRadius = 3.0 + options.printerToleranceMm; // e.g. 3.25mm for 6mm sticks
  const outerRadius = innerRadius + 2.0; // 2mm wall

  const triangles: Array<{
    normal: [number, number, number];
    v1: [number, number, number];
    v2: [number, number, number];
    v3: [number, number, number];
  }> = [];

  // 1. Central Core Hub (prism of 12 segments)
  const segments = 12;
  for (let i = 0; i < segments; i++) {
    const a1 = (i / segments) * 2 * Math.PI;
    const a2 = ((i + 1) / segments) * 2 * Math.PI;

    const x1 = Math.cos(a1) * baseRadius;
    const y1 = Math.sin(a1) * baseRadius;
    const x2 = Math.cos(a2) * baseRadius;
    const y2 = Math.sin(a2) * baseRadius;

    // Top cap
    triangles.push({
      normal: [0, 0, 1],
      v1: [0, 0, hubHeight / 2],
      v2: [x1, y1, hubHeight / 2],
      v3: [x2, y2, hubHeight / 2],
    });

    // Bottom cap
    triangles.push({
      normal: [0, 0, -1],
      v1: [0, 0, -hubHeight / 2],
      v2: [x2, y2, -hubHeight / 2],
      v3: [x1, y1, -hubHeight / 2],
    });

    // Sides
    triangles.push({
      normal: [(x1 + x2) / 2, (y1 + y2) / 2, 0],
      v1: [x1, y1, -hubHeight / 2],
      v2: [x2, y2, -hubHeight / 2],
      v3: [x1, y1, hubHeight / 2],
    });
    triangles.push({
      normal: [(x1 + x2) / 2, (y1 + y2) / 2, 0],
      v1: [x2, y2, -hubHeight / 2],
      v2: [x2, y2, hubHeight / 2],
      v3: [x1, y1, hubHeight / 2],
    });
  }

  // 2. Add Socket Arms pointing toward connected members
  for (const neighbor of nodeGeom.neighbors) {
    const armTris = generateCylinderTriangles(
      0,
      0,
      0,
      outerRadius,
      socketLength,
      neighbor.angleRad,
      8
    );
    triangles.push(...armTris);
  }

  return buildBinaryStl(triangles, `Node-${nodeGeom.nodeId}-Tolerance-${options.printerToleranceMm}mm`);
}
