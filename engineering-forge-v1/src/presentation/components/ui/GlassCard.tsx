import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'strong' | 'colored';
  hover?: boolean;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  glow = false
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'subtle':
        return 'bg-white/5 backdrop-blur-sm border border-white/10';
      case 'strong':
        return 'bg-white/20 backdrop-blur-md border border-white/30';
      case 'colored':
        return 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-white/20';
      default:
        return 'bg-white/10 backdrop-blur-md border border-white/20';
    }
  };

  const hoverClasses = hover
    ? 'hover:bg-white/15 hover:border-white/30 hover:shadow-lg hover:shadow-white/10 hover:-translate-y-1'
    : '';

  const glowClasses = glow ? 'shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/30' : '';

  return (
    <div
      className={`
        ${getVariantClasses()}
        ${hoverClasses}
        ${glowClasses}
        rounded-xl
        transition-all
        duration-300
        ease-out
        ${className}
      `}
    >
      {children}
    </div>
  );
};
