import { useEffect } from 'react';

export interface PhysicsDebugConfig {
  enabled: boolean;
  showColliders: boolean;
  showForceVectors: boolean;
  showEquilibrium: boolean;
}

export interface PhysicsDebugPanelProps {
  config: PhysicsDebugConfig;
  onChange: (updater: (prev: PhysicsDebugConfig) => PhysicsDebugConfig) => void;
  stats?: {
    colliderCount: number;
    vectorCount: number;
    netForceN?: number;
    equilibriumStatus?: 'balanced' | 'unbalanced' | 'pending';
    equilibriumDetail?: string;
  };
  className?: string;
}

export function PhysicsDebugPanel({
  config,
  onChange,
  stats,
  className = '',
}: PhysicsDebugPanelProps) {
  // Global keyboard shortcut 'D' or 'Shift+D' to toggle debug overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'KeyD' && !e.ctrlKey && !e.metaKey) {
        onChange((prev) => ({ ...prev, enabled: !prev.enabled }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onChange]);

  if (!config.enabled) {
    return (
      <button
        onClick={() => onChange((prev) => ({ ...prev, enabled: true }))}
        title="Toggle Physics Debug Overlay (Colliders & Force Vectors) [Shortcut: D]"
        className={`flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface-1/90 px-2.5 py-1.5 font-mono text-xs font-medium text-fg-muted hover:border-accent hover:text-fg backdrop-blur transition-colors ${className}`}
      >
        <span className="text-cyan-400">📐</span>
        <span>Physics Debug</span>
        <kbd className="hidden sm:inline rounded bg-surface-2 px-1 text-[10px] text-fg-subtle border border-border">
          D
        </kbd>
      </button>
    );
  }

  return (
    <div
      className={`rounded-xl border border-cyan-500/40 bg-surface-base/95 p-3 shadow-xl backdrop-blur font-mono text-xs text-fg transition-all select-none ${className}`}
    >
      <div className="flex items-center justify-between border-b border-border/70 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-cyan-300 tracking-wide flex items-center gap-1.5">
            <span>📐</span> Physics Debugger
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <kbd className="rounded bg-surface-2 px-1 py-0.5 text-[10px] text-fg-subtle border border-border">
            D
          </kbd>
          <button
            onClick={() => onChange((prev) => ({ ...prev, enabled: false }))}
            className="rounded p-0.5 text-fg-muted hover:text-fg hover:bg-surface-2"
            title="Hide physics debug overlay"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Toggle options */}
      <div className="flex flex-wrap items-center gap-3 mb-2.5">
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-cyan-200">
          <input
            type="checkbox"
            checked={config.showColliders}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, showColliders: e.target.checked }))
            }
            className="rounded border-border text-cyan-500 focus:ring-cyan-500"
          />
          <span className="text-emerald-400 font-medium">Wireframe Colliders</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer hover:text-cyan-200">
          <input
            type="checkbox"
            checked={config.showForceVectors}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, showForceVectors: e.target.checked }))
            }
            className="rounded border-border text-cyan-500 focus:ring-cyan-500"
          />
          <span className="text-amber-400 font-medium">Force Vectors</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer hover:text-cyan-200">
          <input
            type="checkbox"
            checked={config.showEquilibrium}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, showEquilibrium: e.target.checked }))
            }
            className="rounded border-border text-cyan-500 focus:ring-cyan-500"
          />
          <span className="text-cyan-400 font-medium">Equilibrium HUD</span>
        </label>
      </div>

      {/* Real-time stats footer */}
      {stats && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2 text-[11px] text-fg-muted">
          <div className="flex items-center gap-2">
            <span>
              Colliders: <strong className="text-emerald-400">{stats.colliderCount}</strong>
            </span>
            <span>•</span>
            <span>
              Vectors: <strong className="text-amber-400">{stats.vectorCount}</strong>
            </span>
          </div>

          {stats.equilibriumStatus && (
            <div className="flex items-center gap-1.5">
              <span className="text-fg-subtle">ΣF:</span>
              <span
                className={`px-1.5 py-0.2 rounded font-semibold ${
                  stats.equilibriumStatus === 'balanced'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : stats.equilibriumStatus === 'unbalanced'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-surface-2 text-fg-subtle'
                }`}
              >
                {stats.equilibriumDetail || (stats.equilibriumStatus === 'balanced' ? 'Balanced' : 'Active Load')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
