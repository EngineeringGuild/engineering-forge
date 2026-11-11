import { useState } from 'react';
import type { BuiltNode, BuiltMember } from '../game/build';
import { generateNodeStl } from '../manufacturing/stlGenerator';
import { generateDxfCutSheet, generateSvgCutSheet, type CutBeamItem } from '../manufacturing/dxfExporter';
import { soundFx } from '../audio/soundFx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  builtNodes: BuiltNode[];
  builtMembers: BuiltMember[];
  levelTitle?: string;
}

export function CadExportModal({
  isOpen,
  onClose,
  builtNodes,
  builtMembers,
  levelTitle = 'Bridge Project',
}: Props) {
  const [tolerance, setTolerance] = useState(0.25); // mm
  const [connectorType, setConnectorType] = useState<'socket' | 'gusset'>('socket');
  const [sheetSize, setSheetSize] = useState<'600x400' | '300x200'>('600x400');
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate cut beam list
  const cutBeams: CutBeamItem[] = builtMembers.map((m, idx) => {
    // Map member endpoints
    const nodeA = builtNodes.find((n) => n.id === m.nodeA);
    const nodeB = builtNodes.find((n) => n.id === m.nodeB);
    const lenM = nodeA && nodeB ? Math.hypot(nodeB.x - nodeA.x, nodeB.y - nodeA.y) : 2.0;
    // Scale 1m in simulation = 50mm in physical scaled tabletop model
    const lengthMm = Math.max(30, Math.round(lenM * 50));
    return {
      id: m.id,
      label: `B-${String(idx + 1).padStart(2, '0')}`,
      materialName: m.materialId,
      lengthMm,
      widthMm: 12,
    };
  });

  const handleDownloadStl = (node: BuiltNode) => {
    soundFx.playTactileClick();
    // Find connected members
    const connectedMembers = builtMembers.filter(
      (m) => m.nodeA === node.id || m.nodeB === node.id
    );

    const neighbors = connectedMembers.map((m) => {
      const otherNodeId = m.nodeA === node.id ? m.nodeB : m.nodeA;
      const other = builtNodes.find((n) => n.id === otherNodeId);
      const angle = other ? Math.atan2(other.y - node.y, other.x - node.x) : 0;
      return {
        angleRad: angle,
        memberId: m.id,
        materialId: m.materialId,
      };
    });

    const buffer = generateNodeStl(
      {
        nodeId: node.id,
        xMm: node.x * 50,
        yMm: node.y * 50,
        neighbors,
      },
      {
        connectorType,
        printerToleranceMm: tolerance,
      }
    );

    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Node-${node.id}-${connectorType}.stl`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccessMsg(`Nó ${node.id} exportado com sucesso em .STL!`);
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
  };

  const handleDownloadDxf = () => {
    soundFx.playTactileClick();
    const [w, h] = sheetSize === '600x400' ? [600, 400] : [300, 200];
    const dxfContent = generateDxfCutSheet(cutBeams, {
      sheetWidthMm: w,
      sheetHeightMm: h,
      spacingMarginMm: 5,
      materialThicknessMm: 3,
    });

    const blob = new Blob([dxfContent], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${levelTitle.toLowerCase().replace(/\s+/g, '-')}-laser-cut.dxf`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccessMsg(`Prancha DXF gerada (${cutBeams.length} barras)!`);
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
  };

  const handleDownloadSvg = () => {
    soundFx.playTactileClick();
    const [w, h] = sheetSize === '600x400' ? [600, 400] : [300, 200];
    const svgContent = generateSvgCutSheet(cutBeams, {
      sheetWidthMm: w,
      sheetHeightMm: h,
      spacingMarginMm: 5,
      materialThicknessMm: 3,
    });

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${levelTitle.toLowerCase().replace(/\s+/g, '-')}-laser-cut.svg`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccessMsg(`Gabarito SVG 1:1 gerado com sucesso!`);
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cad-export-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div className="industrial-panel w-full max-w-2xl rounded-2xl border border-border p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent border border-accent/40 text-xl font-mono">
              📐
            </span>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-accent font-semibold block">
                FABRICAÇÃO DIGITAL & MANUFATURA REAL (DOC-09)
              </span>
              <h2 id="cad-export-title" className="font-display text-2xl font-bold text-fg">
                Exportador CAD: Impressão 3D & Laser
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playTactileClick();
              onClose();
            }}
            aria-label="Fechar exportador"
            className="rounded-lg border border-border p-1.5 text-fg-muted hover:border-accent hover:text-fg"
          >
            ✕
          </button>
        </div>

        {downloadSuccessMsg && (
          <div className="p-3 rounded-lg font-mono text-xs bg-success/20 text-success border border-success/40">
            ✓ {downloadSuccessMsg}
          </div>
        )}

        {/* Section 1: 3D Printing STL Nodes */}
        <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-fg text-base flex items-center gap-2">
              <span>🖨️ Impressão 3D de Juntas (.STL)</span>
            </h3>
            <span className="text-[11px] font-mono text-fg-subtle">
              {builtNodes.length} Nós Customizados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <label className="text-fg-subtle block mb-1">Tipo de Encaixe:</label>
              <select
                value={connectorType}
                onChange={(e) => setConnectorType(e.target.value as 'socket' | 'gusset')}
                className="w-full rounded bg-surface-1 border border-border p-2 text-fg focus:border-accent focus:outline-none"
              >
                <option value="socket">Socket Tubular (Encaixe de Haste)</option>
                <option value="gusset">Gusset Plate (Parafuso M3 DIN 912)</option>
              </select>
            </div>

            <div>
              <label className="text-fg-subtle block mb-1">
                Tolerância de Impressora (Folga: {tolerance.toFixed(2)}mm):
              </label>
              <input
                type="range"
                min="0.15"
                max="0.45"
                step="0.05"
                value={tolerance}
                onChange={(e) => setTolerance(parseFloat(e.target.value))}
                className="w-full accent-accent"
              />
              <div className="flex justify-between text-[10px] text-fg-subtle mt-0.5">
                <span>0.15mm (Ajuste Fino)</span>
                <span>0.45mm (Folgado)</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[11px] font-mono text-fg-subtle block mb-2">Exportar Nó Individual:</span>
            <div className="flex flex-wrap gap-2">
              {builtNodes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleDownloadStl(n)}
                  className="rounded px-2.5 py-1 text-xs font-mono bg-surface-1 hover:bg-accent hover:text-accent-foreground border border-border transition-colors"
                >
                  📥 Nó {n.id} (.stl)
                </button>
              ))}
              {builtNodes.length === 0 && (
                <span className="text-xs text-fg-muted font-mono italic">
                  Nenhum nó construído ainda no modelo.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Laser Cutting Beams (.DXF and .SVG) */}
        <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-fg text-base flex items-center gap-2">
              <span>⚡ Corte a Laser de Barras (.DXF / .SVG)</span>
            </h3>
            <span className="text-[11px] font-mono text-fg-subtle">
              {cutBeams.length} Barras Identificadas
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div>
              <span className="text-fg-subtle block mb-1">Dimensão da Chapa:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSheetSize('600x400')}
                  className={`px-3 py-1 rounded border ${
                    sheetSize === '600x400'
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'bg-surface-1 border-border text-fg-muted'
                  }`}
                >
                  600 × 400 mm
                </button>
                <button
                  onClick={() => setSheetSize('300x200')}
                  className={`px-3 py-1 rounded border ${
                    sheetSize === '300x200'
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'bg-surface-1 border-border text-fg-muted'
                  }`}
                >
                  300 × 200 mm
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <button
                onClick={handleDownloadDxf}
                disabled={cutBeams.length === 0}
                className="px-4 py-2 rounded font-mono text-xs font-bold bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-40 transition-all shadow"
              >
                💾 Baixar .DXF (AutoCAD R12)
              </button>
              <button
                onClick={handleDownloadSvg}
                disabled={cutBeams.length === 0}
                className="px-4 py-2 rounded font-mono text-xs font-bold bg-surface-1 hover:border-accent text-fg border border-border disabled:opacity-40 transition-all"
              >
                📄 Baixar .SVG (1:1 Calibrado)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] font-mono text-fg-subtle pt-2 border-t border-border/60">
          <span>ESCALA: 1m (SIMULAÇÃO) = 50mm (MAQUETE FÍSICA)</span>
          <span>COMPLIANCE: ISO 2768-m · DIN 912</span>
        </div>
      </div>
    </div>
  );
}
