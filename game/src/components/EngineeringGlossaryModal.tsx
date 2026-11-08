import { useState, useMemo } from 'react';
import {
  ENGINEERING_GLOSSARY,
  type ChallengeCategory,
  type GlossaryEntry,
} from '../content/glossaryData';

export interface EngineeringGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: ChallengeCategory;
}

export function EngineeringGlossaryModal({
  isOpen,
  onClose,
  defaultCategory = 'structures',
}: EngineeringGlossaryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | 'all'>(defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);

  // Filter entries based on category and search query
  const filteredEntries = useMemo(() => {
    return ENGINEERING_GLOSSARY.filter((entry) => {
      const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        entry.term.toLowerCase().includes(q) ||
        entry.shortDefinition.toLowerCase().includes(q) ||
        entry.detailedExplanation.toLowerCase().includes(q) ||
        entry.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  // Set active entry if none or if current active filtered out
  const activeEntry: GlossaryEntry | undefined = useMemo(() => {
    if (activeEntryId) {
      const found = filteredEntries.find((e) => e.id === activeEntryId);
      if (found) return found;
    }
    return filteredEntries[0];
  }, [activeEntryId, filteredEntries]);

  if (!isOpen) return null;

  const categoryTitles: Record<ChallengeCategory, { label: string; icon: string }> = {
    structures: { label: 'Structures (Truss)', icon: '🌉' },
    circuits: { label: 'Circuits (DC Nodal)', icon: '⚡' },
    vehicles: { label: 'Vehicles (Powertrain)', icon: '🚗' },
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-1/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">
              📖
            </span>
            <div>
              <h2 id="glossary-title" className="font-display text-lg font-bold text-fg">
                Engineering Glossary & Technical Standards
              </h2>
              <p className="text-xs text-fg-muted font-mono">
                Authoritative physical principles, formulas, and references (ASME / IEEE / ISO / AISC)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-fg-muted hover:bg-surface-2 hover:text-fg transition-colors"
            title="Close glossary"
            aria-label="Close glossary"
          >
            <span className="text-lg font-bold">✕</span>
          </button>
        </div>

        {/* Category Tabs and Search */}
        <div className="flex flex-col gap-3 border-b border-border bg-surface-2/40 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {(['structures', 'circuits', 'vehicles'] as ChallengeCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setActiveEntryId(null);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-accent text-accent-foreground font-semibold shadow-xs'
                    : 'bg-surface-1 text-fg-muted hover:text-fg hover:bg-surface-2 border border-border/60'
                }`}
              >
                <span>{categoryTitles[cat].icon}</span>
                <span>{categoryTitles[cat].label}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search terms, formulas, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-1 px-3 py-1.5 text-xs text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1.5 text-xs text-fg-muted hover:text-fg"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content split pane */}
        <div className="grid flex-1 overflow-hidden grid-cols-1 md:grid-cols-12 min-h-[380px]">
          {/* Terms List (Left Column) */}
          <div className="border-r border-border bg-surface-1/50 p-3 overflow-y-auto md:col-span-4">
            <p className="px-2 pb-2 text-[11px] font-mono uppercase tracking-wider text-fg-subtle">
              Available Terms ({filteredEntries.length})
            </p>
            {filteredEntries.length === 0 ? (
              <p className="p-4 text-center text-xs text-fg-muted italic">
                No matching engineering terms found.
              </p>
            ) : (
              <ul className="space-y-1">
                {filteredEntries.map((entry) => {
                  const isSelected = activeEntry?.id === entry.id;
                  return (
                    <li key={entry.id}>
                      <button
                        onClick={() => setActiveEntryId(entry.id)}
                        className={`w-full text-left rounded-lg px-3 py-2 text-xs transition-colors ${
                          isSelected
                            ? 'bg-accent/15 border border-accent/40 text-accent font-semibold'
                            : 'text-fg-muted hover:bg-surface-2 hover:text-fg border border-transparent'
                        }`}
                      >
                        <div className="font-mono text-xs font-medium">{entry.term}</div>
                        <div className="line-clamp-1 text-[11px] text-fg-subtle">
                          {entry.shortDefinition}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Term Detail View (Right Column) */}
          <div className="p-6 overflow-y-auto md:col-span-8 bg-surface-1/20 flex flex-col justify-between">
            {activeEntry ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3">
                  <div>
                    <h3 className="font-display text-xl font-bold text-fg">
                      {activeEntry.term}
                    </h3>
                    <p className="font-mono text-xs text-accent mt-0.5">
                      Standard: {activeEntry.standardReference || 'General Engineering Principle'}
                    </p>
                  </div>
                  <span className="rounded-md border border-border bg-surface-2 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-fg-muted">
                    {categoryTitles[activeEntry.category].label}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-fg-subtle mb-1">
                    Definition
                  </h4>
                  <p className="text-sm font-medium text-fg leading-relaxed">
                    {activeEntry.shortDefinition}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-fg-subtle mb-1">
                    Engineering Mechanics & Analysis
                  </h4>
                  <p className="text-xs text-fg-muted leading-relaxed">
                    {activeEntry.detailedExplanation}
                  </p>
                </div>

                {activeEntry.formula && (
                  <div className="rounded-xl border border-accent/30 bg-accent/5 p-3.5">
                    <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent mb-1.5 flex items-center gap-1.5">
                      <span>📐</span>
                      <span>Governing Formulation</span>
                    </h4>
                    <code className="block font-mono text-sm font-semibold text-fg bg-surface-1/80 border border-border/60 rounded px-2.5 py-1.5 select-all">
                      {activeEntry.formula}
                    </code>
                  </div>
                )}

                <div className="rounded-xl border border-border/80 bg-surface-2/40 p-3.5">
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-fg mb-1 flex items-center gap-1.5">
                    <span>💡</span>
                    <span>Practical Application & Design Tip</span>
                  </h4>
                  <p className="text-xs text-fg-muted leading-relaxed">
                    {activeEntry.engineeringTip}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <span className="text-[10px] font-mono text-fg-subtle uppercase mr-1">Tags:</span>
                  {activeEntry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-surface-2 px-2 py-0.5 font-mono text-[10px] text-fg-muted border border-border/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center text-sm text-fg-muted">
                Select an engineering term from the list to inspect its physical definitions,
                governing formulas, and design considerations.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-surface-1/90 px-6 py-3">
          <p className="font-mono text-[11px] text-fg-subtle">
            Engineering Guild Knowledge System · Industrial Drafter Reference
          </p>
          <button
            onClick={onClose}
            className="rounded-lg bg-accent px-4 py-1.5 font-mono text-xs font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
          >
            Close Glossary
          </button>
        </div>
      </div>
    </div>
  );
}
