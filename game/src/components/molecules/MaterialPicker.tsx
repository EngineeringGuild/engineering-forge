import React from 'react';
import { MATERIALS, type Material } from '../../physics/materials';
import { soundFx } from '../../audio/soundFx';

export interface MaterialPickerProps {
  selectedMaterialId: string;
  allowedMaterialIds?: string[];
  onSelectMaterial: (materialId: string) => void;
  className?: string;
}

export const MaterialPicker: React.FC<MaterialPickerProps> = ({
  selectedMaterialId,
  allowedMaterialIds,
  onSelectMaterial,
  className = '',
}) => {
  const materials = Object.values(MATERIALS).filter(
    (m) => !allowedMaterialIds || allowedMaterialIds.includes(m.id)
  );

  return (
    <div className={`space-y-2 font-mono ${className}`}>
      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
        Seleção de Material Estrutural
      </span>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {materials.map((mat: Material) => {
          const isSelected = selectedMaterialId === mat.id;
          return (
            <button
              key={mat.id}
              type="button"
              onClick={() => {
                soundFx.playTactileClick();
                onSelectMaterial(mat.id);
              }}
              onMouseEnter={() => soundFx.playSubtleHover()}
              className={`p-2 rounded-lg border text-left transition-all active:scale-95 cursor-pointer ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-400 shadow-md shadow-amber-950/40 text-white'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: mat.color }}
                />
                <span className="font-bold text-xs truncate">{mat.name}</span>
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>E: {(mat.youngsModulus / 1e9).toFixed(0)} GPa</span>
                <span className="text-emerald-400 font-bold">${mat.costPerMeter}/m</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
