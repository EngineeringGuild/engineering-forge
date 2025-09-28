import React, { ReactNode, useRef } from 'react';
import { useUISounds } from '../../../hooks/useAudio';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
  animation?: 'none' | 'pulse' | 'bounce' | 'glow';
  title?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className = '',
  animation = 'none',
  title
}) => {
  const { playClick, playHover } = useUISounds();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25';
      case 'secondary':
        return 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg shadow-gray-500/25';
      case 'success':
        return 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/25';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg shadow-yellow-500/25';
      case 'danger':
        return 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/25';
      case 'ghost':
        return 'bg-transparent hover:bg-white/10 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500';
      default:
        return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'bounce':
        return 'hover:animate-bounce';
      case 'glow':
        return 'hover:shadow-xl hover:shadow-blue-500/50';
      default:
        return '';
    }
  };

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer transform hover:scale-105 active:scale-95';

  const handleClick = () => {
    if (!disabled && !loading) {
      playClick();
      onClick?.();
    }
  };

  const handleMouseEnter = () => {
    if (!disabled && !loading) {
      // Debounce hover sound to avoid spam
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = setTimeout(() => {
        playHover();
      }, 100);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || loading}
      title={title}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${getAnimationClasses()}
        ${disabledClasses}
        rounded-lg
        font-medium
        transition-all
        duration-200
        ease-out
        flex
        items-center
        justify-center
        space-x-2
        ${className}
      `}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {!loading && icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
