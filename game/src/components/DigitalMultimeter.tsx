import { useState, useMemo } from 'react';
import { soundFx } from '../audio/soundFx';

export type MultimeterMode = 'voltage' | 'current' | 'resistance' | 'continuity';

export interface MultimeterProbePoint {
  id: string;
  label: string;
  voltageV: number;
  currentA?: number;
}

interface DigitalMultimeterProps {
  nodes: Array<{ id: string; x: number; y: number }>;
  nodalVoltages?: Record<string, number>;
  branchCurrents?: Record<string, number>;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function DigitalMultimeter({
  nodes,
  nodalVoltages = {},
  branchCurrents = {},
  isOpen,
  onClose,
  className = '',
}: DigitalMultimeterProps) {
  const [mode, setMode] = useState<MultimeterMode>('voltage');
  const [redProbeNodeId, setRedProbeNodeId] = useState<string | null>(null);
  const [blackProbeNodeId, setBlackProbeNodeId] = useState<string | null>(null);
  const [heldDisplay, setHeldDisplay] = useState(false);

  // Available probe node choices
  const nodeOptions = useMemo(() => {
    return nodes.map((n) => ({
      id: n.id,
      label: `Node ${n.id} (${n.x.toFixed(1)}, ${n.y.toFixed(1)})`,
      voltage: nodalVoltages[n.id] ?? 0,
    }));
  }, [nodes, nodalVoltages]);

  // Measurement calculations
  const measurement = useMemo(() => {
    if (!redProbeNodeId && !blackProbeNodeId) {
      return { value: 0, unit: 'V', label: 'LEADS OPEN', isOverload: false, isShort: false };
    }

    const vRed = redProbeNodeId ? (nodalVoltages[redProbeNodeId] ?? 0) : 0;
    const vBlack = blackProbeNodeId ? (nodalVoltages[blackProbeNodeId] ?? 0) : 0;

    if (mode === 'voltage') {
      const deltaV = vRed - vBlack;
      return {
        value: deltaV,
        unit: 'V',
        label: `${deltaV >= 0 ? '+' : ''}${deltaV.toFixed(2)} V DC`,
        isOverload: Math.abs(deltaV) > 1000,
        isShort: false,
      };
    }

    if (mode === 'current') {
      // Find branch current between red and black nodes if connected directly
      let iA = 0;
      if (redProbeNodeId && blackProbeNodeId) {
        const key1 = `${redProbeNodeId}-${blackProbeNodeId}`;
        const key2 = `${blackProbeNodeId}-${redProbeNodeId}`;
        iA = branchCurrents[key1] ?? branchCurrents[key2] ?? 0;
      }
      return {
        value: iA,
        unit: 'A',
        label: `${iA >= 0 ? '+' : ''}${iA.toFixed(3)} A`,
        isOverload: Math.abs(iA) > 20,
        isShort: false,
      };
    }

    if (mode === 'resistance' || mode === 'continuity') {
      if (!redProbeNodeId || !blackProbeNodeId) {
        return { value: Infinity, unit: 'Ω', label: 'O.L MΩ', isOverload: true, isShort: false };
      }
      if (redProbeNodeId === blackProbeNodeId) {
        return { value: 0, unit: 'Ω', label: '0.00 Ω (SHORT)', isOverload: false, isShort: true };
      }
      const deltaV = Math.abs(vRed - vBlack);
      const key1 = `${redProbeNodeId}-${blackProbeNodeId}`;
      const key2 = `${blackProbeNodeId}-${redProbeNodeId}`;
      const iA = Math.abs(branchCurrents[key1] ?? branchCurrents[key2] ?? 0);

      const r = iA > 0.0001 ? deltaV / iA : 9999;
      const isShort = r < 0.5;

      return {
        value: r,
        unit: 'Ω',
        label: r >= 9999 ? 'O.L MΩ' : `${r.toFixed(2)} Ω`,
        isOverload: r >= 9999,
        isShort,
      };
    }

    return { value: 0, unit: '', label: '0.00', isOverload: false, isShort: false };
  }, [mode, redProbeNodeId, blackProbeNodeId, nodalVoltages, branchCurrents]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="digital-multimeter"
      className={`relative flex w-80 flex-col rounded-2xl border-2 border-amber-500/80 bg-zinc-950 p-4 font-mono shadow-2xl backdrop-blur-md text-fg ${className}`}
    >
      {/* Multimeter Top Bezel / Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          <span className="font-bold text-xs tracking-wider text-amber-400">
            DMM-8000 TRUE RMS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHeldDisplay((h) => !h)}
            title="Hold Screen"
            className={`rounded px-1.5 py-0.5 text-[9px] font-bold border transition-colors ${
              heldDisplay
                ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300'
                : 'border-zinc-700 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            HOLD
          </button>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:text-zinc-100 transition-colors"
            title="Close Multimeter"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Retro 7-Segment LCD Digital Display */}
      <div className="mt-3 rounded-xl border-2 border-emerald-950 bg-emerald-950/80 p-3 shadow-inner">
        <div className="flex items-center justify-between text-[10px] text-emerald-400/70">
          <span>{mode.toUpperCase()} MODE</span>
          <span>{heldDisplay ? 'HOLD ACTIVE' : 'LIVE'}</span>
        </div>
        <div className="my-1 flex items-baseline justify-between font-mono">
          <span className="text-3xl font-extrabold text-emerald-300 tracking-wider tabular-nums drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
            {heldDisplay ? '---' : measurement.label}
          </span>
          <span className="text-sm font-bold text-emerald-400">{measurement.unit}</span>
        </div>
        <div className="flex items-center justify-between text-[9px] text-emerald-500/80">
          <span>CAT III 600V</span>
          {measurement.isShort && <span className="font-bold text-amber-300">⚡ CONTINUITY BEEP</span>}
          {measurement.isOverload && <span className="font-bold text-red-400">OVERLOAD</span>}
        </div>
      </div>

      {/* Mode Rotary Dial Buttons */}
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {(['voltage', 'current', 'resistance', 'continuity'] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              soundFx.playSnapNode();
              setMode(m);
            }}
            className={`flex flex-col items-center justify-center rounded-lg p-1.5 text-[10px] font-bold border transition-all ${
              mode === m
                ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-sm'
                : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
            }`}
          >
            <span>{m === 'voltage' ? 'V⎓' : m === 'current' ? 'A⎓' : m === 'resistance' ? 'Ω' : '🔊'}</span>
            <span className="text-[8px] uppercase tracking-tighter mt-0.5">{m.slice(0, 4)}</span>
          </button>
        ))}
      </div>

      {/* Virtual Probe Terminal Attachment Selectors */}
      <div className="mt-3 flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-[11px]">
        {/* Red Probe (+) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-[70px]">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
            <span className="font-bold text-red-400 text-[10px]">RED (+)</span>
          </div>
          <select
            value={redProbeNodeId ?? ''}
            onChange={(e) => {
              soundFx.playSnapNode();
              setRedProbeNodeId(e.target.value || null);
            }}
            className="flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-[10px] text-zinc-200 focus:outline-none focus:border-red-500"
          >
            <option value="">-- Disconnected --</option>
            {nodeOptions.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label} [{n.voltage.toFixed(1)}V]
              </option>
            ))}
          </select>
        </div>

        {/* Black Probe (-) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-[70px]">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-400 shadow-[0_0_6px_rgba(161,161,170,0.6)]" />
            <span className="font-bold text-zinc-300 text-[10px]">BLACK (-)</span>
          </div>
          <select
            value={blackProbeNodeId ?? ''}
            onChange={(e) => {
              soundFx.playSnapNode();
              setBlackProbeNodeId(e.target.value || null);
            }}
            className="flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-[10px] text-zinc-200 focus:outline-none focus:border-zinc-400"
          >
            <option value="">-- Ground / Disconnected --</option>
            {nodeOptions.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label} [{n.voltage.toFixed(1)}V]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Action Presets */}
      <div className="mt-2.5 flex items-center justify-between text-[10px] text-zinc-400 px-1">
        <button
          onClick={() => {
            setRedProbeNodeId(null);
            setBlackProbeNodeId(null);
          }}
          className="hover:text-amber-400 transition-colors"
        >
          Reset Leads
        </button>
        <span className="text-zinc-600">•</span>
        <span>Accuracy: ±0.05%</span>
      </div>
    </div>
  );
}
