import { useState } from 'react';
import {
  useGameProgressionStore,
  type EngineeringCategory,
} from '../state/gameProgressionStore';

export interface CompletionBadgeProps {
  category: EngineeringCategory;
  className?: string;
  compact?: boolean;
}

export function CompletionBadge({ category, className = '', compact = false }: CompletionBadgeProps) {
  const badge = useGameProgressionStore((s) => s.getCategoryBadge(category));
  const [showCertificate, setShowCertificate] = useState(false);

  const tierColors = {
    master: {
      bg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/30',
      pill: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      label: 'Certified Master',
    },
    journeyman: {
      bg: 'bg-accent/10 border-accent/40 text-accent',
      glow: 'shadow-[0_0_15px_rgba(255,106,44,0.2)]',
      pill: 'bg-accent/20 text-accent border-accent/30',
      label: 'Journeyman',
    },
    apprentice: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      glow: 'shadow-[0_0_10px_rgba(245,158,11,0.15)]',
      pill: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      label: 'Apprentice',
    },
    initiate: {
      bg: 'bg-surface-2 border-border text-fg-muted',
      glow: '',
      pill: 'bg-surface-3 text-fg-subtle border-border',
      label: 'Initiate',
    },
  }[badge.tier];

  const standardCite = {
    structures: 'ASME Section III / AISC 360-16 LRFD Truss Analysis Standard',
    circuits: 'IEEE Std 141 / Kirchhoff Nodal Current & Voltage Verification',
    machines: 'ISO 80000-3 & Pacejka Coulomb Traction Boundary Framework',
  }[category];

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs ${tierColors.bg} ${tierColors.glow} ${className}`}
        title={`${badge.title} (${badge.completedCount}/${badge.totalCount} levels)`}
      >
        <span className="text-sm">{badge.icon}</span>
        <span className="font-semibold">{badge.title}</span>
        <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${tierColors.pill}`}>
          {badge.percent}%
        </span>
      </div>
    );
  }

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-2xl border p-4.5 transition-all duration-300 ${tierColors.bg} ${tierColors.glow} ${className}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-2xl ${
                badge.tier === 'master'
                  ? 'border-emerald-500/50 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse'
                  : 'border-border bg-surface-2/60'
              }`}
            >
              {badge.icon}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                  Guild Mastery Recognition
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${tierColors.pill}`}
                >
                  {tierColors.label}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-fg leading-snug">
                {badge.title}
              </h3>
              <p className="text-xs text-fg-muted">{badge.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono text-xs">
              <div className="text-fg-muted">
                Completed:{' '}
                <strong className="text-fg">
                  {badge.completedCount}/{badge.totalCount}
                </strong>
              </div>
              <div className="text-fg-muted">
                Stars:{' '}
                <strong className="text-warning">
                  ★ {badge.earnedStars}/{badge.maxStars}
                </strong>
              </div>
            </div>

            <button
              onClick={() => setShowCertificate(true)}
              className="rounded-lg border border-border bg-surface-base/80 px-3 py-2 font-mono text-xs font-semibold text-fg hover:border-accent hover:text-accent transition-colors shadow-sm"
              title="Inspect Guild Engineering Certification details"
            >
              📜 View Badge
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3.5 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-base/60 border border-border/40">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                badge.tier === 'master'
                  ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                  : 'bg-accent shadow-[0_0_10px_rgba(255,106,44,0.5)]'
              }`}
              style={{ width: `${badge.percent}%` }}
            />
          </div>
          <span className="font-mono text-xs font-bold text-fg-muted min-w-[36px] text-right">
            {badge.percent}%
          </span>
        </div>
      </div>

      {/* Guild Certificate & Accreditation Modal */}
      {showCertificate && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-accent/40 bg-surface-1 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border bg-surface-2/70 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <h3 className="font-display text-base font-bold text-fg">
                    Guild Engineering Accreditation
                  </h3>
                  <p className="text-[11px] font-mono text-accent">
                    Engineering Guild · Department of Physics Verification
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCertificate(false)}
                className="rounded-lg p-1.5 text-fg-muted hover:bg-surface-2 hover:text-fg"
              >
                ✕
              </button>
            </div>

            {/* Certificate Parchment Body */}
            <div className="p-6 flex flex-col gap-4">
              <div className="rounded-xl border border-border bg-surface-base p-5 text-center flex flex-col items-center gap-3 shadow-inner">
                <span className="text-4xl">{badge.icon}</span>
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-fg-muted">
                    Official Recognition of Competence
                  </span>
                  <h4 className="font-display text-xl font-bold text-fg mt-1">
                    {badge.title}
                  </h4>
                  <p className="text-xs text-fg-muted mt-1 max-w-sm">
                    {badge.description}
                  </p>
                </div>

                <div className="w-full border-t border-border/80 my-1 pt-3 flex justify-around text-xs font-mono">
                  <div>
                    <span className="text-fg-subtle block text-[10px]">VERIFIED LEVELS</span>
                    <strong className="text-fg text-sm">{badge.completedCount} of {badge.totalCount}</strong>
                  </div>
                  <div>
                    <span className="text-fg-subtle block text-[10px]">MASTERY STARS</span>
                    <strong className="text-warning text-sm">★ {badge.earnedStars} / {badge.maxStars}</strong>
                  </div>
                  <div>
                    <span className="text-fg-subtle block text-[10px]">STATUS</span>
                    <strong className={badge.isFullyCompleted ? 'text-emerald-400 text-sm' : 'text-accent text-sm'}>
                      {badge.isFullyCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Standard Citations */}
              <div className="rounded-lg border border-border/60 bg-surface-2/40 p-3 text-xs font-mono text-fg-muted leading-relaxed">
                <span className="text-[10px] uppercase text-fg-subtle block mb-1">
                  Governing Technical Standard:
                </span>
                <p className="text-fg font-semibold">{standardCite}</p>
                <p className="text-[11px] text-fg-subtle mt-1">
                  All structural, electrical, and kinematic bounds computed via direct numerical solvers (ASME / IEEE).
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-border bg-surface-2/40 px-5 py-3">
              <button
                onClick={() => setShowCertificate(false)}
                className="rounded-lg bg-accent px-4 py-1.5 font-mono text-xs font-semibold text-accent-fg hover:bg-accent/90 transition-colors"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
