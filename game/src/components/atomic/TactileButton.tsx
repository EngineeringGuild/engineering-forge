import React from 'react';
import { soundFx } from '../../audio/soundFx';

export interface TactileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  soundType?: 'click' | 'mode' | 'subtle';
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  soundType = 'click',
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
      if (soundType === 'mode') soundFx.playModeSwitch();
      else soundFx.playTactileClick();
    }
    onClick?.(e);
  };

  const baseStyle =
    'inline-flex items-center justify-center gap-1.5 font-mono font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-2 text-xs',
    lg: 'px-5 py-2.5 text-sm',
  };

  const variantStyles = {
    primary:
      'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20 active:bg-cyan-600',
    secondary:
      'bg-surface-2 hover:bg-surface-2/90 text-fg border border-border hover:border-accent/60',
    accent:
      'bg-accent hover:bg-accent/90 text-accent-foreground shadow-md shadow-accent/25',
    danger:
      'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40',
    ghost:
      'bg-transparent hover:bg-surface-2/60 text-fg-muted hover:text-fg border border-transparent',
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
      {children}
    </button>
  );
};
