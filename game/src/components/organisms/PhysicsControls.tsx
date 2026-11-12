import React from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { LedIndicator } from '../atomic/LedIndicator';
import { soundFx } from '../../audio/soundFx';

export interface PhysicsControlsProps {
  className?: string;
  onReset?: () => void;
  onTogglePlay?: (isSimulating: boolean, isPaused: boolean) => void;
  compact?: boolean;
  showSpeedSelectors?: boolean;
  showStepButton?: boolean;
}

/**
 * Organism PhysicsControls:
 * Diegetic industrial control deck that connects directly to physicsStore.
 * Provides controls for play/pause toggling, step-by-step physics integration,
 * simulation reset, and temporal speed scaling.
 */
export const PhysicsControls: React.FC<PhysicsControlsProps> = ({
  className = '',
  onReset,
  onTogglePlay,
  compact = false,
  showSpeedSelectors = true,
  showStepButton = true,
}) => {
  const isSimulating = usePhysicsStore((s) => s.isSimulating);
  const isPaused = usePhysicsStore((s) => s.isPaused);
  const timeScale = usePhysicsStore((s) => s.timeScale);
  const currentStepIndex = usePhysicsStore((s) => s.currentStepIndex);

  const startSimulation = usePhysicsStore((s) => s.startSimulation);
  const togglePause = usePhysicsStore((s) => s.togglePause);
  const resetSimulationState = usePhysicsStore((s) => s.resetSimulationState);
  const stepSimulationOnce = usePhysicsStore((s) => s.stepSimulationOnce);
  const setTimeScale = usePhysicsStore((s) => s.setTimeScale);

  const handlePlayPause = () => {
    soundFx.playModeSwitch();
    if (!isSimulating) {
      startSimulation();
      onTogglePlay?.(true, false);
    } else {
      togglePause();
      onTogglePlay?.(true, !isPaused);
    }
  };

  const handleReset = () => {
    soundFx.playTactileClick();
    resetSimulationState();
    onReset?.();
  };

  const handleStep = () => {
    soundFx.playTactileClick();
    stepSimulationOnce();
  };

  return (
    <div
      className={`industrial-panel rounded-xl border border-border/80 bg-surface-1/95 p-3 text-fg shadow-lg ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        {/* Status indicator and label */}
        <div className="flex items-center gap-2">
          <LedIndicator
            color={!isSimulating ? 'amber' : isPaused ? 'red' : 'green'}
            pulse={isSimulating && !isPaused}
          />
          <span className="font-bold uppercase tracking-wider text-[11px] text-fg">
            CONTROLE DE SIMULAÇÃO
          </span>
          <Badge
            variant={!isSimulating ? 'neutral' : isPaused ? 'warning' : 'success'}
            size="xs"
            dot
          >
            {!isSimulating ? 'STANDBY' : isPaused ? 'EM PAUSA' : 'EM EXECUÇÃO'}
          </Badge>
          {!compact && isSimulating && (
            <span className="text-[10px] text-fg-subtle">
              Passo: #{currentStepIndex}
            </span>
          )}
        </div>

        {/* Speed selectors */}
        {showSpeedSelectors && (
          <div className="flex items-center gap-1 bg-surface-2/80 px-2 py-1 rounded-lg border border-border">
            <span className="text-[10px] text-fg-subtle mr-1">VELOCIDADE:</span>
            {([0.25, 0.5, 1, 2] as const).map((scale) => (
              <button
                key={scale}
                type="button"
                onClick={() => {
                  soundFx.playSubtleHover();
                  setTimeScale(scale);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  timeScale === scale
                    ? 'bg-accent text-accent-foreground shadow-[0_0_8px_rgba(255,106,44,0.35)]'
                    : 'text-fg-subtle hover:text-fg hover:bg-surface-1'
                }`}
              >
                {scale}x
              </button>
            ))}
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2">
          {showStepButton && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleStep}
              disabled={!isSimulating || !isPaused}
              title="Avançar 1 passo temporal (Δt)"
            >
              Passo +1
            </Button>
          )}

          <Button
            variant={!isSimulating || isPaused ? 'primary' : 'secondary'}
            size="sm"
            onClick={handlePlayPause}
            className="min-w-[100px]"
          >
            {!isSimulating
              ? '▶ Iniciar'
              : isPaused
              ? '▶ Continuar'
              : '⏸ Pausar'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            title="Resetar estado da simulação física"
          >
            ↺ Reset
          </Button>
        </div>
      </div>
    </div>
  );
};
