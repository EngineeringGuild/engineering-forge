import React from 'react';

export interface StressMeterProps {
  utilization: number; // 0.0 to 1.0 (or > 1.0 if failed)
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export const StressMeter: React.FC<StressMeterProps> = ({
  utilization,
  label = 'Tensão FEA (σ/σadm)',
  showPercentage = true,
  className = '',
}) => {
  const percent = Math.min(100, Math.round(utilization * 100));
  const isOverload = utilization >= 1.0;
  const isHigh = utilization >= 0.75;

  const barColor = isOverload
    ? 'bg-rose-500 shadow-[0_0_8px_#ef4444]'
    : isHigh
    ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
    : 'bg-emerald-500 shadow-[0_0_8px_#22c55e]';

  return (
    <div className={`space-y-1 font-mono ${className}`}>
      <div className="flex justify-between items-center text-[10px] text-slate-400">
        <span>{label}</span>
        {showPercentage && (
          <span
            className={`font-bold ${
              isOverload
                ? 'text-rose-400 animate-pulse'
                : isHigh
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {isOverload ? 'SOBRECARGA (100%+)' : `${percent}%`}
          </span>
        )}
      </div>

      <div className="w-full bg-slate-900 border border-slate-800 h-2 rounded-full overflow-hidden p-[1px]">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
