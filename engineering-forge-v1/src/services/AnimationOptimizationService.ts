/**
 * Animation Optimization Service
 * Provides utilities for optimizing animations and transitions for smooth 60fps
 */

interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  fillMode?: 'forwards' | 'backwards' | 'both' | 'none';
  iterationCount?: number | 'infinite';
}

export class AnimationOptimizationService {
  private static instance: AnimationOptimizationService;
  private isReducedMotion = false;
  private animationQueue: Animation[] = [];
  private maxConcurrentAnimations = 10;

  static getInstance(): AnimationOptimizationService {
    if (!AnimationOptimizationService.instance) {
      AnimationOptimizationService.instance = new AnimationOptimizationService();
    }
    return AnimationOptimizationService.instance;
  }

  constructor() {
    this.checkReducedMotion();
  }

  /**
   * Check if user prefers reduced motion
   */
  private checkReducedMotion(): void {
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Create optimized animation
   */
  createAnimation(element: Element, keyframes: Keyframe[], config: AnimationConfig): Animation {
    // Respect reduced motion preference
    if (this.isReducedMotion) {
      return this.createReducedMotionAnimation(element, keyframes, config);
    }

    // Limit concurrent animations
    if (this.animationQueue.length >= this.maxConcurrentAnimations) {
      this.cleanupOldAnimations();
    }

    const animation = element.animate(keyframes, {
      duration: config.duration,
      easing: config.easing,
      delay: config.delay || 0,
      fill: config.fillMode || 'both',
      iterations: typeof config.iterationCount === 'number' ? config.iterationCount : 1
    });

    // Add to queue
    this.animationQueue.push(animation);

    // Clean up when finished
    animation.addEventListener('finish', () => {
      this.removeFromQueue(animation);
    });

    return animation;
  }

  /**
   * Create reduced motion animation
   */
  private createReducedMotionAnimation(
    element: Element,
    keyframes: Keyframe[],
    _config: AnimationConfig
  ): Animation {
    // For reduced motion, use instant transitions
    const reducedKeyframes = keyframes.map(keyframe => ({
      ...keyframe,
      offset: keyframe.offset || 1
    }));

    return element.animate(reducedKeyframes, {
      duration: 0,
      fill: 'both'
    });
  }

  /**
   * Remove animation from queue
   */
  private removeFromQueue(animation: Animation): void {
    const index = this.animationQueue.indexOf(animation);
    if (index > -1) {
      this.animationQueue.splice(index, 1);
    }
  }

  /**
   * Clean up old animations
   */
  private cleanupOldAnimations(): void {
    // Remove finished animations
    this.animationQueue = this.animationQueue.filter(animation => {
      if (animation.playState === 'finished') {
        animation.cancel();
        return false;
      }
      return true;
    });

    // If still too many, cancel oldest ones
    while (this.animationQueue.length >= this.maxConcurrentAnimations) {
      const oldestAnimation = this.animationQueue.shift();
      if (oldestAnimation) {
        oldestAnimation.cancel();
      }
    }
  }

  /**
   * Create smooth transition
   */
  createTransition(
    element: Element,
    properties: Record<string, string>,
    duration: number = 300
  ): Promise<void> {
    return new Promise(resolve => {
      if (this.isReducedMotion) {
        // Apply changes instantly for reduced motion
        Object.assign((element as HTMLElement).style, properties);
        resolve();
        return;
      }

      // Set transition properties
      (element as HTMLElement).style.transition = `all ${duration}ms ease-in-out`;

      // Apply changes
      Object.assign((element as HTMLElement).style, properties);

      // Wait for transition to complete
      const handleTransitionEnd = () => {
        element.removeEventListener('transitionend', handleTransitionEnd);
        resolve();
      };

      element.addEventListener('transitionend', handleTransitionEnd);

      // Fallback timeout
      setTimeout(() => {
        element.removeEventListener('transitionend', handleTransitionEnd);
        resolve();
      }, duration + 100);
    });
  }

  /**
   * Create staggered animation
   */
  createStaggeredAnimation(
    elements: Element[],
    keyframes: Keyframe[],
    config: AnimationConfig,
    staggerDelay: number = 50
  ): Animation[] {
    return elements.map((element, index) => {
      const delay = (config.delay || 0) + index * staggerDelay;
      return this.createAnimation(element, keyframes, {
        ...config,
        delay
      });
    });
  }

  /**
   * Create parallax effect
   */
  createParallaxEffect(element: Element, speed: number = 0.5): () => void {
    if (this.isReducedMotion) {
      return () => {}; // No parallax for reduced motion
    }

    let ticking = false;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -speed;

      (element as HTMLElement).style.transform = `translateY(${rate}px)`;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Return cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }

  /**
   * Create smooth scroll
   */
  smoothScrollTo(target: Element | number, duration: number = 500): Promise<void> {
    return new Promise(resolve => {
      if (this.isReducedMotion) {
        // Instant scroll for reduced motion
        if (typeof target === 'number') {
          window.scrollTo(0, target);
        } else {
          target.scrollIntoView();
        }
        resolve();
        return;
      }

      const startPosition = window.pageYOffset;
      const targetPosition =
        typeof target === 'number' ? target : target.getBoundingClientRect().top + startPosition;

      const distance = targetPosition - startPosition;
      let startTime: number | null = null;

      const animation = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);

        window.scrollTo(0, startPosition + distance * easeOut);

        if (progress < 1) {
          requestAnimationFrame(animation);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animation);
    });
  }

