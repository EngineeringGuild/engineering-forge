import { useState } from 'react';
import type { ContextualGuidance } from '../game/guidanceSystem';

export interface ContextualHintBannerProps {
  /** The evaluated contextual guidance */
  guidance: ContextualGuidance;
  /** Whether the user has been stuck for > 60 seconds */
  isStuck: boolean;
  /** Elapsed time on current level in seconds */
  elapsedSeconds: number;
  /** Static hint fallback from the level definition */
  fallbackHint?: string;
  /** Whether the user manually toggled the hint open */
  manualOpen?: boolean;
  /** Callback to close the banner */
  onDismiss?: () => void;
}

export function ContextualHintBanner({
  guidance,
  isStuck,
  elapsedSeconds,
  fallbackHint,
  manualOpen = false,
  onDismiss,
}: ContextualHintBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // If user dismissed it and it wasn't re-opened manually, hide it
  if (dismissed && !manualOpen) return null;
  // If not stuck and not manually requested, hide it
  if (!isStuck && !manualOpen) return null;

  const severityStyles = {
    warning: {
      border: 'border-amber-500/40 bg-amber-500/10',
      badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      icon: '⚠️',
    },
    tip: {
      border: 'border-emerald-500/40 bg-emerald-500/10',
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: '💡',
    },
    info: {
      border: 'border-blue-500/40 bg-blue-500/10',
      badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      icon: 'ℹ️',
    },
  }[guidance.severity];

  const handleClose = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <aside
      role="region"
      aria-label="Context-aware engineering guidance"
      className={`relative overflow-hidden rounded-xl border p-4 shadow-md backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${severityStyles.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-xl select-none" aria-hidden="true">
            {severityStyles.icon}
          </span>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-fg">
                {guidance.headline}
              </h4>
              <span
                className={`rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ${severityStyles.badge}`}
              >
                {guidance.domain}
              </span>
              {isStuck && (
                <span className="rounded bg-accent/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent">
                  Active Guidance ({Math.floor(elapsedSeconds)}s)
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-fg-muted">{guidance.advice}</p>
            {fallbackHint && fallbackHint !== guidance.advice && (
              <p className="mt-2 text-[11px] text-fg-subtle border-t border-border/40 pt-1.5 italic">
                General tip: {fallbackHint}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleClose}
          className="rounded-lg p-1 text-fg-muted hover:bg-surface-2 hover:text-fg transition-colors"
          title="Dismiss guidance"
          aria-label="Dismiss guidance"
        >
          <span className="text-sm font-bold">✕</span>
        </button>
      </div>
    </aside>
  );
}
