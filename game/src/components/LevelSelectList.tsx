import { useState } from 'react';
import { Link } from 'react-router-dom';
import { soundFx } from '../audio/soundFx';

export interface LevelSelectItem {
  id: string;
  name: string;
  tagline: string;
}

interface Props {
  levels: LevelSelectItem[];
  basePath: string;
  isLevelUnlocked: (levelId: string) => boolean;
  starsFor: (levelId: string) => number;
  isCompleted?: (levelId: string) => boolean;
  showProgressHeader?: boolean;
}

export function LevelSelectList({
  levels,
  basePath,
  isLevelUnlocked,
  starsFor,
  isCompleted,
  showProgressHeader = true,
}: Props) {
  const [inspectAll, setInspectAll] = useState(false);

  const isUnlockedEffective = (id: string) => inspectAll || isLevelUnlocked(id);

  const completedLevels = levels.filter((lvl) => {
    const unlocked = isLevelUnlocked(lvl.id);
    const stars = starsFor(lvl.id);
    return unlocked && (isCompleted ? isCompleted(lvl.id) : stars > 0);
  });
  const completedCount = completedLevels.length;
  const totalCount = levels.length;
  const earnedStars = levels.reduce((acc, lvl) => {
    return acc + (isLevelUnlocked(lvl.id) ? starsFor(lvl.id) : 0);
  }, 0);
  const maxStars = totalCount * 3;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;


  return (
    <div className="space-y-4">
      {showProgressHeader && (
        <div className="industrial-panel rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/20 text-success border border-success/30">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-fg-subtle font-medium">
                DISCIPLINE DIVISION PROGRESS
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="text-fg-subtle">
                Completed: <strong className="text-fg">{completedCount}/{totalCount}</strong>
              </span>
              <span className="text-fg-subtle">
                Stars: <strong className="text-warning">★ {earnedStars}/{maxStars}</strong>
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${
                  completedCount === totalCount && totalCount > 0
                    ? 'border border-success/40 bg-success/20 text-success'
                    : completedCount > 0
                    ? 'border border-accent/40 bg-accent/20 text-accent'
                    : 'border border-border bg-surface-2 text-fg-subtle'
                }`}
              >
                {completedCount === totalCount && totalCount > 0 ? '✓ All Completed' : `${percent}%`}
              </span>
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-2 border border-border/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-success transition-all duration-500 shadow-[0_0_10px_rgba(22,163,74,0.4)]"
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Quick Inspection & Free Navigation Mode Toggle */}
          <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs font-mono">
            <span className="text-[11px] text-fg-subtle">
              Modo de Progressão: {inspectAll ? 'Inspeção Livre Ativa' : 'Desafio Sequencial'}
            </span>
            <button
              type="button"
              onClick={() => {
                soundFx.playSnapNode();
                setInspectAll(!inspectAll);
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all border cursor-pointer ${
                inspectAll
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-surface-2 text-fg-subtle border-border hover:border-accent hover:text-fg'
              }`}
              title="Alterna entre progressão obrigatória e modo livre de inspeção técnica de todos os desafios"
            >
              {inspectAll ? '🔓 MODO LIVRE: TODOS DESBLOQUEADOS' : '🔒 DESBLOQUEAR TODOS (MODO LIVRE)'}
            </button>
          </div>
        </div>
      )}

      <ol className="flex flex-col gap-3">
        {levels.map((level, index) => {
          const unlocked = isUnlockedEffective(level.id);
          const stars = starsFor(level.id);
          const completed = unlocked && (isCompleted ? isCompleted(level.id) : stars > 0);
          const statusText = unlocked
            ? completed
              ? `Completed, ${stars} of 3 stars`
              : ', not yet completed'
            : ', locked (clique para desbloquear em modo livre)';

          const cardStyle = !unlocked
            ? 'border-border/50 bg-surface-1/40 opacity-70 hover:opacity-100 hover:border-accent/60 cursor-pointer'
            : completed
            ? 'border-success/60 bg-surface-1/90 shadow-[0_0_15px_-2px_rgba(22,163,74,0.35)] ring-1 ring-success/30 hover:border-success hover:shadow-[0_0_20px_-2px_rgba(22,163,74,0.5)]'
            : 'border-border/90 bg-surface-1/90 hover:border-accent hover:shadow-[0_0_12px_-3px_rgba(255,106,44,0.25)]';

          const content = (
            <div
              onMouseEnter={() => soundFx.playSubtleHover()}
              onClick={() => soundFx.playTactileClick()}
              className={`flex items-center justify-between rounded-xl border px-5 py-4 transition-all duration-200 active:scale-[0.99] ${cardStyle}`}
            >
              <div className="flex items-center gap-3.5 text-left">
                {completed ? (
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/20 text-success border border-success/40 shadow-[0_0_8px_rgba(22,163,74,0.3)]"
                    title="Level completed"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                ) : unlocked ? (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-fg-muted border border-border text-xs font-mono font-medium">
                    {index + 1}
                  </div>
                ) : (
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs"
                    title="Desbloquear em modo livre"
                  >
                    🔓
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-lg text-fg">{level.name}</p>
                    {completed && (
                      <span className="inline-flex items-center gap-1 rounded bg-success/15 px-1.5 py-0.5 font-mono text-[11px] font-medium text-success border border-success/30">
                        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Done
                      </span>
                    )}
                    {!unlocked && (
                      <span className="inline-flex items-center gap-1 rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle border border-border">
                        Clique para Inspecionar
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-fg-muted">{level.tagline}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {unlocked ? (
                  <div className="text-xl text-warning tracking-wider" aria-hidden="true">
                    {stars > 0 ? (
                      '★'.repeat(stars).padEnd(3, '☆')
                    ) : (
                      <span className="text-fg-subtle/30">☆☆☆</span>
                    )}
                  </div>
                ) : (
                  <div className="text-xs font-mono text-amber-400 font-bold" aria-hidden="true">
                    Inspeção Livre →
                  </div>
                )}
              </div>
              <span className="sr-only">{statusText}</span>
            </div>
          );
          return (
            <li key={level.id}>
              {unlocked ? (
                <Link to={`${basePath}/${level.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl">
                  {content}
                </Link>
              ) : (
                <Link
                  to={`${basePath}/${level.id}`}
                  onClick={() => setInspectAll(true)}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
                  title="Acessar desafio em Modo Inspeção"
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

