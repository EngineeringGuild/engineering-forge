import React from 'react';
import { soundFx } from '../../audio/soundFx';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

/**
 * Atomic Button component utilizing the diegetic CSS `industrial-panel`
 * and `--accent` color tokens (#ff6a2c) for Engineering Forge.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'accent',
  size = 'md',
  icon,
  onClick,
  onMouseEnter,
  disabled,
  className = '',
  ...props
}) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      soundFx.playSubtleHover();
    }
    onMouseEnter?.(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      soundFx.playTactileClick();
    }
    onClick?.(e);
  };

  const baseStyle =
    'relative inline-flex items-center justify-center gap-2 font-mono font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer overflow-hidden';

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-2 text-xs',
    lg: 'px-5 py-2.5 text-sm',
  };

  const variantStyles = {
    accent:
      'industrial-panel bg-accent text-accent-foreground border border-accent/60 shadow-[0_0_12px_rgba(255,106,44,0.25)] hover:border-accent hover:shadow-[0_0_18px_rgba(255,106,44,0.4)]',
    primary:
      'industrial-panel bg-surface-2 text-info border border-info/50 shadow-[0_0_12px_rgba(25,194,214,0.2)] hover:border-info hover:text-white',
    secondary:
      'industrial-panel bg-surface-1 text-fg border border-border hover:border-accent/50 hover:text-fg',
    danger:
      'industrial-panel bg-rose-950/40 text-danger border border-danger/50 shadow-[0_0_12px_rgba(255,68,102,0.2)] hover:border-danger hover:text-white',
    ghost:
      'bg-transparent text-fg-muted hover:text-fg border border-transparent hover:bg-surface-2/40',
  };

  return (
    <button
      {...props}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="inline-flex items-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
