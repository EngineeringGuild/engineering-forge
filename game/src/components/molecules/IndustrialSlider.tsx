import React from 'react';
import { soundFx } from '../../audio/soundFx';

export interface IndustrialSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  accentColor?: 'cyan' | 'amber' | 'emerald' | 'rose';
  onChange: (value: number) => void;
  className?: string;
}

const ACCENT_CLASSES = {
  cyan: 'accent-cyan-400 text-cyan-300',
  amber: 'accent-amber-400 text-amber-300',
  emerald: 'accent-emerald-400 text-emerald-300',
  rose: 'accent-rose-400 text-rose-300',
};

export const IndustrialSlider: React.FC<IndustrialSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  accentColor = 'cyan',
  onChange,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 font-mono ${className}`}>
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400 font-semibold uppercase text-[11px]">{label}</span>
        <span className={`font-bold ${ACCENT_CLASSES[accentColor]}`}>
          {value} {unit}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          soundFx.playSubtleHover();
          onChange(parseFloat(e.target.value));
        }}
        className={`w-full cursor-pointer h-1.5 bg-slate-900 rounded-lg ${ACCENT_CLASSES[accentColor]}`}
      />
    </div>
  );
};
