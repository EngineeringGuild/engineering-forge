import { useState } from 'react';
import {
  useDifficultyStore,
  DIFFICULTY_PRESETS,
  type DifficultyLevel,
} from '../state/difficultyStore';

interface DifficultySelectorProps {
  levelId?: string;
  className?: string;
  compact?: boolean;
}

export function DifficultySelector({
  levelId,
  className = '',
  compact = false,
}: DifficultySelectorProps) {
  const { getDifficultyForLevel, setLevelDifficulty, setGlobalDifficulty } = useDifficultyStore();
  const currentDiff = getDifficultyForLevel(levelId);
  const currentModifiers = DIFFICULTY_PRESETS[currentDiff];
  const [showInfo, setShowInfo] = useState(false);

  const handleSelect = (diff: DifficultyLevel) => {
    if (levelId) {
      setLevelDifficulty(levelId, diff);
    } else {
      setGlobalDifficulty(diff);
    }
  };

  const levels: DifficultyLevel[] = ['easy', 'medium', 'hard'];

  if (compact) {
    return (
      <div className={`relative flex items-center gap-1.5 font-mono text-xs ${className}`}>
        <div className="flex items-center rounded-lg border border-border bg-surface-2 p-0.5">
          {levels.map((lvl) => {
            const preset = DIFFICULTY_PRESETS[lvl];
            const active = currentDiff === lvl;
            return (
              <button
                key={lvl}
                onClick={() => handleSelect(lvl)}
                title={`${preset.name}: ${preset.description}`}
                className={`rounded px-2 py-0.5 text-[11px] font-bold transition-colors ${
                  active
                    ? lvl === 'easy'
                      ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                      : lvl === 'medium'
                      ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                      : 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                    : 'text-fg-muted hover:text-fg'
                }`}
              >
                {lvl.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 rounded-xl border border-border bg-surface-1 p-3 font-mono ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-fg-muted uppercase tracking-wider flex items-center gap-1.5">
          <span>⚖️</span>
          <span>Simulation Physics Difficulty</span>
        </span>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-[11px] text-accent hover:underline"
        >
          {showInfo ? 'Hide Specs' : 'View Modifiers'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {levels.map((lvl) => {
          const preset = DIFFICULTY_PRESETS[lvl];
          const active = currentDiff === lvl;

          return (
            <button
              key={lvl}
              onClick={() => handleSelect(lvl)}
              className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all ${
                active
                  ? lvl === 'easy'
                    ? 'border-emerald-500/70 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500/30'
                    : lvl === 'medium'
                    ? 'border-amber-500/70 bg-amber-950/40 text-amber-300 ring-1 ring-amber-500/30'
                    : 'border-rose-500/70 bg-rose-950/40 text-rose-300 ring-1 ring-rose-500/30'
                  : 'border-border bg-surface-2 text-fg-muted hover:border-border/80 hover:text-fg'
              }`}
            >
              <div className="flex items-center gap-1 text-xs font-bold">
                <span>{preset.badge}</span>
                <span>{lvl.toUpperCase()}</span>
              </div>
              <span className="text-[10px] text-fg-subtle mt-0.5">
                {lvl === 'easy' ? '0.8x Gravity' : lvl === 'medium' ? '1.0x Nominal' : '1.15x Gravity'}
              </span>
            </button>
          );
        })}
      </div>

      {showInfo && (
        <div className="mt-1 rounded-lg bg-surface-2/80 p-2.5 text-[11px] text-fg-subtle border border-border/60 flex flex-col gap-1">
          <p className="text-fg font-bold">Active: {currentModifiers.name}</p>
          <p className="font-sans text-[11px] text-fg-muted leading-tight">{currentModifiers.description}</p>
          <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 border-t border-border/40 pt-1 text-[10px]">
            <div>Gravity: <strong className="text-fg">{currentModifiers.gravityMultiplier}x</strong></div>
            <div>Stress Limit: <strong className="text-fg">{Math.round(currentModifiers.stressCapacityMultiplier * 100)}%</strong></div>
            <div>Burnout Ceiling: <strong className="text-fg">{Math.round(currentModifiers.burnoutPowerMultiplier * 100)}%</strong></div>
            <div>Score Multiplier: <strong className="text-accent">{currentModifiers.scoreBonusMultiplier}x</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}
