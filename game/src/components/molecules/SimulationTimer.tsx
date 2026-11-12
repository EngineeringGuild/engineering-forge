import React from 'react';
import { usePhysicsStore } from '../../store/physicsStore';

export interface SimulationTimerProps {
  className?: string;
  label?: string;
  showIcon?: boolean;
  compact?: boolean;
  precision?: 2 | 3;
}

/**
 * Molecule SimulationTimer:
 * Displays the current elapsed simulation time computed deterministically
 * from the physicsStore state (currentStepIndex * timeStep).
 * Formatted with industrial cyber-gauge aesthetic and tabular monospace digits.
 */
export const SimulationTimer: React.FC<SimulationTimerProps> = ({
  className = '',
  label = 'TEMPO DECORRIDO',
  showIcon = true,
  compact = false,
  precision = 2,
}) => {
  const currentStepIndex = usePhysicsStore((s) => s.currentStepIndex);
  const timeStep = usePhysicsStore((s) => s.timeStep);
  const isSimulating = usePhysicsStore((s) => s.isSimulating);
  const isPaused = usePhysicsStore((s) => s.isPaused);

  // Deterministic physical simulation elapsed time in seconds
  const elapsedSeconds = currentStepIndex * timeStep;

  // Format into MM:SS.ss
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const formattedSeconds = seconds.toFixed(precision).padStart(precision === 3 ? 6 : 5, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const timeString = `${formattedMinutes}:${formattedSeconds}`;

  return (
    <div
      className={`industrial-panel inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/80 text-fg select-none font-mono ${
        isSimulating && !isPaused
          ? 'border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
          : 'bg-surface-1/90'
      } ${className}`}
      title={`Tempo físico integrado: ${elapsedSeconds.toFixed(4)} s (${currentStepIndex} passos a Δt=${(timeStep * 1000).toFixed(1)}ms)`}
    >
      {showIcon && (
        <span
          className={`text-sm shrink-0 ${
            isSimulating && !isPaused ? 'animate-pulse text-cyan-400' : 'text-fg-subtle'
          }`}
          aria-hidden="true"
        >
          ⏱️
        </span>
      )}

      <div className="flex flex-col">
        {!compact && (
          <span className="text-[9px] font-bold text-fg-subtle tracking-wider uppercase leading-none mb-0.5">
            {label}
          </span>
        )}
        <div className="flex items-baseline gap-1">
          <span
            className={`text-sm font-bold tracking-wider tabular-nums ${
              isSimulating && !isPaused
                ? 'text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]'
                : isPaused
                ? 'text-amber-400'
                : 'text-fg-muted'
            }`}
          >
            {timeString}
          </span>
          <span className="text-[9px] text-fg-subtle">s</span>
        </div>
      </div>
    </div>
  );
};