  /**
   * Create loading animation
   */
  createLoadingAnimation(element: Element): Animation {
    const keyframes = [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }];

    return this.createAnimation(element, keyframes, {
      duration: 1000,
      easing: 'linear',
      iterationCount: 'infinite'
    });
  }

  /**
   * Create fade animation
   */
  createFadeAnimation(element: Element, type: 'in' | 'out', duration: number = 300): Animation {
    const keyframes =
      type === 'in' ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }];

    return this.createAnimation(element, keyframes, {
      duration,
      easing: 'ease-in-out'
    });
  }

  /**
   * Create slide animation
   */
  createSlideAnimation(
    element: Element,
    direction: 'up' | 'down' | 'left' | 'right',
    duration: number = 300
  ): Animation {
    const keyframes = this.getSlideKeyframes(direction);

    return this.createAnimation(element, keyframes, {
      duration,
      easing: 'ease-out'
    });
  }

  /**
   * Get slide keyframes based on direction
   */
  private getSlideKeyframes(direction: string): Keyframe[] {
    const distance = '100px';

    switch (direction) {
      case 'up':
        return [
          { transform: `translateY(${distance})`, opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 }
        ];
      case 'down':
        return [
          { transform: `translateY(-${distance})`, opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 }
        ];
      case 'left':
        return [
          { transform: `translateX(${distance})`, opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 }
        ];
      case 'right':
        return [
          { transform: `translateX(-${distance})`, opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 }
        ];
      default:
        return [{ opacity: 0 }, { opacity: 1 }];
    }
  }

  /**
   * Pause all animations
   */
  pauseAllAnimations(): void {
    this.animationQueue.forEach(animation => {
      animation.pause();
    });
  }

  /**
   * Resume all animations
   */
  resumeAllAnimations(): void {
    this.animationQueue.forEach(animation => {
      animation.play();
    });
  }

  /**
   * Cancel all animations
   */
  cancelAllAnimations(): void {
    this.animationQueue.forEach(animation => {
      animation.cancel();
    });
    this.animationQueue = [];
  }

  /**
   * Get animation performance metrics
   */
  getAnimationMetrics(): {
    activeAnimations: number;
    isReducedMotion: boolean;
    maxConcurrent: number;
  } {
    return {
      activeAnimations: this.animationQueue.length,
      isReducedMotion: this.isReducedMotion,
      maxConcurrent: this.maxConcurrentAnimations
    };
  }
}
