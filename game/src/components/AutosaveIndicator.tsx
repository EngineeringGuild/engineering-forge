import { useState, useEffect } from 'react';

export interface AutosaveIndicatorProps {
  lastSavedTime: number | null;
  isSaving?: boolean;
  wasRestored?: boolean;
  onSaveNow?: () => void;
  onClearDraft?: () => void;
  onDismissRestored?: () => void;
}

function formatRelativeTime(lastSavedTime: number | null): string {
  if (!lastSavedTime) return '';
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - lastSavedTime) / 1000));
  if (elapsedSeconds < 5) {
    return 'Saved just now';
  }
  if (elapsedSeconds < 60) {
    return `Saved ${elapsedSeconds}s ago`;
  }
  const mins = Math.floor(elapsedSeconds / 60);
  return `Saved ${mins}m ago`;
}

export function AutosaveIndicator({
  lastSavedTime,
  isSaving,
  wasRestored,
  onSaveNow,
  onClearDraft,
  onDismissRestored,
}: AutosaveIndicatorProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!lastSavedTime) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [lastSavedTime]);

  const relativeText = formatRelativeTime(lastSavedTime);

  return (
    <div className="flex items-center gap-2">
      {/* Restored from autosave pill notification */}
      {wasRestored && (
        <div className="flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/15 px-2.5 py-1 text-[11px] font-mono text-accent animate-in fade-in">
          <span>🔄</span>
          <span>Draft Resumed</span>
          {onDismissRestored && (
            <button
              onClick={onDismissRestored}
              className="ml-1 rounded px-1 text-accent/70 hover:bg-accent/20 hover:text-accent"
              title="Dismiss notification"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Main Autosave Status Chip */}
      <div
        className="group relative flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface-1/90 px-2.5 py-1 text-[11px] font-mono text-fg-muted transition-colors hover:border-border"
        title="Autosave system: persists construction parts & active connections every 30s and on exit"
      >
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            isSaving
              ? 'bg-accent animate-ping'
              : lastSavedTime
                ? 'bg-emerald-500'
                : 'bg-fg-subtle/50'
          }`}
        />
        <span className="text-fg-subtle">
          {isSaving ? 'Saving…' : relativeText || 'Autosave Active'}
        </span>

        {/* Hover quick action buttons */}
        <div className="flex items-center gap-1 pl-1">
          {onSaveNow && (
            <button
              type="button"
              onClick={onSaveNow}
              title="Force autosave right now"
              className="rounded p-0.5 text-fg-subtle hover:text-fg hover:bg-surface-2 transition-colors"
            >
              💾
            </button>
          )}
          {lastSavedTime && onClearDraft && (
            <button
              type="button"
              onClick={onClearDraft}
              title="Discard saved draft and revert to initial level layout"
              className="rounded p-0.5 text-fg-subtle hover:text-danger hover:bg-surface-2 transition-colors"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
