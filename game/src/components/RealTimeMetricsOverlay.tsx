import { calculateSafetyFactor, formatForce } from '../physics/heatmap';
import type { DynamicTrussFrame } from '../physics/trussDynamic';
import type { BuiltMember } from '../game/build';
import { MATERIALS } from '../physics/materials';

interface RealTimeMetricsOverlayProps {
  currentFrame: DynamicTrussFrame | null;
  builtMembers: BuiltMember[];
  isSimulating: boolean;
  heatmapEnabled: boolean;
  vectorsEnabled: boolean;
}

export function RealTimeMetricsOverlay({
  currentFrame,
  builtMembers,
  isSimulating,
  heatmapEnabled,
  vectorsEnabled,
}: RealTimeMetricsOverlayProps) {
  if (!currentFrame) return null;

  const maxUtil = currentFrame.maxUtilization ?? 0;
  const maxUtilPercent = Math.round(maxUtil * 100);
  const sfInfo = calculateSafetyFactor(maxUtil);
  const isCollapsed = currentFrame.isCollapsed || Boolean(currentFrame.failedMemberId);

  // Identify the most stressed member in the current frame
  let criticalMemberId: string | null = null;
  let criticalUtil = 0;
  let criticalForceN = 0;

  for (const [mId, res] of Object.entries(currentFrame.memberResults)) {
    if (res.utilization > criticalUtil) {
      criticalUtil = res.utilization;
      criticalMemberId = mId;
      criticalForceN = res.axialForce;
    }
  }

  const criticalMemberDef = criticalMemberId
    ? builtMembers.find((m) => m.id === criticalMemberId)
    : null;
  const criticalMaterial = criticalMemberDef ? MATERIALS[criticalMemberDef.materialId] : null;
  const criticalForceInfo = formatForce(criticalForceN);

  const deflectionMm = (currentFrame.maxDeflectionMm ?? 0).toFixed(1);
  const activeLoadKn = ((currentFrame.activeLoadN ?? 10000) / 1000).toFixed(1);

  // Status badge style
  const statusColor = isCollapsed
    ? 'text-red-400 bg-red-950/60 border-red-500/50'
    : maxUtil > 0.85
    ? 'text-amber-400 bg-amber-950/60 border-amber-500/50'
    : maxUtil > 0.6
    ? 'text-yellow-400 bg-yellow-950/60 border-yellow-500/50'
    : 'text-emerald-400 bg-emerald-950/60 border-emerald-500/50';

  const statusLabel = isCollapsed
    ? 'CRITICAL FAILURE'
    : maxUtil > 0.85
    ? 'HIGH STRESS'
    : maxUtil > 0.6
    ? 'ELEVATED LOAD'
    : 'NOMINAL STABLE';

  return (
    <aside
      aria-label="Real-time structural metrics"
      className="absolute bottom-3 right-3 z-10 flex w-72 flex-col gap-2 rounded-xl border border-border/80 bg-surface-1/95 p-3 font-mono text-xs shadow-xl backdrop-blur-md"
    >
      {/* Header with Live Status Indicator */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              isCollapsed ? 'bg-red-500 animate-ping' : isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-fg-muted'
            }`}
          />
          <span className="font-semibold text-fg tracking-wide">PHYSICS METRICS</span>
          {vectorsEnabled && (
            <span className="rounded bg-cyan-950/60 border border-cyan-500/40 px-1 text-[9px] text-cyan-400">
              VECTORS
            </span>
          )}
        </div>
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-2 gap-2 py-1">
        {/* Peak Stress Meter */}
        <div className="rounded-lg bg-surface-2/80 p-2 border border-border/40">
          <span className="text-[10px] text-fg-subtle uppercase">Peak Stress</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span
              className={`text-base font-bold ${
                maxUtil > 0.85 ? 'text-red-400' : maxUtil > 0.6 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {maxUtilPercent}%
            </span>
            <span className="text-[10px] text-fg-muted">of yield</span>
          </div>
          {/* Progress bar */}
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-surface-3">
            <div
              className={`h-full transition-all duration-75 ${
                maxUtil > 0.85 ? 'bg-red-500' : maxUtil > 0.6 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, maxUtilPercent)}%` }}
            />
          </div>
        </div>

        {/* Safety Factor */}
        <div className="rounded-lg bg-surface-2/80 p-2 border border-border/40">
          <span className="text-[10px] text-fg-subtle uppercase">Safety Factor</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span
              className={`text-base font-bold ${
                sfInfo.sf < 1.0 ? 'text-red-400' : sfInfo.sf < 1.3 ? 'text-amber-400' : 'text-cyan-400'
              }`}
            >
              {sfInfo.sf > 50 ? '> 50' : sfInfo.sf.toFixed(2)}
            </span>
            <span className="text-[10px] text-fg-muted">ASME SF</span>
          </div>
          <span className="text-[9px] text-fg-muted block truncate">{sfInfo.rating}</span>
        </div>

        {/* Max Deflection */}
        <div className="rounded-lg bg-surface-2/80 p-2 border border-border/40">
          <span className="text-[10px] text-fg-subtle uppercase">Max Sag (Δy)</span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-sm font-bold text-fg">{deflectionMm}</span>
            <span className="text-[10px] text-fg-muted">mm</span>
          </div>
        </div>

        {/* Active Vehicle Weight */}
        <div className="rounded-lg bg-surface-2/80 p-2 border border-border/40">
          <span className="text-[10px] text-fg-subtle uppercase">Vehicle Load</span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-sm font-bold text-fg">{activeLoadKn}</span>
            <span className="text-[10px] text-fg-muted">kN</span>
          </div>
        </div>
      </div>

      {/* Critical Component Monitor */}
      {criticalMemberId && (
        <div className="rounded-lg border border-border/60 bg-surface-2/60 p-2">
          <div className="flex items-center justify-between text-[10px] text-fg-subtle">
            <span className="uppercase">Highest Stressed Member</span>
            <span className="font-semibold text-fg-muted">{criticalMemberId}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-fg-muted capitalize">
              {criticalMaterial?.name ?? 'Member'}
            </span>
            <span
              className={`font-bold ${
                criticalForceInfo.type === 'tension' ? 'text-cyan-400' : 'text-orange-400'
              }`}
            >
              {criticalForceInfo.formatted}
            </span>
          </div>

          {/* Phase 2: Euler Column Buckling Instability Status (AISC 360-16) */}
          {criticalForceInfo.type === 'compression' && criticalMaterial && (
            <div className="mt-1.5 pt-1 border-t border-border/40 flex items-center justify-between text-[9px]">
              <span className="text-fg-subtle">Euler Stability:</span>
              <span className={`font-semibold ${criticalUtil > 0.9 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {criticalUtil > 1.0 ? '⚡ BUCKLING INSTABILITY' : criticalUtil > 0.85 ? '⚠ NEAR BUCKLING LIMIT' : 'STABLE (λ < λ_crit)'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Support Reactions (Anchor Equilibrium) */}
      {currentFrame.supportReactions && Object.keys(currentFrame.supportReactions).length > 0 && (
        <div className="flex items-center justify-between border-t border-border/40 pt-1.5 text-[10px] text-fg-muted">
          <span>Support Reactions:</span>
          <div className="flex items-center gap-2">
            {Object.entries(currentFrame.supportReactions).map(([nodeId, r]) => {
              const ryKn = (Math.abs(r.ry) / 1000).toFixed(1);
              return (
                <span key={nodeId} className="text-emerald-400 font-mono">
                  {nodeId}: {ryKn}kN ↑
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Heatmap Spectrum Legend Bar */}
      {heatmapEnabled && (
        <div className="border-t border-border/40 pt-1.5">
          <div className="flex items-center justify-between text-[9px] text-fg-subtle mb-1">
            <span>0% (Low)</span>
            <span>50%</span>
            <span>100% (Yield)</span>
          </div>
          <div
            className="h-2 w-full rounded-sm"
            style={{
              background:
                'linear-gradient(to right, #2563eb 0%, #06b6d4 25%, #10b981 50%, #f59e0b 75%, #f97316 90%, #ef4444 100%)',
            }}
          />
        </div>
      )}
    </aside>
  );
}
