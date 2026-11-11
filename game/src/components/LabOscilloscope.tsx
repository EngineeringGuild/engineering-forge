import { useState, useMemo } from 'react';

export interface ScopeDataPoint {
  timeS: number;
  channelA: number; // e.g. Deflection, Speed, or Voltage
  channelB?: number; // e.g. Force, Acceleration, or Current
}

interface LabOscilloscopeProps {
  title?: string;
  channelALabel: string;
  channelAUnit: string;
  channelBLabel?: string;
  channelBUnit?: string;
  data: ScopeDataPoint[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function LabOscilloscope({
  title = 'Digital Storage Oscilloscope (DSO)',
  channelALabel,
  channelAUnit,
  channelBLabel,
  channelBUnit,
  data,
  isOpen,
  onClose,
  className = '',
}: LabOscilloscopeProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [timeDivIndex, setTimeDivIndex] = useState(2); // index in time scales

  const timeDivs = [0.1, 0.25, 0.5, 1.0, 2.0];
  const currentTimeDiv = timeDivs[timeDivIndex];

  // Channel statistics
  const stats = useMemo(() => {
    if (data.length === 0) {
      return {
        aMax: 0,
        aMin: 0,
        aAvg: 0,
        bMax: 0,
        bMin: 0,
        bAvg: 0,
      };
    }

    const aVals = data.map((d) => d.channelA);
    const aMax = Math.max(...aVals);
    const aMin = Math.min(...aVals);
    const aAvg = aVals.reduce((acc, v) => acc + v, 0) / aVals.length;

    let bMax = 0;
    let bMin = 0;
    let bAvg = 0;
    if (channelBLabel) {
      const bVals = data.map((d) => d.channelB ?? 0);
      bMax = Math.max(...bVals);
      bMin = Math.min(...bVals);
      bAvg = bVals.reduce((acc, v) => acc + v, 0) / bVals.length;
    }

    return { aMax, aMin, aAvg, bMax, bMin, bAvg };
  }, [data, channelBLabel]);

  // SVG waveform path generation
  const { pathA, pathB } = useMemo(() => {
    if (data.length < 2) return { pathA: '', pathB: '' };

    const svgWidth = 320;
    const svgHeight = 140;
    const padding = 10;

    const tMax = Math.max(1, data[data.length - 1].timeS);
    const tMin = 0;

    // Normalize Channel A
    const aVals = data.map((d) => d.channelA);
    const aMax = Math.max(1, Math.max(...aVals));
    const aMin = Math.min(0, Math.min(...aVals));
    const aSpan = aMax - aMin || 1;

    // Generate Path A
    const pointsA = data.map((d) => {
      const x = padding + ((d.timeS - tMin) / (tMax - tMin)) * (svgWidth - 2 * padding);
      const y = svgHeight - padding - ((d.channelA - aMin) / aSpan) * (svgHeight - 2 * padding);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    let pointsB: string[] = [];
    if (channelBLabel) {
      const bVals = data.map((d) => d.channelB ?? 0);
      const bMax = Math.max(1, Math.max(...bVals));
      const bMin = Math.min(0, Math.min(...bVals));
      const bSpan = bMax - bMin || 1;

      pointsB = data.map((d) => {
        const x = padding + ((d.timeS - tMin) / (tMax - tMin)) * (svgWidth - 2 * padding);
        const y = svgHeight - padding - (((d.channelB ?? 0) - bMin) / bSpan) * (svgHeight - 2 * padding);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      });
    }

    return {
      pathA: `M ${pointsA.join(' L ')}`,
      pathB: pointsB.length > 0 ? `M ${pointsB.join(' L ')}` : '',
    };
  }, [data, channelBLabel]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="lab-oscilloscope"
      className={`relative flex w-96 flex-col rounded-2xl border-2 border-cyan-500/80 bg-zinc-950 p-4 font-mono shadow-2xl backdrop-blur-md text-fg ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span className="font-bold text-xs tracking-wider text-cyan-400">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPaused((p) => !p)}
            className={`rounded px-1.5 py-0.5 text-[9px] font-bold border transition-colors ${
              isPaused
                ? 'border-amber-400 bg-amber-950/60 text-amber-300'
                : 'border-emerald-500 bg-emerald-950/40 text-emerald-400'
            }`}
          >
            {isPaused ? 'FREEZE' : 'RUN'}
          </button>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:text-zinc-100 transition-colors"
            title="Close Oscilloscope"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Phosphor CRT / LCD Waveform Display */}
      <div className="mt-3 relative rounded-xl border border-cyan-900/60 bg-zinc-900/90 overflow-hidden shadow-inner">
        {/* Reticle / Graticule Grid Lines */}
        <svg viewBox="0 0 320 140" className="w-full h-36 select-none">
          <defs>
            <pattern id="scope-grid" width="32" height="28" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="32" y2="0" stroke="#0e3a42" strokeWidth="0.8" />
              <line x1="0" y1="0" x2="0" y2="28" stroke="#0e3a42" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#scope-grid)" />

          {/* Center Crosshairs */}
          <line x1="0" y1="70" x2="320" y2="70" stroke="#164e63" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="160" y1="0" x2="160" y2="140" stroke="#164e63" strokeWidth="1" strokeDasharray="2 2" />

          {/* Channel A Waveform (Cyan Glow) */}
          {pathA && (
            <path
              d={pathA}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_4px_rgba(34,211,238,0.7)]"
            />
          )}

          {/* Channel B Waveform (Amber Glow) */}
          {pathB && (
            <path
              d={pathB}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_4px_rgba(251,191,36,0.7)]"
            />
          )}
        </svg>

        {/* Floating Readout Overlay */}
        <div className="absolute top-1.5 left-2 flex items-center gap-3 text-[10px] pointer-events-none">
          <span className="text-cyan-300 font-bold drop-shadow-[0_0_4px_rgba(34,211,238,0.6)]">
            CH1: {channelALabel}
          </span>
          {channelBLabel && (
            <span className="text-amber-300 font-bold drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]">
              CH2: {channelBLabel}
            </span>
          )}
        </div>
      </div>

      {/* Telemetry Metrics & Statistics */}
      <div className="mt-2.5 grid grid-cols-2 gap-2 text-[10px]">
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-2">
          <div className="flex items-center justify-between text-cyan-400 font-bold">
            <span>CH1 ({channelAUnit})</span>
            <span>Peak: {stats.aMax.toFixed(1)}</span>
          </div>
          <div className="flex justify-between text-zinc-400 text-[9px] mt-0.5">
            <span>Avg: {stats.aAvg.toFixed(1)}</span>
            <span>Min: {stats.aMin.toFixed(1)}</span>
          </div>
        </div>

        {channelBLabel ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-2">
            <div className="flex items-center justify-between text-amber-400 font-bold">
              <span>CH2 ({channelBUnit})</span>
              <span>Peak: {stats.bMax.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-zinc-400 text-[9px] mt-0.5">
              <span>Avg: {stats.bAvg.toFixed(1)}</span>
              <span>Min: {stats.bMin.toFixed(1)}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/40 p-2 text-zinc-500 text-[10px]">
            CH2 OFF
          </div>
        )}
      </div>

      {/* Timebase Control & Sampling Controls */}
      <div className="mt-2 flex items-center justify-between border-t border-zinc-800 pt-2 text-[10px]">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <span>Timebase:</span>
          <button
            onClick={() => setTimeDivIndex((i) => Math.max(0, i - 1))}
            className="rounded bg-zinc-800 px-1 hover:text-zinc-200"
          >
            -
          </button>
          <span className="font-bold text-cyan-300 font-mono">{currentTimeDiv}s/div</span>
          <button
            onClick={() => setTimeDivIndex((i) => Math.min(timeDivs.length - 1, i + 1))}
            className="rounded bg-zinc-800 px-1 hover:text-zinc-200"
          >
            +
          </button>
        </div>

        <span className="text-[9px] text-zinc-500">
          {data.length} pts @ 60 Hz
        </span>
      </div>
    </div>
  );
}
