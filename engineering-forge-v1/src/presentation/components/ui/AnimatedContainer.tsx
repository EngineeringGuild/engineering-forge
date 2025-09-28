import React, { ReactNode } from 'react';

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'bounce';
  delay?: number;
  duration?: number;
  trigger?: 'onMount' | 'onHover' | 'onClick';
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  className = '',
  animation = 'fadeIn',
  delay = 0,
  duration = 300,
  trigger: _trigger = 'onMount'
}) => {
  const getAnimationClasses = () => {
    const baseClasses = 'transition-all ease-out';
    const durationClass = `duration-${duration}`;

    switch (animation) {
      case 'fadeIn':
        return `${baseClasses} ${durationClass} opacity-0 animate-fade-in`;
      case 'slideUp':
        return `${baseClasses} ${durationClass} transform translate-y-4 opacity-0 animate-slide-up`;
      case 'slideDown':
        return `${baseClasses} ${durationClass} transform -translate-y-4 opacity-0 animate-slide-down`;
      case 'slideLeft':
        return `${baseClasses} ${durationClass} transform translate-x-4 opacity-0 animate-slide-left`;
      case 'slideRight':
        return `${baseClasses} ${durationClass} transform -translate-x-4 opacity-0 animate-slide-right`;
      case 'scale':
        return `${baseClasses} ${durationClass} transform scale-95 opacity-0 animate-scale-in`;
      case 'bounce':
        return `${baseClasses} ${durationClass} transform scale-95 opacity-0 animate-bounce-in`;
      default:
        return `${baseClasses} ${durationClass}`;
    }
  };

  const style = {
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`
  };

  return (
    <div className={`${getAnimationClasses()} ${className}`} style={style}>
      {children}
    </div>
  );
};
