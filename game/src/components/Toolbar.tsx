import { useState } from 'react';
import { soundFx } from '../audio/soundFx';

export interface PickableMaterial {
  id: string;
  name: string;
  color: string;
  costPerMeter: number;
}

interface Props {
  budget: number;
  cost: number;
  materials: Record<string, PickableMaterial>;
  selectedMaterial: string;
  unlockedMaterials: string[];
  onSelectMaterial: (materialId: string) => void;
  onTest: () => void;
  onReset: () => void;
  testing: boolean;
  testLabel?: string;
}

export function Toolbar({
  budget,
  cost,
  materials,
  selectedMaterial,
  unlockedMaterials,
  onSelectMaterial,
  onTest,
  onReset,
  testing,
  testLabel = 'Test',
}: Props) {
  const overBudget = cost > budget;
  const [muted, setMuted] = useState(() => soundFx.getMuted());

  const handleToggleSound = () => {
    const isMuted = soundFx.toggleMute();
    setMuted(isMuted);
    if (!isMuted) {
      soundFx.playSnapNode();
    }
  };

  const handleMaterialClick = (id: string) => {
    soundFx.playSnapNode();
    onSelectMaterial(id);
  };

  const handleResetClick = () => {
    soundFx.playSnapNode();
    onReset();
  };

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-surface-1 border border-border px-4 py-3">
      <div className="flex flex-wrap gap-2">
        {unlockedMaterials.map((id) => {
          const material = materials[id];
          const active = selectedMaterial === id;
          return (
            <button
              key={id}
              onClick={() => handleMaterialClick(id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'border-accent bg-accent/10 text-fg'
                  : 'border-border text-fg-muted hover:text-fg'
              }`}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: material.color }}
              />
              {material.name}
              <span className="text-fg-subtle font-mono text-xs">
                ${material.costPerMeter}/m
              </span>
            </button>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={handleToggleSound}
          title={muted ? 'Unmute sound effects' : 'Mute sound effects'}
          aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-fg-muted hover:text-fg hover:border-accent transition-colors"
        >
          {muted ? '🔇' : '🔊'}
        </button>

        <div className="font-mono text-sm">
          <span className={overBudget ? 'text-danger font-semibold' : 'text-fg-muted'}>
            ${cost.toFixed(0)}
          </span>
          <span className="text-fg-subtle"> / ${budget}</span>
        </div>
        <button
          onClick={handleResetClick}
          className="rounded-lg border border-border px-3 py-2 text-sm text-fg-muted hover:text-fg transition-colors"
        >
          Reset
        </button>
        <button
          onClick={onTest}
          disabled={testing}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {testing ? 'Simulating…' : testLabel}
        </button>
      </div>
    </div>
  );
}
