import { useState } from 'react';
import type { TrussBuildMetrics, CircuitBuildMetrics, VehicleBuildMetrics } from '../physics/buildModePhysics';

export interface BuildModePhysicsHUDProps {
  discipline: 'structures' | 'circuits' | 'vehicles';
  trussMetrics?: TrussBuildMetrics;
  circuitMetrics?: CircuitBuildMetrics;
  vehicleMetrics?: VehicleBuildMetrics;
  showCoGMarker?: boolean;
  onToggleCoGMarker?: () => void;
  heatmapEnabled?: boolean;
  onToggleHeatmap?: () => void;
  playbackSpeed?: number;
  onSpeedChange?: (speed: number) => void;
  className?: string;
}

export function BuildModePhysicsHUD({
  discipline,
  trussMetrics,
  circuitMetrics,
  vehicleMetrics,
  showCoGMarker = true,
  onToggleCoGMarker,
  heatmapEnabled = true,
  onToggleHeatmap,
  playbackSpeed,
  onSpeedChange,
  className = '',
}: BuildModePhysicsHUDProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (discipline === 'structures' && trussMetrics) {
    const isCritical = trussMetrics.stressStatus === 'critical' || trussMetrics.failingMembersCount > 0;
    const isElevated = trussMetrics.stressStatus === 'elevated';
    const isNominal = trussMetrics.stressStatus === 'nominal';

    const stressColor = isCritical
      ? 'text-red-400 border-red-500/30 bg-red-950/20'
      : isElevated
        ? 'text-amber-400 border-amber-500/30 bg-amber-950/20'
        : isNominal
          ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20'
          : 'text-fg-muted border-border bg-surface-2/40';

    if (collapsed) {
      return (
        <button
          onClick={() => setCollapsed(false)}
          title="Expand Build Telemetry HUD"
          aria-label="Expand Build Telemetry HUD"
          className={`flex items-center gap-2 rounded-xl border border-border/80 bg-surface-base/90 backdrop-blur px-3 py-1.5 font-mono text-xs shadow-lg hover:border-accent transition-all ${className}`}
        >
          <span className="text-accent">⚖️</span>
          <span className="text-fg font-semibold">{trussMetrics.totalMassKg} kg</span>
          <span className="text-fg-subtle">·</span>
          <span className="text-fg-muted">CoG ({trussMetrics.cog.x}, {trussMetrics.cog.y})</span>
          <span className="text-fg-subtle">·</span>
          <span className={stressColor.split(' ')[0]}>
            {trussMetrics.isStable ? `${trussMetrics.peakStressPercent}% Stress` : 'Unstable'}
          </span>
          <span className="text-[10px] text-fg-subtle ml-1">▼</span>
        </button>
      );
    }

    return (
      <div
        className={`flex flex-col rounded-2xl border border-border/80 bg-surface-base/95 backdrop-blur-md p-3.5 shadow-2xl transition-all font-sans text-fg w-72 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="text-accent text-sm">⚖️</span>
            <div>
              <h4 className="text-xs font-bold tracking-tight text-fg">Statics & Physics Telemetry</h4>
              <p className="text-[10px] text-fg-subtle">Build Mode Live Feed</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onToggleHeatmap && (
              <button
                onClick={onToggleHeatmap}
                title={heatmapEnabled ? 'Disable structural stress heatmap' : 'Enable structural stress heatmap (Blue=Safe -> Red=Critical Failure Risk)'}
                className={`rounded px-1.5 py-0.5 text-[10px] font-mono transition-colors border ${
                  heatmapEnabled
                    ? 'border-red-500/50 bg-red-950/30 text-red-400 font-semibold'
                    : 'border-border text-fg-subtle hover:text-fg'
                }`}
              >
                🌡 Heatmap {heatmapEnabled ? 'ON' : 'OFF'}
              </button>
            )}
            {onToggleCoGMarker && (
              <button
                onClick={onToggleCoGMarker}
                title={showCoGMarker ? 'Hide CoG crosshair on canvas' : 'Show CoG crosshair on canvas'}
                className={`rounded px-1.5 py-0.5 text-[10px] font-mono transition-colors border ${
                  showCoGMarker
                    ? 'border-accent/40 bg-accent/10 text-accent font-semibold'
                    : 'border-border text-fg-subtle hover:text-fg'
                }`}
              >
                CoG
              </button>
            )}
            <button
              onClick={() => setCollapsed(true)}
              title="Collapse HUD"
              aria-label="Collapse HUD"
              className="rounded p-1 text-fg-subtle hover:text-fg transition-colors"
            >
              <span className="text-xs">▲</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2.5">
          {/* Total Mass */}
          <div className="flex flex-col rounded-lg bg-surface-1/70 border border-border/50 p-2">
            <span className="text-[10px] uppercase tracking-wider text-fg-subtle font-medium">Total Mass</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-base font-bold text-fg tabular-nums">
                {trussMetrics.totalMassKg}
              </span>
              <span className="text-[10px] text-fg-subtle font-mono">kg</span>
            </div>
            <span className="text-[9px] text-fg-subtle font-mono mt-0.5">
              {trussMetrics.memberMassKg}kg bars · {trussMetrics.jointMassKg}kg pins
            </span>
          </div>

          {/* Center of Gravity */}
          <div className="flex flex-col rounded-lg bg-surface-1/70 border border-border/50 p-2">
            <span className="text-[10px] uppercase tracking-wider text-fg-subtle font-medium">Center of Gravity</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-xs font-bold text-fg tabular-nums">
                X: {trussMetrics.cog.x}m
              </span>
              <span className="text-fg-subtle font-mono">/</span>
              <span className="font-mono text-xs font-bold text-fg tabular-nums">
                Y: {trussMetrics.cog.y}m
              </span>
            </div>
            {/* Balance Bar */}
            <div className="mt-1 flex items-center gap-1.5">
              <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden flex">
                <div
                  className="bg-accent/80 h-full transition-all duration-300"
                  style={{ width: `${trussMetrics.leftWeightPercent}%` }}
                />
                <div
                  className="bg-cyan-500/80 h-full transition-all duration-300"
                  style={{ width: `${trussMetrics.rightWeightPercent}%` }}
                />
              </div>
              <span className="text-[8px] font-mono text-fg-subtle shrink-0">
                {trussMetrics.leftWeightPercent}%:{trussMetrics.rightWeightPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Structural Dead-Load Stress & Determinacy */}
        <div className="mt-2 flex flex-col gap-1.5 rounded-lg border border-border/60 bg-surface-1/40 p-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-fg-muted font-medium">Dead-Load Stress Utilization:</span>
            <span className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded border ${stressColor}`}>
              {trussMetrics.isStable ? `${trussMetrics.peakStressPercent}% Peak` : 'Mechanism'}
            </span>
          </div>

          {/* Maxwell Determinacy Status */}
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/40">
            <span className="text-fg-subtle">Determinacy:</span>
            <span
              className={`font-mono font-medium ${
                trussMetrics.determinacyDiff === 0
                  ? 'text-emerald-400'
                  : trussMetrics.determinacyDiff > 0
                    ? 'text-cyan-400'
                    : 'text-amber-400'
              }`}
            >
              {trussMetrics.determinacyLabel}
            </span>
          </div>

          {/* Members / Joint Counter */}
          <div className="flex items-center justify-between text-[10px] text-fg-subtle font-mono">
            <span>{trussMetrics.memberCount} members · {trussMetrics.jointCount} joints</span>
            {trussMetrics.criticalMembersCount > 0 && (
              <span className="text-amber-400 font-semibold">{trussMetrics.criticalMembersCount} near yield</span>
            )}
          </div>
        </div>

        {/* Visual Heatmap Stress Scale Legend */}
        {heatmapEnabled && (
          <div className="mt-2 flex flex-col gap-1 rounded-lg border border-border/60 bg-surface-1/40 p-2 text-[10px] font-mono">
            <div className="flex items-center justify-between text-fg-subtle">
              <span>Stress Heatmap:</span>
              <span className="text-red-400 font-bold">Red = Critical Risk</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-blue-600 via-emerald-500 via-amber-500 to-red-500" />
            <div className="flex justify-between text-[9px] text-fg-subtle">
              <span>0% Safe</span>
              <span>50%</span>
              <span>75%</span>
              <span className="text-red-400">100%+ Yield Fail</span>
            </div>
          </div>
        )}

        {/* Simulation Time-Scale Slider in HUD */}
        {onSpeedChange && playbackSpeed !== undefined && (
          <div className="mt-2 flex flex-col gap-1 rounded-lg border border-border/60 bg-surface-1/40 p-2 text-xs">
            <div className="flex items-center justify-between text-[11px] text-fg-muted font-medium">
              <span>Simulation Time-Scale:</span>
              <span className="font-mono font-bold text-accent tabular-nums">{playbackSpeed}x</span>
            </div>
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={
                playbackSpeed === 0.25 ? 0 :
                playbackSpeed === 0.5 ? 1 :
                playbackSpeed === 1 ? 2 : 3
              }
              onChange={(e) => {
                const speeds = [0.25, 0.5, 1, 2] as const;
                onSpeedChange(speeds[Number(e.target.value)]);
              }}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-3 accent-accent"
              aria-label="Simulation time-scale slider"
              title={`Simulation speed: ${playbackSpeed}x (0.25x, 0.5x, 1x, 2x)`}
            />
            <div className="flex justify-between text-[9px] font-mono text-fg-subtle px-0.5">
              {[0.25, 0.5, 1, 2].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => onSpeedChange(spd)}
                  className={`hover:text-accent transition-colors ${
                    playbackSpeed === spd ? 'text-accent font-bold' : ''
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (discipline === 'circuits' && circuitMetrics) {
    if (collapsed) {
      return (
        <button
          onClick={() => setCollapsed(false)}
          title="Expand Circuit Telemetry HUD"
          aria-label="Expand Circuit Telemetry HUD"
          className={`flex items-center gap-2 rounded-xl border border-border/80 bg-surface-base/90 backdrop-blur px-3 py-1.5 font-mono text-xs shadow-lg hover:border-accent transition-all ${className}`}
        >
          <span className="text-accent">⚡</span>
          <span className="text-fg font-semibold">{circuitMetrics.estimatedPowerWatts} W</span>
          <span className="text-fg-subtle">·</span>
          <span className="text-fg-muted">{circuitMetrics.totalResistanceEstimate} Ω</span>
          <span className="text-[10px] text-fg-subtle ml-1">▼</span>
        </button>
      );
    }

    return (
      <div
        className={`flex flex-col rounded-2xl border border-border/80 bg-surface-base/95 backdrop-blur-md p-3.5 shadow-2xl transition-all font-sans text-fg w-64 ${className}`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="text-accent text-sm">⚡</span>
            <div>
              <h4 className="text-xs font-bold text-fg">Circuit Telemetry</h4>
              <p className="text-[10px] text-fg-subtle">Build Mode Preview</p>
            </div>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="rounded p-1 text-fg-subtle hover:text-fg transition-colors"
          >
            <span className="text-xs">▲</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2.5">
          <div className="flex flex-col rounded-lg bg-surface-1/70 border border-border/50 p-2">
            <span className="text-[10px] text-fg-subtle uppercase">Power Preview</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-base font-bold text-fg tabular-nums">
                {circuitMetrics.estimatedPowerWatts}
              </span>
              <span className="text-[10px] text-fg-subtle font-mono">W</span>
            </div>
          </div>
          <div className="flex flex-col rounded-lg bg-surface-1/70 border border-border/50 p-2">
            <span className="text-[10px] text-fg-subtle uppercase">Resistance</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-base font-bold text-fg tabular-nums">
                {circuitMetrics.totalResistanceEstimate}
              </span>
              <span className="text-[10px] text-fg-subtle font-mono">Ω</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (discipline === 'vehicles' && vehicleMetrics) {
    if (collapsed) {
      return (
        <button
          onClick={() => setCollapsed(false)}
          title="Expand Vehicle Telemetry HUD"
          aria-label="Expand Vehicle Telemetry HUD"
          className={`flex items-center gap-2 rounded-xl border border-border/80 bg-surface-base/90 backdrop-blur px-3 py-1.5 font-mono text-xs shadow-lg hover:border-accent transition-all ${className}`}
        >
          <span className="text-accent">🏎️</span>
          <span className="text-fg font-semibold">{vehicleMetrics.totalMassKg} kg</span>
          <span className="text-fg-subtle">·</span>
          <span className="text-fg-muted">{vehicleMetrics.powerToWeightHpPerTon} hp/t</span>
          <span className="text-[10px] text-fg-subtle ml-1">▼</span>
        </button>
      );
    }

    return (
      <div
        className={`flex flex-col rounded-2xl border border-border/80 bg-surface-base/95 backdrop-blur-md p-3.5 shadow-2xl transition-all font-sans text-fg w-64 ${className}`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="text-accent text-sm">🏎️</span>
            <div>
              <h4 className="text-xs font-bold text-fg">Vehicle Dynamics</h4>
              <p className="text-[10px] text-fg-subtle">Chassis & Power Telemetry</p>
            </div>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="rounded p-1 text-fg-subtle hover:text-fg transition-colors"
          >
            <span className="text-xs">▲</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2.5">
          <div className="flex flex-col rounded-lg bg-surface-1/70 border border-border/50 p-2">
            <span className="text-[10px] text-fg-subtle uppercase">Curb Mass</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-base font-bold text-fg tabular-nums">
                {vehicleMetrics.totalMassKg}
              </span>
              <span className="text-[10px] text-fg-subtle font-mono">kg</span>
            </div>
          </div>
          <div className="flex flex-col rounded-lg bg-surface-1/70 border border-border/50 p-2">
            <span className="text-[10px] text-fg-subtle uppercase">Power/Weight</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-base font-bold text-fg tabular-nums">
                {vehicleMetrics.powerToWeightHpPerTon}
              </span>
              <span className="text-[10px] text-fg-subtle font-mono">hp/t</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
