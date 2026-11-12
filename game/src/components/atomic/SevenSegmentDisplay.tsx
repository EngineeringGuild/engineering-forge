import React from 'react';

export interface SevenSegmentDisplayProps {
  value: string | number;
  label?: string;
  unit?: string;
  color?: 'amber' | 'cyan' | 'green' | 'red';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const COLOR_CLASSES = {
  amber: 'text-amber-400 border-amber-500/30 bg-amber-950/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
  cyan: 'text-cyan-300 border-cyan-500/30 bg-cyan-950/20 shadow-[0_0_12px_rgba(6,182,212,0.15)]',
  green: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20 shadow-[0_0_12px_rgba(34,197,94,0.15)]',
  red: 'text-rose-400 border-rose-500/30 bg-rose-950/20 shadow-[0_0_12px_rgba(239,68,68,0.15)]',
};

const SIZE_CLASSES = {
  sm: 'text-sm py-1 px-2',
  md: 'text-lg py-1.5 px-3',
  lg: 'text-2xl py-2 px-4',
};

export const SevenSegmentDisplay: React.FC<SevenSegmentDisplayProps> = ({
  value,
  label,
  unit,
  color = 'cyan',
  size = 'md',
  className = '',
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">
          {label}
        </span>
      )}
      <div
        className={`font-mono font-bold tracking-widest rounded border flex items-baseline justify-between select-none ${COLOR_CLASSES[color]} ${SIZE_CLASSES[size]}`}
      >
        <span>{value}</span>
        {unit && <span className="text-[10px] ml-1.5 opacity-70 font-normal">{unit}</span>}
      </div>
    </div>
  );
};
