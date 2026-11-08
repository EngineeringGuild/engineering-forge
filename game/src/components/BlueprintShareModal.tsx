import { useState } from 'react';
import {
  blueprintManager,
  type BlueprintDomain,
  type UniversalBlueprint,
} from '../state/BlueprintManager';

export interface BlueprintShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: BlueprintDomain;
  getBlueprint: () => UniversalBlueprint;
  onLoadBlueprint: (blueprint: UniversalBlueprint) => void;
}

export function BlueprintShareModal({
  isOpen,
  onClose,
  domain,
  getBlueprint,
  onLoadBlueprint,
}: BlueprintShareModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'library'>('export');
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [savedToLib, setSavedToLib] = useState(false);
  const [currentBlueprint] = useState<UniversalBlueprint>(() => getBlueprint());

  // Import State
  const [importInput, setImportInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [previewBlueprint, setPreviewBlueprint] = useState<UniversalBlueprint | null>(null);

  // Library State
  const [library, setLibrary] = useState<UniversalBlueprint[]>(() =>
    blueprintManager.listLibrary(domain),
  );

  if (!isOpen) return null;

  const token = blueprintManager.encodeToToken(currentBlueprint);
  const jsonString = JSON.stringify(currentBlueprint, null, 2);

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSaveCurrentToLibrary = () => {
    blueprintManager.saveToLibrary(currentBlueprint);
    setLibrary(blueprintManager.listLibrary(domain));
    setSavedToLib(true);
    setTimeout(() => setSavedToLib(false), 2000);
  };

  const handleParseImport = (text: string) => {
    setImportInput(text);
    setImportError(null);
    setPreviewBlueprint(null);

    if (!text.trim()) return;

    try {
      const decoded = blueprintManager.decodeFromToken(text);
      if (decoded.domain !== domain) {
        setImportError(
          `Domain mismatch: this blueprint is for "${decoded.domain}", but current workbench is in "${domain}".`,
        );
        return;
      }
      setPreviewBlueprint(decoded);
    } catch (err) {
      setImportError((err as Error).message);
    }
  };

  const handleApplyImport = () => {
    if (!previewBlueprint) return;
    onLoadBlueprint(previewBlueprint);
    onClose();
  };

  const handleDeleteFromLibrary = (id: string) => {
    blueprintManager.deleteFromLibrary(id);
    setLibrary(blueprintManager.listLibrary(domain));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="blueprint-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-accent/40 bg-surface-1 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-2/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 text-accent border border-accent/40 text-lg">
              📐
            </span>
            <div>
              <h2 id="blueprint-modal-title" className="font-display text-lg font-bold text-fg">
                Universal Blueprint Exchange
              </h2>
              <p className="text-xs text-fg-muted">
                Export, share, import or archive your {domain} design using standard Guild schemas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-fg-muted hover:bg-surface-2 hover:text-fg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-surface-base px-6">
          <button
            onClick={() => setActiveTab('export')}
            className={`border-b-2 px-4 py-3 text-xs font-mono font-semibold transition-colors ${
              activeTab === 'export'
                ? 'border-accent text-accent'
                : 'border-transparent text-fg-muted hover:text-fg'
            }`}
          >
            Share & Export
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`border-b-2 px-4 py-3 text-xs font-mono font-semibold transition-colors ${
              activeTab === 'import'
                ? 'border-accent text-accent'
                : 'border-transparent text-fg-muted hover:text-fg'
            }`}
          >
            Import Blueprint
          </button>
          <button
            onClick={() => {
              setLibrary(blueprintManager.listLibrary(domain));
              setActiveTab('library');
            }}
            className={`border-b-2 px-4 py-3 text-xs font-mono font-semibold transition-colors ${
              activeTab === 'library'
                ? 'border-accent text-accent'
                : 'border-transparent text-fg-muted hover:text-fg'
            }`}
          >
            Blueprint Library ({library.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'export' && (
            <div className="flex flex-col gap-5">
              <div className="rounded-xl border border-border bg-surface-2/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-mono text-sm font-semibold text-fg">
                      {currentBlueprint.name}
                    </h3>
                    <p className="text-xs text-fg-muted">
                      Estimated Cost: <strong className="text-accent">${currentBlueprint.estimatedCost}</strong> · Domain: <span className="uppercase text-accent font-mono text-[11px]">{domain}</span>
                    </p>
                  </div>
                  <button
                    onClick={handleSaveCurrentToLibrary}
                    className="flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-xs font-semibold text-accent hover:bg-accent/20 transition-colors"
                  >
                    <span>💾</span>
                    <span>{savedToLib ? 'Saved to Library!' : 'Save to Library'}</span>
                  </button>
                </div>
              </div>

              {/* Share Token Box */}
              <div>
                <label className="mb-1.5 block font-mono text-xs font-medium text-fg-muted">
                  Compact Share Code (URL & Chat Safe)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={token}
                    className="flex-1 rounded-lg border border-border bg-surface-base px-3 py-2 font-mono text-xs text-fg select-all focus:border-accent focus:outline-none"
                  />
                  <button
                    onClick={handleCopyToken}
                    className="rounded-lg bg-accent px-4 py-2 font-mono text-xs font-semibold text-accent-fg hover:bg-accent/90 transition-colors"
                  >
                    {copiedToken ? '✓ Copied' : 'Copy Code'}
                  </button>
                </div>
              </div>

              {/* Formatted JSON */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="font-mono text-xs font-medium text-fg-muted">
                    Raw Blueprint JSON
                  </label>
                  <button
                    onClick={handleCopyJson}
                    className="text-xs text-accent hover:underline font-mono"
                  >
                    {copiedJson ? '✓ Copied JSON' : 'Copy JSON'}
                  </button>
                </div>
                <pre className="max-h-48 overflow-auto rounded-xl border border-border bg-surface-base p-3 font-mono text-xs text-fg-muted leading-relaxed select-all">
                  {jsonString}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block font-mono text-xs font-medium text-fg-muted">
                  Paste Share Code (<code className="text-accent">EF-BP1:...</code>) or Raw JSON
                </label>
                <textarea
                  value={importInput}
                  onChange={(e) => handleParseImport(e.target.value)}
                  placeholder="Paste your blueprint code here..."
                  rows={4}
                  className="w-full rounded-xl border border-border bg-surface-base p-3 font-mono text-xs text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none"
                />
              </div>

              {importError && (
                <div className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-xs text-danger font-mono">
                  ⚠️ {importError}
                </div>
              )}

              {previewBlueprint && (
                <div className="rounded-xl border border-success/40 bg-success/10 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-success text-base">✓</span>
                        <h4 className="font-mono text-sm font-bold text-fg">
                          {previewBlueprint.name}
                        </h4>
                      </div>
                      <p className="mt-1 text-xs text-fg-muted">
                        Domain: <span className="uppercase text-fg font-mono">{previewBlueprint.domain}</span> · Cost: ${previewBlueprint.estimatedCost} · Created: {new Date(previewBlueprint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={handleApplyImport}
                      className="rounded-lg bg-success px-4 py-2 font-mono text-xs font-semibold text-white hover:bg-success/90 transition-colors"
                    >
                      Load into Workbench
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'library' && (
            <div className="flex flex-col gap-3">
              {library.length === 0 ? (
                <div className="py-12 text-center text-fg-muted text-sm">
                  <p className="text-2xl mb-2">📁</p>
                  <p>No saved blueprints in your library yet.</p>
                  <p className="text-xs text-fg-subtle mt-1">
                    Save your designs from the "Share & Export" tab to access them anytime!
                  </p>
                </div>
              ) : (
                library.map((bp) => (
                  <div
                    key={bp.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface-2/40 p-3.5 hover:border-accent/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-mono text-sm font-semibold text-fg">{bp.name}</h4>
                        <span className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-fg-muted uppercase">
                          ${bp.estimatedCost}
                        </span>
                      </div>
                      <p className="text-xs text-fg-subtle mt-0.5">
                        Saved on {new Date(bp.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onLoadBlueprint(bp);
                          onClose();
                        }}
                        className="rounded-lg bg-accent/20 px-3 py-1.5 font-mono text-xs font-semibold text-accent hover:bg-accent/30 transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDeleteFromLibrary(bp.id)}
                        className="rounded-lg p-1.5 text-fg-subtle hover:text-danger transition-colors"
                        title="Delete from library"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border bg-surface-2/40 px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-1.5 text-xs text-fg hover:bg-surface-2 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
