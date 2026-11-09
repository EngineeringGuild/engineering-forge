import { soundFx } from '../audio/soundFx';

interface SimulationControlPanelProps {
  isSimulating: boolean;
  isPaused: boolean;
  playbackSpeed: number;
  animProgress?: number; // 0 to 1
  heatmapEnabled: boolean;
  vectorsEnabled: boolean;
  metricsEnabled: boolean;
  durationSeconds?: number;
  onTogglePlayPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onScrub?: (progress: number) => void;
  onToggleHeatmap: () => void;
  onToggleVectors: () => void;
  onToggleMetrics: () => void;
}

export function SimulationControlPanel({
  isSimulating,
  isPaused,
  playbackSpeed,
  animProgress = 0,
  heatmapEnabled,
  vectorsEnabled,
  metricsEnabled,
  durationSeconds = 3.2,
  onTogglePlayPause,
  onReset,
  onSpeedChange,
  onScrub,
  onToggleHeatmap,
  onToggleVectors,
  onToggleMetrics,
}: SimulationControlPanelProps) {
  const currentTime = (animProgress * durationSeconds).toFixed(2);
  const totalTime = durationSeconds.toFixed(2);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-surface-1/95 p-2.5 px-3 font-mono text-xs shadow-lg backdrop-blur-md">
      {/* Primary Playback Transport Controls */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            soundFx.playSnapNode();
            onTogglePlayPause();
          }}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold transition-colors border ${
            isPaused
              ? 'border-accent bg-accent/20 text-accent hover:bg-accent/30'
              : 'border-border bg-surface-2 text-fg hover:border-accent hover:text-accent'
          }`}
          title={isPaused ? 'Resume Simulation (Space)' : 'Pause Simulation (Space)'}
          aria-label={isPaused ? 'Play' : 'Pause'}
        >
          {isSimulating && !isPaused && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
          <span>{isPaused ? '▶' : '⏸'}</span>
          <span>{isPaused ? 'Play' : 'Pause'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playSnapNode();
            onReset();
          }}
          className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-fg hover:border-accent hover:text-accent transition-colors"
          title="Reset Simulation to Initial State without clearing bridge"
          aria-label="Reset simulation"
        >
          <span>↺</span>
          <span>Reset</span>
        </button>

        {/* Simulation Time-Scale Slider (0.25x, 0.5x, 1x, 2x) */}
        <div className="flex flex-col gap-1 min-w-[136px] rounded-lg border border-border bg-surface-2 px-2.5 py-1">
          <div className="flex items-center justify-between text-[10px] text-fg-subtle">
            <span>Speed</span>
            <span className="font-bold text-accent font-mono tabular-nums">{playbackSpeed}x</span>
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
              const chosen = speeds[Number(e.target.value)];
              soundFx.playSnapNode();
              onSpeedChange(chosen);
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
                onClick={() => {
                  soundFx.playSnapNode();
                  onSpeedChange(spd);
                }}
                className={`hover:text-accent transition-colors ${
                  playbackSpeed === spd ? 'text-accent font-bold' : ''
                }`}
                title={`Set speed to ${spd}x`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Timeline Scrubber */}
      {onScrub !== undefined && animProgress !== undefined && (
        <div className="flex flex-1 min-w-[180px] items-center gap-2 px-1">
          <span className="text-[11px] text-fg-muted min-w-[32px] text-right">
            {currentTime}s
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(animProgress * 100)}
            onChange={(e) => onScrub(Number(e.target.value) / 100)}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-3 accent-accent"
            aria-label="Simulation progress scrubber"
            title="Drag to scrub through simulation time"
          />
          <span className="text-[11px] text-fg-subtle min-w-[32px]">
            {totalTime}s
          </span>
        </div>
      )}

      {/* Feature Toggles: Heatmap, Force Vectors, Real-Time Metrics */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            soundFx.playSnapNode();
            onToggleHeatmap();
          }}
          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
            heatmapEnabled
              ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-400'
              : 'border-border bg-surface-2 text-fg-muted hover:text-fg'
          }`}
          title="Toggle structural stress color heatmap (Blue to Red)"
          aria-pressed={heatmapEnabled}
        >
          <span>🌡</span>
          <span>Heatmap {heatmapEnabled ? 'ON' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playSnapNode();
            onToggleVectors();
          }}
          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
            vectorsEnabled
              ? 'border-cyan-500/60 bg-cyan-950/40 text-cyan-400'
              : 'border-border bg-surface-2 text-fg-muted hover:text-fg'
          }`}
          title="Toggle active force vectors (Tension/Compression arrows)"
          aria-pressed={vectorsEnabled}
        >
          <span>↗</span>
          <span>Vectors {vectorsEnabled ? 'ON' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playSnapNode();
            onToggleMetrics();
          }}
          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
            metricsEnabled
              ? 'border-accent/60 bg-accent/20 text-accent'
              : 'border-border bg-surface-2 text-fg-muted hover:text-fg'
          }`}
          title="Toggle live telemetry & structural stress metrics overlay"
          aria-pressed={metricsEnabled}
        >
          <span>📊</span>
          <span>Metrics {metricsEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </div>
  );
}
