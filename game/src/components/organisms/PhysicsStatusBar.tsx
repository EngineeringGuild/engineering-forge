import React from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { LedIndicator } from '../atomic/LedIndicator';
import { Badge } from '../atoms/Badge';
import { SimulationTimer } from '../molecules/SimulationTimer';
import { Button } from '../atoms/Button';
import { soundFx } from '../../audio/soundFx';

export interface PhysicsStatusBarProps {
  className?: string;
  compact?: boolean;
  showTimer?: boolean;
  showControls?: boolean;
  onTogglePlay?: (isSimulating: boolean, isPaused: boolean) => void;
  onReset?: () => void;
}

/**
 * Organism PhysicsStatusBar:
 * Comprehensive industrial horizontal container displaying active simulation status,
 * LED indicator, gravity metric, simulation speed multiplier, time step,
 * and deterministic elapsed simulation timer.
 */
export const PhysicsStatusBar: React.FC<PhysicsStatusBarProps> = ({
  className = '',
  compact = false,
  showTimer = true,
  showControls = false,
  onTogglePlay,
  onReset,
}) => {
  const gravity = usePhysicsStore((s) => s.gravity);
  const timeScale = usePhysicsStore((s) => s.timeScale);
  const timeStep = usePhysicsStore((s) => s.timeStep);
  const isPaused = usePhysicsStore((s) => s.isPaused);
  const isSimulating = usePhysicsStore((s) => s.isSimulating);
  const currentStepIndex = usePhysicsStore((s) => s.currentStepIndex);

  const startSimulation = usePhysicsStore((s) => s.startSimulation);
  const togglePause = usePhysicsStore((s) => s.togglePause);
  const resetSimulationState = usePhysicsStore((s) => s.resetSimulationState);

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

  return (
    <div
      className={`industrial-panel flex flex-wrap items-center justify-between gap-3 p-2.5 px-3.5 rounded-xl border border-border/80 bg-surface-1/95 text-fg font-mono text-xs shadow-md ${className}`}
    >
      {/* Left: Active Simulation Status Indicator & LED */}
      <div className="flex items-center gap-2.5">
        <LedIndicator
          color={!isSimulating ? 'amber' : isPaused ? 'red' : 'green'}
          pulse={isSimulating && !isPaused}
        />
        <div className="flex flex-col">
          <span className="font-bold text-[11px] tracking-wider uppercase leading-none text-fg">
            SIMULAÇÃO FÍSICA
          </span>
          <span className="text-[9px] text-fg-subtle mt-0.5">
            {!isSimulating
              ? 'STANDBY • MOTOR EM ESPERA'
              : isPaused
              ? 'EM PAUSA • CONGELAMENTO TEMPORAL'
              : 'ATIVO • INTEGRAÇÃO NEWTONIANA'}
          </span>
        </div>

        <Badge
          variant={!isSimulating ? 'neutral' : isPaused ? 'warning' : 'success'}
          size="xs"
          dot
          className="ml-1"
        >
          {!isSimulating ? 'STANDBY' : isPaused ? 'PAUSADO' : 'RUNNING (60 FPS)'}
        </Badge>
      </div>

      {/* Middle: Live Physical Readouts (Gravity & Speed & Delta T) */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Gravity Readout */}
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-2 border border-border"
          title="Aceleração gravitacional vetorial"
        >
          <span className="text-[10px] text-fg-subtle uppercase">g:</span>
          <span className="text-cyan-400 font-bold tabular-nums">
            {gravity.toFixed(2)}
          </span>
          <span className="text-[9px] text-fg-subtle">m/s²</span>
        </div>

        {/* Speed Multiplier Readout */}
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-2 border border-border"
          title="Multiplicador de velocidade de reprodução física"
        >
          <span className="text-[10px] text-fg-subtle uppercase">Vel:</span>
          <span className="text-amber-400 font-bold tabular-nums">
            {timeScale}x
          </span>
        </div>

        {/* Physics TimeStep (Delta T) */}
        {!compact && (
          <div
            className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-surface-2 border border-border"
            title="Passo de discretização física fixo"
          >
            <span className="text-[10px] text-fg-subtle uppercase">Δt:</span>
            <span className="text-emerald-400 font-bold tabular-nums">
              {(timeStep * 1000).toFixed(1)}
            </span>
            <span className="text-[9px] text-fg-subtle">ms</span>
          </div>
        )}

        {/* Steps Executed */}
        {!compact && (
          <div
            className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-surface-2 border border-border"
            title="Passos numéricos acumulados"
          >
            <span className="text-[10px] text-fg-subtle uppercase">Steps:</span>
            <span className="text-fg font-bold tabular-nums">
              #{currentStepIndex}
            </span>
          </div>
        )}

        {/* Elapsed Simulation Timer Molecule */}
        {showTimer && <SimulationTimer compact precision={2} />}
      </div>

      {/* Right: Optional Quick Transport Controls */}
      {showControls && (
        <div className="flex items-center gap-1.5">
          <Button
            variant={!isSimulating || isPaused ? 'primary' : 'secondary'}
            size="sm"
            onClick={handlePlayPause}
          >
            {!isSimulating ? '▶ Iniciar' : isPaused ? '▶ Continuar' : '⏸ Pausar'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            title="Resetar estado da simulação"
          >
            ↺
          </Button>
        </div>
      )}
    </div>
  );
};
