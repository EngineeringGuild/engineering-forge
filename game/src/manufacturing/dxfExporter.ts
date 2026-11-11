/**
 * Engineering Forge - Laser Cut DXF & Calibrated SVG Exporter
 * Generates AutoCAD R12 DXF and 1:1 metric SVG cut sheets for CNC laser cutters.
 */

export interface CutBeamItem {
  id: string;
  label: string;
  materialName: string;
  lengthMm: number;
  widthMm: number;
  angleDeg?: number;
}

export interface SheetNestingConfig {
  sheetWidthMm: number; // e.g. 600mm
  sheetHeightMm: number; // e.g. 400mm
  spacingMarginMm: number; // e.g. 5mm between parts
  materialThicknessMm: number; // 3mm or 6mm
}

/**
 * Packs rectangular beams into a 2D sheet using a shelf-first nesting heuristic.
 */
export function packBeamsOnSheet(
  beams: CutBeamItem[],
  config: SheetNestingConfig
): Array<{ beam: CutBeamItem; x: number; y: number }> {
  const packed: Array<{ beam: CutBeamItem; x: number; y: number }> = [];

  let currentX = config.spacingMarginMm;
  let currentY = config.spacingMarginMm;
  let rowHeight = 0;

  for (const beam of beams) {
    // If beam exceeds sheet width, start next shelf row
    if (currentX + beam.lengthMm > config.sheetWidthMm - config.spacingMarginMm) {
      currentX = config.spacingMarginMm;
      currentY += rowHeight + config.spacingMarginMm;
      rowHeight = 0;
    }

    packed.push({
      beam,
      x: currentX,
      y: currentY,
    });

    currentX += beam.lengthMm + config.spacingMarginMm;
    rowHeight = Math.max(rowHeight, beam.widthMm);
  }

  return packed;
}

/**
 * Generates an AutoCAD R12 compatible ASCII DXF file string.
 * R12 DXF is the universal industry standard for laser cutter software (LightBurn, LaserCAD, RDWorks).
 */
export function generateDxfCutSheet(
  beams: CutBeamItem[],
  config: SheetNestingConfig = { sheetWidthMm: 600, sheetHeightMm: 400, spacingMarginMm: 5, materialThicknessMm: 3 }
): string {
  const packed = packBeamsOnSheet(beams, config);

  const lines: string[] = [
    '0', 'SECTION',
    '2', 'HEADER',
    '9', '$ACADVER',
    '1', 'AC1009', // AutoCAD R12
    '9', '$INSUNITS',
    '70', '4', // Millimeters
    '0', 'ENDSEC',
    '0', 'SECTION',
    '2', 'ENTITIES',
  ];

  // Draw sheet boundary on border layer
  lines.push(
    '0', 'POLYLINE', '8', 'BORDER', '66', '1', '70', '1',
    '0', 'VERTEX', '8', 'BORDER', '10', '0', '20', '0', '30', '0',
    '0', 'VERTEX', '8', 'BORDER', '10', String(config.sheetWidthMm), '20', '0', '30', '0',
    '0', 'VERTEX', '8', 'BORDER', '10', String(config.sheetWidthMm), '20', String(config.sheetHeightMm), '30', '0',
    '0', 'VERTEX', '8', 'BORDER', '10', '0', '20', String(config.sheetHeightMm), '30', '0',
    '0', 'SEQEND'
  );

  // Draw each rectangular beam outline on CUT layer
  for (const item of packed) {
    const x1 = item.x;
    const y1 = item.y;
    const x2 = item.x + item.beam.lengthMm;
    const y2 = item.y + item.beam.widthMm;

    lines.push(
      '0', 'POLYLINE', '8', 'CUT', '66', '1', '70', '1',
      '0', 'VERTEX', '8', 'CUT', '10', String(x1), '20', String(y1), '30', '0',
      '0', 'VERTEX', '8', 'CUT', '10', String(x2), '20', String(y1), '30', '0',
      '0', 'VERTEX', '8', 'CUT', '10', String(x2), '20', String(y2), '30', '0',
      '0', 'VERTEX', '8', 'CUT', '10', String(x1), '20', String(y2), '30', '0',
      '0', 'SEQEND'
    );

    // Text label on ENGRAVE layer
    lines.push(
      '0', 'TEXT', '8', 'ENGRAVE',
      '10', String(x1 + 4), '20', String(y1 + 4), '30', '0',
      '40', '3.5', // Text height 3.5mm
      '1', `${item.beam.label} (${Math.round(item.beam.lengthMm)}mm)`
    );
  }

  lines.push('0', 'ENDSEC', '0', 'EOF');
  return lines.join('\n');
}

/**
 * Generates a 1:1 calibrated SVG file for laser cutting (Red #FF0000 = cut, Blue #0000FF = engrave).
 */
export function generateSvgCutSheet(
  beams: CutBeamItem[],
  config: SheetNestingConfig = { sheetWidthMm: 600, sheetHeightMm: 400, spacingMarginMm: 5, materialThicknessMm: 3 }
): string {
  const packed = packBeamsOnSheet(beams, config);

  const rectsSvg = packed
    .map(
      (item) => `
    <!-- Beam ${item.beam.label} -->
    <rect x="${item.x}" y="${item.y}" width="${item.beam.lengthMm}" height="${item.beam.widthMm}" rx="1" fill="none" stroke="#ff0000" stroke-width="0.1" />
    <text x="${item.x + 3}" y="${item.y + item.beam.widthMm / 2 + 1}" font-family="monospace" font-size="3" fill="#0000ff">${item.beam.label} (${Math.round(item.beam.lengthMm)}mm)</text>
  `
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${config.sheetWidthMm}mm" height="${config.sheetHeightMm}mm" viewBox="0 0 ${config.sheetWidthMm} ${config.sheetHeightMm}">
  <!-- Sheet Outline -->
  <rect x="0" y="0" width="${config.sheetWidthMm}" height="${config.sheetHeightMm}" fill="#11151b" stroke="#334155" stroke-width="0.5" />
  ${rectsSvg}
</svg>`;
}
