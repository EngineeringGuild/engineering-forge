import React from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { soundFx } from '../../audio/soundFx';
import { PHYSICS_PRESETS, type PhysicsEnvironmentPreset } from './physicsPresetConstants';

export type { PhysicsEnvironmentPreset };

export interface PhysicsPresetsProps {
  className?: string;
  onSelectPreset?: (preset: PhysicsEnvironmentPreset) => void;
  compact?: boolean;
}

/**
 * Molecule PhysicsPresets:
 * Diegetic environmental gravitational presets for Earth, Moon, and Deep Space.
 * Updates the global physicsStore gravity vector and provides tactile feedback.
 */
export const PhysicsPresets: React.FC<PhysicsPresetsProps> = ({
  className = '',
  onSelectPreset,
  compact = false,
}) => {
  const currentGravity = usePhysicsStore((s) => s.gravity);
  const setGravity = usePhysicsStore((s) => s.setGravity);

  const handleSelect = (preset: PhysicsEnvironmentPreset) => {
    soundFx.playTactileClick();
    setGravity(preset.gravity);
    onSelectPreset?.(preset);
  };

  return (
    <div
      className={`industrial-panel p-2.5 rounded-xl border border-border/80 text-fg select-none ${className}`}
    >
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-border/60">
        <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-fg-subtle">
          AMBIENTE GRAVITACIONAL
        </span>
        <span className="font-mono text-[10px] text-cyan-400 font-bold px-1.5 py-0.2 bg-surface-2 rounded border border-border">
          g = {currentGravity.toFixed(2)} m/s²
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {PHYSICS_PRESETS.map((preset) => {
          const isActive = Math.abs(currentGravity - preset.gravity) < 0.05;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelect(preset)}
              title={preset.description}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all cursor-pointer font-mono ${
                isActive
                  ? 'bg-accent/20 border-accent text-fg font-bold shadow-[0_0_10px_rgba(255,106,44,0.3)] ring-1 ring-accent'
                  : 'bg-surface-2/80 hover:bg-surface-2 border-border text-fg-muted hover:text-fg hover:border-border/80'
              }`}
            >
              <span className="text-base mb-0.5">{preset.icon}</span>
              <span className="text-[11px] leading-tight font-bold">
                {preset.label}
              </span>
              {!compact && (
                <span className="text-[9px] text-fg-subtle mt-0.5">
                  {preset.gravity.toFixed(2)} m/s²
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
