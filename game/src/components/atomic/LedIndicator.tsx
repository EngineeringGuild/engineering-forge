import React from 'react';

export type LedColor = 'green' | 'amber' | 'red' | 'cyan';

export interface LedIndicatorProps {
  color?: LedColor;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const COLOR_CLASSES: Record<LedColor, string> = {
  green: 'led-green',
  amber: 'led-amber',
  red: 'led-red',
  cyan: 'led-cyan',
};

const SIZE_CLASSES = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

export const LedIndicator: React.FC<LedIndicatorProps> = ({
  color = 'green',
  pulse = false,
  size = 'md',
  label,
  className = '',
}) => {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`led-indicator rounded-full ${SIZE_CLASSES[size]} ${COLOR_CLASSES[color]} ${
          pulse ? 'animate-pulse' : ''
        }`}
      />
      {label && <span className="font-mono text-xs">{label}</span>}
    </span>
  );
};
