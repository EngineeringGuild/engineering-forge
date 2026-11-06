import type { VehicleTelemetry } from '../physics/engine/PhysicsMetricsContract';

interface VehicleRealTimeMetricsOverlayProps {
  telemetry: VehicleTelemetry | null;
  isSimulating: boolean;
  heatmapEnabled: boolean;
  vectorsEnabled: boolean;
  targetSpeedKmh?: number;
}

export function VehicleRealTimeMetricsOverlay({
  telemetry,
  isSimulating,
  heatmapEnabled,
  vectorsEnabled,
  targetSpeedKmh = 100,
}: VehicleRealTimeMetricsOverlayProps) {
  if (!telemetry) return null;

  const isStalled = telemetry.isStalled;
  const isSlipping = telemetry.isTractionLimited;
  const gripPercent = Math.round(Math.min(100, Math.max(0, (1 - (telemetry.gripRatio > 1 ? telemetry.gripRatio - 1 : 0)) * 100)));

  const statusLabel = isStalled
    ? 'SLOPE STALL'
    : isSlipping
    ? 'TRACTION LIMITED'
    : telemetry.speedKmh >= targetSpeedKmh
    ? 'TARGET ACHIEVED'
    : 'ACCELERATING';

  const statusColor = isStalled
    ? 'text-red-400 bg-red-950/60 border-red-500/50'
    : isSlipping
    ? 'text-amber-400 bg-amber-950/60 border-amber-500/50'
    : 'text-emerald-400 bg-emerald-950/60 border-emerald-500/50';

  return (
    <aside
      aria-label="Real-time vehicle telemetry"
      className="absolute bottom-3 right-3 z-10 flex w-72 flex-col gap-2 rounded-xl border border-border/80 bg-surface-1/95 p-3 font-mono text-xs shadow-xl backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              isStalled ? 'bg-red-500 animate-ping' : isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-fg-muted'
            }`}
          />
          <span className="font-semibold text-fg tracking-wide">VEHICLE TELEMETRY</span>
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

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-2 py-1">
        {/* Speed Card */}
        <div className="rounded-lg bg-surface-2/80 p-2 border border-border/40">
          <span className="text-[10px] text-fg-subtle uppercase">Velocity</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-base font-bold text-fg">
              {telemetry.speedKmh.toFixed(1)}
            </span>
            <span className="text-[10px] text-fg-muted">km/h</span>
          </div>
          <span className="text-[10px] text-fg-muted">
            {telemetry.speedMps.toFixed(1)} m/s
          </span>
        </div>

        {/* Acceleration & G-Force */}
        <div className="rounded-lg bg-surface-2/80 p-2 border border-border/40">
          <span className="text-[10px] text-fg-subtle uppercase">Acceleration</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-base font-bold text-accent">
              {telemetry.accelerationMps2.toFixed(1)}
            </span>
            <span className="text-[10px] text-fg-muted">m/s²</span>
          </div>
          <span className="text-[10px] text-fg-muted">
            {telemetry.gForce.toFixed(2)} G
          </span>
        </div>

        {/* Engine Thrust vs Normal Force */}
        <div className="rounded-lg bg-surface-2/80 p-2 border border-border/40">
          <span className="text-[10px] text-fg-subtle uppercase">Drive Thrust</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-sm font-bold text-cyan-400">
              {(telemetry.thrustN / 1000).toFixed(2)}
            </span>
            <span className="text-[10px] text-fg-muted">kN</span>
          </div>
          <span className="text-[9px] text-fg-muted">
            F_N: {(telemetry.normalForceN / 1000).toFixed(1)} kN
          </span>
        </div>

        {/* Power & Kinetic Energy */}
        <div className="rounded-lg bg-surface-2/80 p-2 border border-border/40">
          <span className="text-[10px] text-fg-subtle uppercase">Power Output</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-sm font-bold text-amber-400">
              {(telemetry.powerWatt / 1000).toFixed(1)}
            </span>
            <span className="text-[10px] text-fg-muted">kW</span>
          </div>
          <span className="text-[9px] text-fg-muted">
            {telemetry.powerHp.toFixed(0)} hp · {(telemetry.kineticEnergyJoule / 1000).toFixed(1)} kJ
          </span>
        </div>
      </div>

      {/* Tire Grip & Traction Meter */}
      <div className="rounded-lg border border-border/60 bg-surface-2/60 p-2">
        <div className="flex items-center justify-between text-[10px] text-fg-subtle">
          <span className="uppercase">Tire Traction Grip</span>
          <span className={isSlipping ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
            {gripPercent}% {isSlipping ? '(SLIP)' : '(GRIP)'}
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
          <div
            className={`h-full transition-all duration-75 ${
              isSlipping ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            style={{ width: `${gripPercent}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[9px] text-fg-muted">
          <span>Traction Limit: {Math.round(telemetry.tractionLimitN)} N</span>
          <span>Drag: {Math.round(telemetry.aerodynamicDragN)} N</span>
        </div>
      </div>

      {/* Heatmap Bar */}
      {heatmapEnabled && (
        <div className="border-t border-border/40 pt-1.5">
          <div className="flex items-center justify-between text-[9px] text-fg-subtle mb-1">
            <span>Traction Heatmap</span>
            <span>Grip → Slip</span>
          </div>
          <div
            className="h-2 w-full rounded-sm"
            style={{
              background: 'linear-gradient(to right, #10b981 0%, #06b6d4 40%, #f59e0b 70%, #ef4444 100%)',
            }}
          />
        </div>
      )}
    </aside>
  );
}
