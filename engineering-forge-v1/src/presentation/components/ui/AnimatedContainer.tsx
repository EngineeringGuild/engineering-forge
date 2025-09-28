import React, { ReactNode, useEffect, useState } from 'react';

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
  trigger = 'onMount'
}) => {
  const [isVisible, setIsVisible] = useState(trigger === 'onMount');
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (trigger === 'onMount') {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [trigger, delay]);

  const handleMouseEnter = () => {
    if (trigger === 'onHover') {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'onHover') {
      setIsHovered(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'onClick') {
      setIsClicked(!isClicked);
    }
  };

  const shouldAnimate =
    trigger === 'onMount'
      ? isVisible
      : trigger === 'onHover'
        ? isHovered
        : trigger === 'onClick'
          ? isClicked
          : false;
  const getAnimationClasses = () => {
    const baseClasses = 'transition-all ease-out';
    const durationClass = `duration-${duration}`;

    if (!shouldAnimate) {
      return `${baseClasses} ${durationClass} opacity-0`;
    }

    switch (animation) {
      case 'fadeIn':
        return `${baseClasses} ${durationClass} opacity-100 animate-fade-in`;
      case 'slideUp':
        return `${baseClasses} ${durationClass} transform translate-y-0 opacity-100 animate-slide-up`;
      case 'slideDown':
        return `${baseClasses} ${durationClass} transform translate-y-0 opacity-100 animate-slide-down`;
      case 'slideLeft':
        return `${baseClasses} ${durationClass} transform translate-x-0 opacity-100 animate-slide-left`;
      case 'slideRight':
        return `${baseClasses} ${durationClass} transform translate-x-0 opacity-100 animate-slide-right`;
      case 'scale':
        return `${baseClasses} ${durationClass} transform scale-100 opacity-100 animate-scale-in`;
      case 'bounce':
        return `${baseClasses} ${durationClass} transform scale-100 opacity-100 animate-bounce-in`;
      default:
        return `${baseClasses} ${durationClass} opacity-100`;
    }
  };

  const style = {
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`
  };

  return (
    <div
      className={`${getAnimationClasses()} ${className}`}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};
