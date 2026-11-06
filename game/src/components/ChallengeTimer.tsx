import { useState, useEffect } from 'react';
import { formatChallengeTime } from './timerUtils';

export interface ChallengeTimerProps {
  /** Whether the timer is currently actively counting */
  isRunning: boolean;
  /** Counter or trigger that resets the timer to 0 when changed */
  resetTrigger?: number | string;
  /** Callback fired whenever the elapsed time in seconds updates */
  onTimeUpdate?: (elapsedSeconds: number) => void;
  /** Custom CSS classes for the container */
  className?: string;
  /** Compact representation */
  compact?: boolean;
}

export function ChallengeTimer({
  isRunning,
  resetTrigger,
  onTimeUpdate,
  className = '',
  compact = false,
}: ChallengeTimerProps) {
  const [prevTrigger, setPrevTrigger] = useState(resetTrigger);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Derive and reset state when resetTrigger changes during render pattern
  if (resetTrigger !== prevTrigger) {
    setPrevTrigger(resetTrigger);
    setElapsedSeconds(0);
  }

  // Interval timer tracking seconds while running
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (onTimeUpdate) {
          onTimeUpdate(next);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUpdate]);

  const formattedTime = formatChallengeTime(elapsedSeconds);

  return (
    <div
      role="timer"
      aria-label={`Time elapsed: ${formattedTime}`}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface-1/90 px-2.5 py-1 text-xs font-mono font-medium tracking-wider text-fg shadow-xs transition-colors ${className}`}
    >
      <span
        className={`inline-block text-[13px] ${
          isRunning ? 'animate-pulse text-accent' : 'text-fg-muted'
        }`}
        aria-hidden="true"
      >
        ⏱
      </span>
      <span className={isRunning ? 'text-fg' : 'text-fg-muted'}>{formattedTime}</span>
      {!compact && (
        <span
          className={`h-1.5 w-1.5 rounded-full transition-colors ${
            isRunning ? 'bg-success animate-ping' : 'bg-fg-subtle/50'
          }`}
          title={isRunning ? 'Timer active' : 'Timer stopped'}
        />
      )}
    </div>
  );
}
