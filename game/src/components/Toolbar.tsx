import { MATERIALS } from '../physics/materials';

interface Props {
  budget: number;
  cost: number;
  selectedMaterial: string;
  unlockedMaterials: string[];
  onSelectMaterial: (materialId: string) => void;
  onTest: () => void;
  onReset: () => void;
  testing: boolean;
}

export function Toolbar({
  budget,
  cost,
  selectedMaterial,
  unlockedMaterials,
  onSelectMaterial,
  onTest,
  onReset,
  testing,
}: Props) {
  const overBudget = cost > budget;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-surface-1 border border-border px-4 py-3">
      <div className="flex gap-2">
        {unlockedMaterials.map((id) => {
          const material = MATERIALS[id];
          const active = selectedMaterial === id;
          return (
            <button
              key={id}
              onClick={() => onSelectMaterial(id)}
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

      <div className="ml-auto flex items-center gap-4">
        <div className="font-mono text-sm">
          <span className={overBudget ? 'text-danger' : 'text-fg-muted'}>
            ${cost.toFixed(0)}
          </span>
          <span className="text-fg-subtle"> / ${budget}</span>
        </div>
        <button
          onClick={onReset}
          className="rounded-lg border border-border px-3 py-2 text-sm text-fg-muted hover:text-fg"
        >
          Reset
        </button>
        <button
          onClick={onTest}
          disabled={testing}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {testing ? 'Testing…' : 'Test Bridge'}
        </button>
      </div>
    </div>
  );
}
