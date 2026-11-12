import React from 'react';
import { soundFx } from '../../audio/soundFx';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  unit?: string;
  error?: string;
  variant?: 'default' | 'accent' | 'compact';
}

/**
 * Atomic Input component utilizing the diegetic CSS `industrial-panel`
 * and `--accent` color tokens (#ff6a2c) for Engineering Forge.
 * Designed for precise numerical entries, coordinate inputs, and text fields in levels.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      unit,
      error,
      variant = 'default',
      className = '',
      type = 'text',
      onFocus,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (!disabled) {
        soundFx.playSubtleHover();
      }
      onFocus?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
    };

    const sizeClasses =
      variant === 'compact' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-xs sm:text-sm';

    return (
      <div className="w-full space-y-1 font-mono">
        {label && (
          <label className="block text-[11px] uppercase tracking-wider text-fg-subtle font-semibold">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <input
            {...props}
            ref={ref}
            type={type}
            disabled={disabled}
            onFocus={handleFocus}
            onChange={handleChange}
            className={`industrial-panel w-full rounded-lg border border-border bg-surface-1 text-fg placeholder:text-fg-subtle/50 outline-none transition-all ${
              error
                ? 'border-danger/80 focus:border-danger shadow-[0_0_8px_rgba(255,68,102,0.25)]'
                : 'focus:border-accent focus:shadow-[0_0_10px_rgba(255,106,44,0.3)]'
            } disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${
              unit ? 'pr-10' : ''
            } ${className}`}
          />

          {unit && (
            <span className="absolute right-3 text-xs text-fg-subtle pointer-events-none select-none font-bold">
              {unit}
            </span>
          )}
        </div>

        {error && (
          <p className="text-[10px] text-danger font-mono font-medium animate-pulse">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
