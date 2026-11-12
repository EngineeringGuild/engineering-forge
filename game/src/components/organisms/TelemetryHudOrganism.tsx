import React from 'react';
import { Button } from '../atoms/Button';
import { StressMeter } from '../molecules/StressMeter';

export interface TelemetryHudOrganismProps {
  systemName: string;
  discipline: string;
  utilization: number;
  safetyFactor: number;
  budgetUsed: number;
  budgetLimit: number;
  onSimulate: () => void;
  onReset: () => void;
  isSimulating?: boolean;
  className?: string;
}

/**
 * Organism component combining atoms (Button, status badges) and molecules (StressMeter)
 * into a cohesive diegetic telemetry cockpit panel.
 */
export const TelemetryHudOrganism: React.FC<TelemetryHudOrganismProps> = ({
  systemName,
  discipline,
  utilization,
  safetyFactor,
  budgetUsed,
  budgetLimit,
  onSimulate,
  onReset,
  isSimulating = false,
  className = '',
}) => {
  return (
    <div
      className={`industrial-panel rounded-xl p-4 border border-border/80 text-fg space-y-4 shadow-xl ${className}`}
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-semibold block">
            {discipline} TELEMETRY HUD
          </span>
          <h3 className="font-mono font-bold text-sm text-fg">{systemName}</h3>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-fg-subtle text-[11px]">STATUS: ONLINE</span>
        </div>
      </div>

      {/* Stress molecule */}
      <StressMeter utilization={utilization} />

      {/* Numerical readouts */}
      <div className="grid grid-cols-2 gap-2 font-mono text-xs">
        <div className="p-2 bg-surface-2/60 rounded border border-border/60">
          <span className="text-[10px] text-fg-subtle block uppercase">Fator de Seg. (SF)</span>
          <span
            className={`text-sm font-bold ${
              safetyFactor >= 1.5 ? 'text-success' : safetyFactor >= 1.0 ? 'text-warning' : 'text-danger'
            }`}
          >
            {safetyFactor.toFixed(2)}
          </span>
        </div>

        <div className="p-2 bg-surface-2/60 rounded border border-border/60">
          <span className="text-[10px] text-fg-subtle block uppercase">Orçamento</span>
          <span
            className={`text-sm font-bold ${
              budgetUsed <= budgetLimit ? 'text-info' : 'text-danger'
            }`}
          >
            ${budgetUsed} / ${budgetLimit}
          </span>
        </div>
      </div>

      {/* Action buttons (Atoms) */}
      <div className="pt-2 border-t border-border/40 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onReset} disabled={isSimulating}>
          Reiniciar
        </Button>
        <Button
          variant="accent"
          size="sm"
          onClick={onSimulate}
          disabled={isSimulating}
          icon={<span>▶</span>}
        >
          {isSimulating ? 'Simulando...' : 'Iniciar Teste'}
        </Button>
      </div>
    </div>
  );
};
