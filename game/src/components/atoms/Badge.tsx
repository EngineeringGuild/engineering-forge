import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'asme'
  | 'crypto'
  | 'neutral';

export type BadgeSize = 'xs' | 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  dotPulse?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
  default: {
    bg: 'bg-surface-2',
    text: 'text-fg-muted',
    border: 'border-border',
    dot: 'bg-fg-muted',
  },
  neutral: {
    bg: 'bg-surface-1',
    text: 'text-fg',
    border: 'border-border/80',
    dot: 'bg-fg-subtle',
  },
  accent: {
    bg: 'bg-accent/15',
    text: 'text-accent',
    border: 'border-accent/40',
    dot: 'bg-accent',
  },
  success: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    dot: 'bg-emerald-400',
  },
  warning: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
    dot: 'bg-amber-400',
  },
  danger: {
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/40',
    dot: 'bg-red-400',
  },
  asme: {
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-300 font-bold',
    border: 'border-cyan-500/50',
    dot: 'bg-cyan-400',
  },
  crypto: {
    bg: 'bg-purple-500/15',
    text: 'text-purple-300 font-bold',
    border: 'border-purple-500/50',
    dot: 'bg-purple-400',
  },
};

const SIZE_STYLES: Record<BadgeSize, string> = {
  xs: 'text-[9px] px-1.5 py-0.5 gap-1',
  sm: 'text-[11px] px-2 py-0.5 gap-1.5',
  md: 'text-xs px-2.5 py-1 gap-2',
};

/**
 * Atom Badge:
 * Diegetic industrial badge for certifications, ASME stamps, educational codes,
 * and component state tags.
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  dot = false,
  dotPulse = false,
  icon,
  children,
  className = '',
  ...props
}) => {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];

  return (
    <span
      className={`inline-flex items-center font-mono uppercase tracking-wider rounded border transition-colors select-none ${v.bg} ${v.text} ${v.border} ${s} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${v.dot} ${
            dotPulse ? 'animate-pulse' : ''
          }`}
        />
      )}
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
