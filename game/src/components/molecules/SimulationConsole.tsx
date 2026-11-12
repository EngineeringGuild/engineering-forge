import React, { useState, useEffect, useRef } from 'react';
import {
  type PhysicsSimulationEvent,
  type PhysicsSimulationEventType,
  SAMPLE_PHYSICS_EVENTS,
} from './simulationConsoleTypes';
import { LedIndicator } from '../atomic/LedIndicator';
import { soundFx } from '../../audio/soundFx';

export type { PhysicsSimulationEvent, PhysicsSimulationEventType };

export interface SimulationConsoleProps {
  className?: string;
  title?: string;
  events?: PhysicsSimulationEvent[];
  maxEvents?: number;
  autoScroll?: boolean;
  onClear?: () => void;
  height?: string | number;
}

const TYPE_BADGES: Record<
  PhysicsSimulationEventType,
  { label: string; bg: string; text: string; border: string }
> = {
  collision: {
    label: 'COLISÃO',
    bg: 'bg-purple-950/40',
    text: 'text-purple-300 font-bold',
    border: 'border-purple-500/40',
  },
  force: {
    label: 'FORÇA',
    bg: 'bg-amber-950/40',
    text: 'text-amber-300 font-bold',
    border: 'border-amber-500/40',
  },
  stress: {
    label: 'TENSÃO',
    bg: 'bg-red-950/40',
    text: 'text-red-300 font-bold',
    border: 'border-red-500/40',
  },
  kinematics: {
    label: 'CINEMÁTICA',
    bg: 'bg-cyan-950/40',
    text: 'text-cyan-300 font-bold',
    border: 'border-cyan-500/40',
  },
  system: {
    label: 'SISTEMA',
    bg: 'bg-surface-2',
    text: 'text-fg-muted font-bold',
    border: 'border-border',
  },
};

/**
 * Molecule SimulationConsole:
 * Displays a real-time, scrolling diagnostic terminal of physical events
 * (collisions, forces applied, stress limits, kinematics) to ensure transparency
 * into solver behavior and numerical mechanics.
 */
export const SimulationConsole: React.FC<SimulationConsoleProps> = ({
  className = '',
  title = 'CONSOLE DE EVENTOS FÍSICOS',
  events: initialEvents,
  maxEvents = 100,
  autoScroll: initialAutoScroll = true,
  onClear,
  height = 200,
}) => {
  const [internalEvents, setInternalEvents] = useState<PhysicsSimulationEvent[]>(
    SAMPLE_PHYSICS_EVENTS
  );
  const [selectedFilter, setSelectedFilter] = useState<'all' | PhysicsSimulationEventType>('all');
  const [isAutoScrollActive, setIsAutoScrollActive] = useState(initialAutoScroll);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Derive active events list directly (controlled via initialEvents or internal state)
  const activeEvents = initialEvents ? initialEvents.slice(-maxEvents) : internalEvents;

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (isAutoScrollActive && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeEvents, isAutoScrollActive]);

  const handleClear = () => {
    soundFx.playTactileClick();
    if (!initialEvents) {
      setInternalEvents([]);
    }
    onClear?.();
  };

  const filteredEvents = activeEvents.filter(
    (evt) => selectedFilter === 'all' || evt.type === selectedFilter
  );

  return (
    <div
      className={`industrial-panel rounded-xl border border-border/80 bg-surface-1/95 text-fg flex flex-col overflow-hidden font-mono text-xs shadow-xl select-none ${className}`}
    >
      {/* Console Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 px-3 border-b border-border/60 bg-surface-2/60">
        <div className="flex items-center gap-2">
          <LedIndicator color={activeEvents.length > 0 ? 'green' : 'amber'} pulse={isAutoScrollActive} />
          <span className="font-bold text-[11px] tracking-wider uppercase text-fg">
            {title}
          </span>
          <span className="text-[10px] text-fg-subtle px-1.5 py-0.2 rounded bg-surface-1 border border-border">
            {filteredEvents.length} msgs
          </span>
        </div>

        {/* Filters and Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Filter selector */}
          <div className="flex items-center gap-1">
            {(['all', 'collision', 'force', 'stress', 'system'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setSelectedFilter(filter);
                  soundFx.playSubtleHover();
                }}
                className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold transition-all cursor-pointer ${
                  selectedFilter === filter
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-fg-subtle hover:text-fg hover:bg-surface-1'
                }`}
              >
                {filter === 'all' ? 'TODOS' : filter}
              </button>
            ))}
          </div>

          <div className="text-border">|</div>

          {/* Auto-scroll toggle */}
          <button
            type="button"
            onClick={() => {
              setIsAutoScrollActive((v) => !v);
              soundFx.playTactileClick();
            }}
            title={isAutoScrollActive ? 'Pausar auto-scroll' : 'Ativar auto-scroll'}
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer border ${
              isAutoScrollActive
                ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30'
                : 'bg-surface-1 text-fg-subtle border-border'
            }`}
          >
            {isAutoScrollActive ? '▼ AUTO' : '❚❚ TRAVADO'}
          </button>

          {/* Clear button */}
          <button
            type="button"
            onClick={handleClear}
            title="Limpar logs de eventos físicos"
            className="px-1.5 py-0.5 rounded text-[9px] text-fg-subtle hover:text-red-400 hover:bg-red-950/20 border border-border transition-colors cursor-pointer"
          >
            LIMPAR
          </button>
        </div>
      </div>

      {/* Terminal Event Stream Body */}
      <div
        className="p-2.5 space-y-1.5 overflow-y-auto font-mono text-[11px] leading-relaxed"
        style={{ height }}
      >
        {filteredEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full text-fg-subtle text-[11px] italic">
            Nenhum evento físico registrado no filtro ativo.
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const badge = TYPE_BADGES[evt.type] || TYPE_BADGES.system;
            const timeStr =
              typeof evt.timestamp === 'number'
                ? `[${evt.timestamp.toFixed(2)}s]`
                : `[${evt.timestamp}]`;

            return (
              <div
                key={evt.id}
                className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 p-1 rounded bg-surface-2/40 hover:bg-surface-2/70 border border-border/30 transition-colors"
              >
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-fg-subtle tabular-nums font-semibold">
                    {timeStr}
                  </span>
                  <span
                    className={`text-[8px] px-1.5 py-0.2 rounded border uppercase tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="flex-1 flex flex-wrap items-baseline gap-2">
                  <span
                    className={`${
                      evt.severity === 'alert'
                        ? 'text-red-400 font-bold'
                        : evt.severity === 'warning'
                        ? 'text-amber-300'
                        : evt.severity === 'success'
                        ? 'text-emerald-300'
                        : 'text-fg'
                    }`}
                  >
                    {evt.message}
                  </span>

                  {evt.details && (
                    <div className="flex flex-wrap gap-1 text-[9px]">
                      {Object.entries(evt.details).map(([k, v]) => (
                        <span
                          key={k}
                          className="px-1 rounded bg-surface-1 border border-border text-fg-subtle"
                        >
                          <span className="text-fg-muted font-bold">{k}:</span> {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
