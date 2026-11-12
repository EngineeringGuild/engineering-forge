import React from 'react';

export interface GaugeMeterProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  warningThreshold?: number;
  dangerThreshold?: number;
  precision?: number;
  size?: number; // diameter in pixels (e.g. 140)
  className?: string;
}

/**
 * Molecule GaugeMeter:
 * Rotary analog dial with needle deflection, major/minor tick graduation,
 * color-coded warning sectors, and digital readout.
 */
export const GaugeMeter: React.FC<GaugeMeterProps> = ({
  label,
  value,
  min = 0,
  max = 100,
  unit = '',
  warningThreshold,
  dangerThreshold,
  precision = 1,
  size = 140,
  className = '',
}) => {
  const clampedVal = Math.max(min, Math.min(max, value));
  const range = max - min || 1;
  const ratio = (clampedVal - min) / range;

  // Angular range: -120deg to +120deg (240 deg total sweep)
  const START_ANGLE = -120;
  const END_ANGLE = 120;
  const SWEEP = END_ANGLE - START_ANGLE;
  const needleAngle = START_ANGLE + ratio * SWEEP;

  const radius = size * 0.42;
  const center = size / 2;

  // Determine alert status
  const isDanger = dangerThreshold !== undefined && clampedVal >= dangerThreshold;
  const isWarning = !isDanger && warningThreshold !== undefined && clampedVal >= warningThreshold;

  const statusColor = isDanger
    ? 'text-red-400'
    : isWarning
    ? 'text-amber-400'
    : 'text-cyan-400';

  const strokeColor = isDanger
    ? '#f87171'
    : isWarning
    ? '#fbbf24'
    : '#22d3ee';

  // Generate 9 major ticks along the arc
  const ticks = Array.from({ length: 9 }).map((_, i) => {
    const tRatio = i / 8;
    const angle = (START_ANGLE + tRatio * SWEEP) * (Math.PI / 180);
    const tickVal = min + tRatio * range;
    const innerR = radius - 7;
    const outerR = radius;

    const x1 = center + innerR * Math.cos(angle - Math.PI / 2);
    const y1 = center + innerR * Math.sin(angle - Math.PI / 2);
    const x2 = center + outerR * Math.cos(angle - Math.PI / 2);
    const y2 = center + outerR * Math.sin(angle - Math.PI / 2);

    return { x1, y1, x2, y2, tickVal, angle };
  });

  return (
    <div
      className={`industrial-panel relative inline-flex flex-col items-center justify-center p-3 rounded-xl border border-border/80 select-none ${className}`}
      style={{ width: size + 24 }}
    >
      <div className="font-mono text-[10px] uppercase font-bold text-fg-subtle tracking-wider mb-1 text-center">
        {label}
      </div>

      <div className="relative" style={{ width: size, height: size * 0.85 }}>
        <svg
          width={size}
          height={size * 0.85}
          viewBox={`0 0 ${size} ${size * 0.85}`}
          className="overflow-visible"
        >
          {/* Outer dial background arc */}
          <path
            d={`M ${center + radius * Math.cos((START_ANGLE - 90) * (Math.PI / 180))} ${
              center + radius * Math.sin((START_ANGLE - 90) * (Math.PI / 180))
            } A ${radius} ${radius} 0 1 1 ${
              center + radius * Math.cos((END_ANGLE - 90) * (Math.PI / 180))
            } ${center + radius * Math.sin((END_ANGLE - 90) * (Math.PI / 180))}`}
            fill="none"
            stroke="#1f2937"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Active value arc */}
          <path
            d={`M ${center + radius * Math.cos((START_ANGLE - 90) * (Math.PI / 180))} ${
              center + radius * Math.sin((START_ANGLE - 90) * (Math.PI / 180))
            } A ${radius} ${radius} 0 ${ratio > 0.5 ? 1 : 0} 1 ${
              center + radius * Math.cos((needleAngle - 90) * (Math.PI / 180))
            } ${center + radius * Math.sin((needleAngle - 90) * (Math.PI / 180))}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            className="transition-all duration-200"
          />

          {/* Graduation Ticks */}
          {ticks.map((t, idx) => (
            <line
              key={idx}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="#4b5563"
              strokeWidth="1.5"
            />
          ))}

          {/* Rotary Needle */}
          <g
            transform={`rotate(${needleAngle}, ${center}, ${center})`}
            className="transition-transform duration-200"
          >
            <polygon
              points={`${center - 2},${center} ${center},${center - radius + 2} ${center + 2},${center} ${center},${center + 6}`}
              fill={strokeColor}
            />
            <circle cx={center} cy={center} r={4.5} fill="#374151" stroke={strokeColor} strokeWidth="1.5" />
          </g>
        </svg>

        {/* Digital value readout below pivot */}
        <div className="absolute bottom-0 inset-x-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={`font-mono text-sm font-bold tracking-tight ${statusColor}`}>
            {clampedVal.toFixed(precision)}
            {unit && <span className="text-[10px] text-fg-subtle ml-0.5">{unit}</span>}
          </span>
          <span className="font-mono text-[8px] text-fg-subtle">
            {min} .. {max}
          </span>
        </div>
      </div>
    </div>
  );
};
