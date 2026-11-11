import { useState, useMemo } from 'react';
import type { BuiltNode, BuiltMember } from '../game/build';
import type { BuiltEdge } from '../game/circuitBuild';
import { MATERIALS } from '../physics/materials';
import { COMPONENTS } from '../physics/components';
import { ENGINES, CHASSIS } from '../physics/vehicleParts';

interface TechnicalSpecReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  discipline: 'structures' | 'circuits' | 'vehicles';
  title?: string;
  // Structures data
  structNodes?: BuiltNode[];
  structMembers?: BuiltMember[];
  totalCost?: number;
  maxStressPercent?: number;
  safetyFactor?: number;
  cog?: { x: number; y: number };
  totalMassKg?: number;
  // Circuits data
  circuitNodes?: BuiltNode[];
  circuitEdges?: BuiltEdge[];
  voltage?: number;
  totalCurrentA?: number;
  totalPowerW?: number;
  // Vehicles data
  engineId?: string;
  chassisId?: string;
  distanceM?: number;
  inclineDeg?: number;
  payloadKg?: number;
  topSpeedKmh?: number;
}

export function TechnicalSpecReportModal({
  isOpen,
  onClose,
  discipline,
  title = 'Engineering Specification & Bill of Materials',
  structNodes = [],
  structMembers = [],
  totalCost = 0,
  maxStressPercent = 0,
  safetyFactor = 2.0,
  cog = { x: 0, y: 0 },
  totalMassKg = 0,
  circuitNodes = [],
  circuitEdges = [],
  voltage = 24,
  totalCurrentA = 0,
  totalPowerW = 0,
  engineId = 'large',
  chassisId = 'light',
  distanceM = 100,
  inclineDeg = 0,
  payloadKg = 0,
  topSpeedKmh = 0,
}: TechnicalSpecReportModalProps) {
  const [copied, setCopied] = useState(false);
  const [reportDate] = useState(() => new Date().toISOString());

  // Generate Bill of Materials (BOM)
  const bomItems = useMemo(() => {
    if (discipline === 'structures') {
      const counts: Record<string, { count: number; totalLength: number; unitCost: number; name: string }> = {};
      for (const m of structMembers) {
        const mat = MATERIALS[m.materialId] ?? MATERIALS.wood;
        if (!counts[m.materialId]) {
          counts[m.materialId] = { count: 0, totalLength: 0, unitCost: mat.costPerMeter, name: mat.name };
        }
        counts[m.materialId].count += 1;
        // Estimate average length ~2.5m
        counts[m.materialId].totalLength += 2.5;
      }
      return Object.entries(counts).map(([matId, c]) => ({
        id: matId,
        description: `${c.name} Truss Bar`,
        qty: c.count,
        specs: `~${c.totalLength.toFixed(1)}m total`,
        unitPrice: `$${c.unitCost}/m`,
        subtotal: `$${(c.totalLength * c.unitCost).toFixed(0)}`,
      }));
    }

    if (discipline === 'circuits') {
      const counts: Record<string, { count: number; name: string; unitCost: number }> = {};
      for (const e of circuitEdges) {
        const comp = COMPONENTS[e.componentId] ?? COMPONENTS.wire;
        if (!counts[e.componentId]) {
          counts[e.componentId] = { count: 0, name: comp.name, unitCost: comp.costPerMeter };
        }
        counts[e.componentId].count += 1;
      }
      return Object.entries(counts).map(([compId, c]) => ({
        id: compId,
        description: c.name,
        qty: c.count,
        specs: compId.includes('resistor') ? 'Precision Metal Film' : 'Stranded Copper',
        unitPrice: `$${c.unitCost}`,
        subtotal: `$${(c.count * c.unitCost).toFixed(0)}`,
      }));
    }

    // Vehicles BOM
    const eng = ENGINES[engineId] ?? ENGINES['engine-large'];
    const ch = CHASSIS[chassisId] ?? CHASSIS['chassis-light'];
    return [
      {
        id: engineId,
        description: `Powertrain: ${eng.name}`,
        qty: 1,
        specs: `${eng.force}N Thrust`,
        unitPrice: `$${eng.cost}`,
        subtotal: `$${eng.cost}`,
      },
      {
        id: chassisId,
        description: `Chassis: ${ch.name}`,
        qty: 1,
        specs: `${ch.mass}kg Curb Mass`,
        unitPrice: `$${ch.cost}`,
        subtotal: `$${ch.cost}`,
      },
    ];
  }, [discipline, structMembers, circuitEdges, engineId, chassisId]);

  // Generate plain text report
  const plainTextReport = useMemo(() => {
    const lines: string[] = [];
    lines.push('================================================================');
    lines.push('        GUILD ENGINEERING FORGE - TECHNICAL SPECIFICATION       ');
    lines.push('================================================================');
    lines.push(`Discipline: ${discipline.toUpperCase()}`);
    lines.push(`Generated: ${reportDate}`);
    lines.push(`Compliance Standard: ASME Sec VIII / IEEE-Std-100 / ISO-9001`);
    lines.push('');
    lines.push('--- PHYSICAL PERFORMANCE & METRICS ---');
    if (discipline === 'structures') {
      lines.push(`Total Mass: ${totalMassKg.toFixed(1)} kg`);
      lines.push(`Center of Gravity: (${cog.x.toFixed(2)}m, ${cog.y.toFixed(2)}m)`);
      lines.push(`Peak Stress: ${maxStressPercent.toFixed(1)}% of yield`);
      lines.push(`Minimum Factor of Safety (SF): ${safetyFactor.toFixed(2)}`);
      lines.push(`Total Joints: ${structNodes.length} nodes | Total Members: ${structMembers.length} bars`);
    } else if (discipline === 'circuits') {
      lines.push(`Supply Voltage: ${voltage} V DC`);
      lines.push(`Total Branch Current: ${totalCurrentA.toFixed(2)} A`);
      lines.push(`Power Dissipation: ${totalPowerW.toFixed(1)} W`);
      lines.push(`Total Nodes: ${circuitNodes.length} nodes | Total Branches: ${circuitEdges.length}`);
    } else {
      lines.push(`Engine: ${engineId} | Chassis: ${chassisId}`);
      lines.push(`Track Distance: ${distanceM} m | Incline: ${inclineDeg}°`);
      lines.push(`Payload Cargo: ${payloadKg} kg`);
      lines.push(`Estimated Top Speed: ${topSpeedKmh.toFixed(1)} km/h`);
    }
    lines.push(`Total Estimated Project Cost: $${totalCost.toFixed(0)}`);
    lines.push('');
    lines.push('--- BILL OF MATERIALS (BOM) ---');
    for (const item of bomItems) {
      lines.push(`* [${item.id}] ${item.description} (Qty: ${item.qty}) | ${item.specs} | Subtotal: ${item.subtotal}`);
    }
    lines.push('================================================================');
    lines.push('Guild Quality Certification: VERIFIED COMPUTATIONALLY');
    return lines.join('\n');
  }, [
    discipline,
    totalMassKg,
    cog,
    maxStressPercent,
    safetyFactor,
    structNodes.length,
    structMembers.length,
    voltage,
    totalCurrentA,
    totalPowerW,
    circuitNodes.length,
    circuitEdges.length,
    engineId,
    chassisId,
    distanceM,
    inclineDeg,
    payloadKg,
    topSpeedKmh,
    totalCost,
    bomItems,
    reportDate,
  ]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainTextReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([plainTextReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spec_report_${discipline}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      data-testid="technical-spec-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden font-mono text-fg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-1 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent font-bold text-base">
              📋
            </span>
            <div>
              <h3 className="font-bold text-sm tracking-wide text-fg">{title}</h3>
              <p className="text-[11px] text-fg-subtle">
                Standard: ASME Sec VIII / IEEE-100 / ISO-9001 Guild Spec
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Engineering Metrics Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border/80 bg-surface-1 p-3">
              <span className="text-[10px] uppercase text-fg-subtle">Discipline</span>
              <div className="text-sm font-bold text-accent uppercase mt-0.5">{discipline}</div>
            </div>
            <div className="rounded-xl border border-border/80 bg-surface-1 p-3">
              <span className="text-[10px] uppercase text-fg-subtle">Total Project Cost</span>
              <div className="text-sm font-bold text-fg mt-0.5">${totalCost.toFixed(0)}</div>
            </div>
            {discipline === 'structures' && (
              <>
                <div className="rounded-xl border border-border/80 bg-surface-1 p-3">
                  <span className="text-[10px] uppercase text-fg-subtle">Min Safety Factor</span>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    {safetyFactor >= 10 ? '> 10.0' : safetyFactor.toFixed(2)}
                  </div>
                </div>
                <div className="rounded-xl border border-border/80 bg-surface-1 p-3">
                  <span className="text-[10px] uppercase text-fg-subtle">Peak Utilization</span>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">
                    {maxStressPercent.toFixed(1)}%
                  </div>
                </div>
              </>
            )}
            {discipline === 'circuits' && (
              <>
                <div className="rounded-xl border border-border/80 bg-surface-1 p-3">
                  <span className="text-[10px] uppercase text-fg-subtle">System Voltage</span>
                  <div className="text-sm font-bold text-cyan-400 mt-0.5">{voltage} V DC</div>
                </div>
                <div className="rounded-xl border border-border/80 bg-surface-1 p-3">
                  <span className="text-[10px] uppercase text-fg-subtle">Current Draw</span>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">
                    {totalCurrentA.toFixed(2)} A
                  </div>
                </div>
              </>
            )}
            {discipline === 'vehicles' && (
              <>
                <div className="rounded-xl border border-border/80 bg-surface-1 p-3">
                  <span className="text-[10px] uppercase text-fg-subtle">Track Incline</span>
                  <div className="text-sm font-bold text-cyan-400 mt-0.5">{inclineDeg}°</div>
                </div>
                <div className="rounded-xl border border-border/80 bg-surface-1 p-3">
                  <span className="text-[10px] uppercase text-fg-subtle">Payload Mass</span>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">{payloadKg} kg</div>
                </div>
              </>
            )}
          </div>

          {/* Bill of Materials Table */}
          <div>
            <h4 className="font-bold text-xs text-fg uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>📦</span>
              <span>Bill of Materials (BOM)</span>
            </h4>
            <div className="overflow-x-auto rounded-xl border border-border/80 bg-surface-1">
              <table className="w-full text-left text-[11px]">
                <thead className="border-b border-border bg-surface-2 text-fg-subtle">
                  <tr>
                    <th className="py-2 px-3 font-semibold">Item & Component</th>
                    <th className="py-2 px-3 font-semibold">Qty</th>
                    <th className="py-2 px-3 font-semibold">Specifications</th>
                    <th className="py-2 px-3 font-semibold">Unit Price</th>
                    <th className="py-2 px-3 font-semibold text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-fg">
                  {bomItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-3 px-3 text-center text-fg-muted">
                        No materials placed yet.
                      </td>
                    </tr>
                  ) : (
                    bomItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface-2/40">
                        <td className="py-2 px-3 font-semibold text-accent">{item.description}</td>
                        <td className="py-2 px-3">{item.qty}</td>
                        <td className="py-2 px-3 text-fg-muted">{item.specs}</td>
                        <td className="py-2 px-3 text-fg-muted">{item.unitPrice}</td>
                        <td className="py-2 px-3 text-right font-bold">{item.subtotal}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formatted Text Spec Preview */}
          <div>
            <h4 className="font-bold text-xs text-fg uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>📄</span>
              <span>Guild Certified Spec Manifest</span>
            </h4>
            <textarea
              readOnly
              value={plainTextReport}
              rows={8}
              className="w-full rounded-xl border border-border bg-surface-2/60 p-3 font-mono text-[10px] text-fg-muted focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border bg-surface-1 px-6 py-3.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-accent bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/25 transition-colors"
            >
              <span>{copied ? '✓ Copied!' : '📋 Copy Report'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-fg hover:border-accent hover:text-accent transition-colors"
            >
              <span>💾 Download .TXT</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-1.5 text-xs text-fg-muted hover:text-fg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
