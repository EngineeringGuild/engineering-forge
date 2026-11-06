import type { CircuitTelemetry } from '../physics/engine/PhysicsMetricsContract';

interface CircuitRealTimeMetricsOverlayProps {
  telemetry: CircuitTelemetry | null;
  isSimulating: boolean;
  heatmapEnabled: boolean;
  vectorsEnabled: boolean;
  voltageLimitV?: number;
}

export function CircuitRealTimeMetricsOverlay({
  telemetry,
  isSimulating,
  heatmapEnabled,
  vectorsEnabled,
}: CircuitRealTimeMetricsOverlayProps) {
  if (!telemetry) return null;

  const isTripped = telemetry.breakerTripped;
  const isOverloaded = telemetry.peakComponentUtilization > 1.0;
  const currentMa = telemetry.totalSourceCurrentA * 1000;
  const powerW = telemetry.totalPowerW;

  const statusLabel = isTripped
    ? 'BREAKER TRIPPED'
    : isOverloaded
    ? 'OVERCURRENT WARN'
    : currentMa > 0.01
    ? 'ENERGIZED (STABLE)'
    : 'OPEN CIRCUIT';

  const statusColor = isTripped
    ? 'text-red-400 bg-red-950/60 border-red-500/50'
    : isOverloaded
    ? 'text-amber-400 bg-amber-950/60 border-amber-500/50'
    : currentMa > 0.01
    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/50'
    : 'text-fg-muted bg-surface-2 border-border';

  return (
    <aside
      aria-label="Real-time circuit electrodynamics"
      className="absolute bottom-3 right-3 z-10 flex w-72 flex-col gap-2 rounded-xl border border-border/80 bg-surface-1/95 p-3 font-mono text-xs shadow-xl backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              isTripped ? 'bg-red-500 animate-ping' : isSimulating && currentMa > 0.01 ? 'bg-emerald-400 animate-pulse' : 'bg-fg-muted'
            }`}
          />
          <span className="font-semibold text-fg tracking-wide">ELECTRODYNAMICS</span>
          {vectorsEnabled && (
            <span className="rounded bg-cyan-950/60 border border-cyan-500/40 px-1 text-[9px] text-cyan-400">
              CURRENT
            </span>
          )}
        </div>
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 py-1">
        {/* Source Current */}
        <div className="rounded-lg bg-surface-2/80 p-2 border border-border/40">
          <span className="text-[10px] text-fg-subtle uppercase">Current (I)</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-base font-bold text-cyan-400">
              {currentMa >= 1000 ? (currentMa / 1000).toFixed(2) : currentMa.toFixed(1)}
            </span>
            <span className="text-[10px] text-fg-muted">
              {currentMa >= 1000 ? 'A' : 'mA'}
            </span>
          </div>
          <span className="text-[9px] text-fg-muted">
            Loop V: {telemetry.loopVoltageV.toFixed(1)} V
          </span>
        </div>

        {/* Power Dissipation */}
        <div className="rounded-lg bg-surface-2/80 p-2 border border-border/40">
          <span className="text-[10px] text-fg-subtle uppercase">Power (P)</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-base font-bold text-amber-400">
              {powerW >= 1 ? powerW.toFixed(2) : (powerW * 1000).toFixed(0)}
            </span>
            <span className="text-[10px] text-fg-muted">
              {powerW >= 1 ? 'W' : 'mW'}
            </span>
          </div>
          <span className="text-[9px] text-fg-muted">
            Heat: {telemetry.totalJouleEnergyJ.toFixed(2)} J
          </span>
        </div>

        {/* Breaker Margin */}
        <div className="rounded-lg bg-surface-2/80 p-2 border border-border/40">
          <span className="text-[10px] text-fg-subtle uppercase">Breaker Margin</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span
              className={`text-sm font-bold ${
                telemetry.breakerMarginPercent < 20 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {Math.max(0, Math.round(telemetry.breakerMarginPercent))}%
            </span>
            <span className="text-[10px] text-fg-muted">headroom</span>
          </div>
        </div>

        {/* Kirchhoff Conservation */}
        <div className="rounded-lg bg-surface-2/80 p-2 border border-border/40">
          <span className="text-[10px] text-fg-subtle uppercase">Kirchhoff (∑I)</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-sm font-bold text-emerald-400">
              {Math.abs(telemetry.kirchhoffResidualA) < 1e-4 ? '0.00' : telemetry.kirchhoffResidualA.toExponential(1)}
            </span>
            <span className="text-[10px] text-fg-muted">mA</span>
          </div>
          <span className="text-[9px] text-fg-muted">Node conserved</span>
        </div>
      </div>

      {/* Component Utilization */}
      <div className="rounded-lg border border-border/60 bg-surface-2/60 p-2">
        <div className="flex items-center justify-between text-[10px] text-fg-subtle">
          <span className="uppercase">Highest Wire/Resistor Load</span>
          <span className={isOverloaded ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
            {Math.round(telemetry.peakComponentUtilization * 100)}% {isOverloaded ? '(OVERLOAD)' : '(NOMINAL)'}
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
          <div
            className={`h-full transition-all duration-75 ${
              isOverloaded ? 'bg-red-500' : 'bg-emerald-400'
            }`}
            style={{ width: `${Math.min(100, Math.round(telemetry.peakComponentUtilization * 100))}%` }}
          />
        </div>
      </div>

      {/* Thermal Heatmap Scale */}
      {heatmapEnabled && (
        <div className="border-t border-border/40 pt-1.5">
          <div className="flex items-center justify-between text-[9px] text-fg-subtle mb-1">
            <span>Joule Thermal Heatmap</span>
            <span>Cool (0W) → Hot (Yield)</span>
          </div>
          <div
            className="h-2 w-full rounded-sm"
            style={{
              background: 'linear-gradient(to right, #2563eb 0%, #06b6d4 30%, #10b981 60%, #f59e0b 85%, #ef4444 100%)',
            }}
          />
        </div>
      )}
    </aside>
  );
}
