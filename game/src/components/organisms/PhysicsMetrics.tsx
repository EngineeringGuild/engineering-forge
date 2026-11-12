import React from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { SevenSegmentDisplay } from '../atomic/SevenSegmentDisplay';
import { LedIndicator } from '../atomic/LedIndicator';
import { PhysicsControls } from './PhysicsControls';
import { PhysicsPresets } from '../molecules/PhysicsPresets';
import { CollisionToggle } from '../molecules/CollisionToggle';
import { SimulationConsole } from '../molecules/SimulationConsole';
import { Button } from '../atoms/Button';
import { soundFx } from '../../audio/soundFx';

export interface PhysicsMetricsProps {
  className?: string;
  showControls?: boolean;
  showConsole?: boolean;
}

/**
 * Organism PhysicsMetrics:
 * Renders real-time gravity and simulation speed metrics from physicsStore
 * enclosed in a diegetic industrial-panel container with status indicators,
 * environmental gravity presets (Earth, Moon, Deep Space), collision boundary toggles,
 * integrated transport controls, and an expandable SimulationConsole diagnostic terminal.
 */
export const PhysicsMetrics: React.FC<PhysicsMetricsProps> = ({
  className = '',
  showControls = true,
  showConsole = false,
}) => {
  const [consoleOpen, setConsoleOpen] = React.useState(showConsole);
  const gravity = usePhysicsStore((s) => s.gravity);
  const timeScale = usePhysicsStore((s) => s.timeScale);
  const timeStep = usePhysicsStore((s) => s.timeStep);
  const isPaused = usePhysicsStore((s) => s.isPaused);
  const isSimulating = usePhysicsStore((s) => s.isSimulating);
  const currentStepIndex = usePhysicsStore((s) => s.currentStepIndex);
  const events = usePhysicsStore((s) => s.events);
  const clearSimulationEvents = usePhysicsStore((s) => s.clearSimulationEvents);


  return (
    <div
      className={`industrial-panel rounded-xl p-4 border border-border/80 text-fg space-y-3 shadow-xl ${className}`}
    >
      {/* Header Telemetry Status */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <LedIndicator
            color={!isSimulating ? 'amber' : isPaused ? 'red' : 'green'}
            pulse={isSimulating && !isPaused}
          />
          <span className="font-mono text-xs uppercase tracking-wider font-bold text-fg">
            FÍSICA • PARÂMETROS TEMPORAIS & GRAVIDADE
          </span>
        </div>

        <span className="font-mono text-[10px] text-fg-subtle px-1.5 py-0.5 rounded bg-surface-2 border border-border">
          {isSimulating ? (isPaused ? 'EM PAUSA' : 'SIMULANDO (60 FPS)') : 'STANDBY'}
        </span>
      </div>

      {/* Numerical Telemetry Readouts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <SevenSegmentDisplay
          label="GRAVIDADE (g)"
          value={gravity.toFixed(2)}
          unit="m/s²"
          color="cyan"
          size="sm"
        />

        <SevenSegmentDisplay
          label="ESCALA TEMPORAL"
          value={`${timeScale}x`}
          unit=""
          color="amber"
          size="sm"
        />

        <SevenSegmentDisplay
          label="PASSO DE FÍSICA (Δt)"
          value={(timeStep * 1000).toFixed(1)}
          unit="ms"
          color="green"
          size="sm"
        />

        <SevenSegmentDisplay
          label="STEPS EXECUTADOS"
          value={currentStepIndex}
          unit=""
          color="cyan"
          size="sm"
        />
      </div>

      {/* Environmental Gravity Presets & Collision Boundary Visualization Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1">
          <PhysicsPresets compact />
        </div>
        <div className="flex items-center justify-end">
          <CollisionToggle compact />
        </div>
      </div>

      {/* Integrated Physics Controls Transport Deck */}
      {showControls && (
        <div className="pt-2 border-t border-border/40">
          <PhysicsControls compact />
        </div>
      )}

      {/* Physics Event Telemetry Console Toggle & Expandable Terminal */}
      <div className="pt-2 border-t border-border/40">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              soundFx.playSnapNode();
              setConsoleOpen(!consoleOpen);
            }}
            className="text-[11px] font-mono text-fg-subtle hover:text-accent flex items-center gap-2 p-1 px-2"
          >
            <span>{consoleOpen ? '▼' : '▶'}</span>
            <span>TERMINAL DE EVENTOS FÍSICOS</span>
            <span className="px-1.5 py-0.2 rounded bg-surface-2 border border-border text-[9px] text-accent">
              {events.length}
            </span>
          </Button>

          {consoleOpen && (
            <span className="text-[10px] text-fg-subtle font-mono">
              STREAM EM TEMPO REAL
            </span>
          )}
        </div>

        {consoleOpen && (
          <div className="mt-2 animate-fadeIn">
            <SimulationConsole
              events={events}
              onClear={clearSimulationEvents}
              height={190}
              title="TELEMETRIA • MOTOR FÍSICO"
            />
          </div>
        )}
      </div>
    </div>
  );
};
