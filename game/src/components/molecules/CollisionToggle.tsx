import React from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { soundFx } from '../../audio/soundFx';
import { LedIndicator } from '../atomic/LedIndicator';

export interface CollisionToggleProps {
  className?: string;
  label?: string;
  compact?: boolean;
  onChange?: (showCollisions: boolean) => void;
}

/**
 * Molecule CollisionToggle:
 * Diegetic industrial switch to toggle collision boundary and hitbox visualization
 * in the active physics simulation canvas. Consumes physicsStore directly.
 */
export const CollisionToggle: React.FC<CollisionToggleProps> = ({
  className = '',
  label = 'LIMITES DE COLISÃO',
  compact = false,
  onChange,
}) => {
  const showCollisions = usePhysicsStore((s) => s.showCollisions);
  const toggleShowCollisions = usePhysicsStore((s) => s.toggleShowCollisions);

  const handleToggle = () => {
    soundFx.playTactileClick();
    toggleShowCollisions();
    const nextState = !showCollisions;
    onChange?.(nextState);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      title="Ativar/Desativar renderização visual das fronteiras e caixas de colisão física"
      aria-pressed={showCollisions}
      className={`industrial-panel inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left transition-all cursor-pointer select-none font-mono text-xs ${
        showCollisions
          ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/50'
          : 'bg-surface-2/80 hover:bg-surface-2 border-border text-fg-muted hover:text-fg hover:border-border/80'
      } ${className}`}
    >
      <LedIndicator color={showCollisions ? 'cyan' : 'amber'} pulse={showCollisions} />

      <span className="text-sm" aria-hidden="true">
        🛡️
      </span>

      <div className="flex flex-col">
        <span className="font-bold text-[10px] tracking-wider uppercase leading-tight">
          {label}
        </span>
        {!compact && (
          <span className="text-[9px] text-fg-subtle">
            {showCollisions ? 'Boundaries Visíveis' : 'Boundaries Ocultos'}
          </span>
        )}
      </div>

      <span
        className={`ml-1 text-[9px] px-1.5 py-0.5 rounded border font-bold ${
          showCollisions
            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
            : 'bg-surface-1 text-fg-subtle border-border'
        }`}
      >
        {showCollisions ? 'ON' : 'OFF'}
      </span>
    </button>
  );
};
