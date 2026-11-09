import { useEffect, useState, useId } from 'react';
import {
  designSaveManager,
  type DesignStats,
  type SavedDesign,
} from '../state/DesignSaveManager';
import { soundFx } from '../audio/soundFx';

export interface DesignSaveModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  discipline: 'structures' | 'circuits' | 'machines';
  levelId: string;
  levelName: string;
  currentData: T;
  currentStats: DesignStats;
  onRestoreDesign: (design: SavedDesign<T>) => void;
  canSave?: boolean;
}

function formatDate(epochMs: number): string {
  const d = new Date(epochMs);
  const now = Date.now();
  const diffSec = Math.floor((now - epochMs) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DesignSaveModal<T>({
  isOpen,
  onClose,
  discipline,
  levelId,
  levelName,
  currentData,
  currentStats,
  onRestoreDesign,
  canSave = true,
}: DesignSaveModalProps<T>) {
  const [designs, setDesigns] = useState<SavedDesign<T>[]>(() =>
    designSaveManager.getDesignsForLevel<T>(discipline, levelId),
  );
  const [designName, setDesignName] = useState(
    () =>
      `${levelName} Concept ${
        designSaveManager.getDesignsForLevel<T>(discipline, levelId).length + 1
      }`,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const inputId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const unsub = designSaveManager.subscribe(() => {
      setDesigns(designSaveManager.getDesignsForLevel<T>(discipline, levelId));
    });
    return unsub;
  }, [isOpen, discipline, levelId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    soundFx.playSnapNode();
    const name = designName.trim() || `${levelName} Design`;
    const saved = designSaveManager.saveDesign<T>(
      discipline,
      levelId,
      name,
      currentData,
      currentStats,
    );

    setDesignName(`${levelName} Concept ${designs.length + 2}`);
    showToast(`Saved "${saved.name}" to local designs!`);
  };

  const handleResume = (design: SavedDesign<T>) => {
    soundFx.playSnapNode();
    onRestoreDesign(design);
    showToast(`Resumed "${design.name}"!`);
    onClose();
  };

  const handleDelete = (id: string, name: string) => {
    soundFx.playSnapNode();
    designSaveManager.deleteDesign(id);
    showToast(`Deleted "${name}".`);
  };

  const handleStartRename = (design: SavedDesign<T>) => {
    setEditingId(design.id);
    setRenameValue(design.name);
  };

  const handleSaveRename = (id: string) => {
    soundFx.playSnapNode();
    designSaveManager.renameDesign(id, renameValue);
    setEditingId(null);
    showToast('Design renamed.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative flex max-h-[88vh] w-full max-w-2xl flex-col rounded-2xl border border-border/80 bg-surface-1 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-2/60 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent text-lg">
              💾
            </span>
            <div>
              <h2 className="font-mono text-base font-bold text-fg">
                Design Save & Resume System
              </h2>
              <p className="text-xs text-fg-muted">
                {levelName} · Persistent LocalStorage Revisions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-fg-muted hover:bg-surface-2 hover:text-fg transition-colors"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-2 text-center text-xs font-mono text-emerald-400 animate-in fade-in">
            ✓ {toastMessage}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Section 1: Save Current Design */}
          <div className="rounded-xl border border-border/80 bg-surface-base p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-mono text-xs font-semibold text-fg uppercase tracking-wider flex items-center gap-1.5">
                <span>➕</span> Save Current Design Snapshot
              </h3>
              <div className="flex items-center gap-3 font-mono text-xs text-fg-muted">
                <span>
                  Parts: <strong className="text-fg">{currentStats.partCount}</strong>
                </span>
                <span>
                  Cost: <strong className="text-accent">${currentStats.cost.toFixed(0)}</strong>
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveCurrent} className="flex gap-2.5">
              <div className="relative flex-1">
                <label htmlFor={inputId} className="sr-only">
                  Design Revision Name
                </label>
                <input
                  id={inputId}
                  type="text"
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                  placeholder="e.g. Warren Truss Lightweight Concept"
                  className="w-full rounded-lg border border-border bg-surface-1 px-3.5 py-2 text-sm text-fg placeholder-fg-subtle/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <button
                type="submit"
                disabled={!canSave || currentStats.partCount === 0}
                className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-40 transition-opacity whitespace-nowrap shadow-sm"
              >
                <span>💾</span>
                <span>Save Snapshot</span>
              </button>
            </form>
            {currentStats.partCount === 0 && (
              <p className="mt-2 text-xs text-fg-subtle">
                Place parts on the canvas before saving a design snapshot.
              </p>
            )}
          </div>

          {/* Section 2: Saved Revisions Library */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-mono text-xs font-semibold text-fg uppercase tracking-wider flex items-center gap-1.5">
                <span>📂</span> Saved Revisions ({designs.length})
              </h3>
              <span className="text-[11px] text-fg-subtle">
                Persisted in localStorage · Resume anytime
              </span>
            </div>

            {designs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <span className="text-3xl block mb-2 opacity-50">📑</span>
                <p className="text-sm font-medium text-fg">No saved designs for this level yet</p>
                <p className="text-xs text-fg-muted mt-1 max-w-sm mx-auto">
                  Use the form above to snapshot your current design so you can test alternative ideas or resume your progress later!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {designs.map((d) => {
                  const isRenaming = editingId === d.id;
                  return (
                    <div
                      key={d.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-surface-base p-3.5 hover:border-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        {isRenaming ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              className="rounded border border-accent bg-surface-1 px-2.5 py-1 text-sm text-fg focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveRename(d.id)}
                              className="rounded bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded border border-border px-2 py-1 text-xs text-fg-muted"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-semibold text-fg truncate">
                              {d.name}
                            </span>
                            <button
                              onClick={() => handleStartRename(d)}
                              title="Rename design"
                              className="opacity-0 group-hover:opacity-100 text-xs text-fg-subtle hover:text-fg transition-opacity"
                            >
                              ✏️
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-1 text-xs font-mono text-fg-muted">
                          <span>{formatDate(d.updatedAt)}</span>
                          <span>•</span>
                          <span>{d.stats.partCount} parts</span>
                          <span>•</span>
                          <span className="text-accent">${d.stats.cost.toFixed(0)}</span>
                          {d.stats.summary && (
                            <>
                              <span>•</span>
                              <span className="text-fg-subtle truncate max-w-[150px]">
                                {d.stats.summary}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => handleResume(d)}
                          className="flex items-center gap-1.5 rounded-lg bg-surface-2 hover:bg-accent hover:text-accent-foreground border border-border hover:border-accent px-3 py-1.5 text-xs font-semibold text-fg transition-colors"
                          title="Restore and resume this saved design"
                        >
                          <span>🔄</span>
                          <span>Resume</span>
                        </button>
                        <button
                          onClick={() => handleDelete(d.id, d.name)}
                          className="rounded-lg p-1.5 text-fg-subtle hover:text-danger hover:bg-surface-2 transition-colors"
                          title="Delete saved design"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-surface-2/40 px-5 py-3">
          <span className="text-xs text-fg-subtle font-mono">
            {designs.length} design revision{designs.length === 1 ? '' : 's'} stored locally
          </span>
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-fg hover:bg-surface-2 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
