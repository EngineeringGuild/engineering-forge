import { describe, expect, it } from 'vitest';
import { generateNodeStl, buildBinaryStl } from './stlGenerator';
import { generateDxfCutSheet, generateSvgCutSheet, packBeamsOnSheet, type CutBeamItem } from './dxfExporter';

describe('CAD & 3D STL Manufacturing Pipeline', () => {
  it('generates valid binary STL array buffer with header and triangle count', () => {
    const triangles = [
      {
        normal: [0, 0, 1] as [number, number, number],
        v1: [0, 0, 0] as [number, number, number],
        v2: [10, 0, 0] as [number, number, number],
        v3: [0, 10, 0] as [number, number, number],
      },
    ];

    const buffer = buildBinaryStl(triangles, 'Test Header');
    expect(buffer.byteLength).toBe(84 + 1 * 50);

    const view = new DataView(buffer);
    const count = view.getUint32(80, true);
    expect(count).toBe(1);
  });

  it('generates node connector STL with neighbor sockets', () => {
    const nodeGeom = {
      nodeId: 'N-01',
      xMm: 0,
      yMm: 0,
      neighbors: [
        { angleRad: 0, memberId: 'M-01', materialId: 'wood' },
        { angleRad: Math.PI / 4, memberId: 'M-02', materialId: 'steel' },
      ],
    };

    const stlBuffer = generateNodeStl(nodeGeom, {
      connectorType: 'socket',
      printerToleranceMm: 0.25,
    });

    expect(stlBuffer).toBeDefined();
    expect(stlBuffer.byteLength).toBeGreaterThan(1000); // contains multiple triangulated cylinders
  });
});

describe('Laser Cut DXF and SVG Exporter', () => {
  const sampleBeams: CutBeamItem[] = [
    { id: 'b1', label: 'B-01', materialName: 'Wood', lengthMm: 200, widthMm: 15 },
    { id: 'b2', label: 'B-02', materialName: 'Wood', lengthMm: 250, widthMm: 15 },
    { id: 'b3', label: 'B-03', materialName: 'Steel', lengthMm: 180, widthMm: 15 },
  ];

  it('packs beams into sheets using 2D shelf nesting', () => {
    const config = { sheetWidthMm: 500, sheetHeightMm: 300, spacingMarginMm: 5, materialThicknessMm: 3 };
    const packed = packBeamsOnSheet(sampleBeams, config);

    expect(packed.length).toBe(3);
    expect(packed[0].x).toBe(5);
    expect(packed[0].y).toBe(5);
    // Second beam should be placed after first beam + margin
    expect(packed[1].x).toBe(5 + 200 + 5);
  });

  it('generates valid AutoCAD R12 DXF format string', () => {
    const dxf = generateDxfCutSheet(sampleBeams);
    expect(dxf).toContain('SECTION');
    expect(dxf).toContain('AC1009'); // AutoCAD R12 version
    expect(dxf).toContain('CUT');
    expect(dxf).toContain('ENGRAVE');
    expect(dxf).toContain('B-01');
    expect(dxf).toContain('EOF');
  });

  it('generates valid 1:1 metric SVG cut sheet', () => {
    const svg = generateSvgCutSheet(sampleBeams);
    expect(svg).toContain('<svg');
    expect(svg).toContain('width="600mm"');
    expect(svg).toContain('stroke="#ff0000"'); // cut lines
    expect(svg).toContain('fill="#0000ff"'); // engrave labels
    expect(svg).toContain('B-02');
  });
});
