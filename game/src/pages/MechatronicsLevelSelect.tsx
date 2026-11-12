import { Link } from 'react-router-dom';
import { MECHATRONICS_LEVELS } from '../content/mechatronicsLevels';
import { useMechatronicsStore } from '../state/mechatronicsStore';
import { useGameProgressionStore } from '../state/gameProgressionStore';
import { ForgeDivisionHeader } from '../components/ForgeDivisionHeader';
import { soundFx } from '../audio/soundFx';

export function MechatronicsLevelSelect() {
  const store = useMechatronicsStore();
  const progressionStore = useGameProgressionStore();
  const badge = progressionStore.getCategoryBadge('mechatronics');

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 font-mono">
      <ForgeDivisionHeader
        divisionCode="DIV-04 // MECHATRONICS & SYSTEMS"
        disciplineTitle="Mechatronics Engineering"
        disciplineSubtitle="Coupled Dynamic Systems"
        tagline="Where structures, circuits, and kinematics converge. Couple electric winches, electromechanical relays, and safety logic interlocks to control dynamic engineering systems."
        completedCount={badge.completedCount}
        totalCount={badge.totalCount}
        disciplineIcon="🤖"
      />

      {/* Level Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {MECHATRONICS_LEVELS.map((lvl, idx) => {
          const unlocked = store.isLevelUnlocked(lvl.id);
          const progress = store.progress[lvl.id];
          const completed = (progress?.stars ?? 0) > 0;
          const stars = progress?.stars ?? 0;

          return (
            <div
              key={lvl.id}
              onMouseEnter={() => unlocked && soundFx.playSubtleHover()}
              className={`relative flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 ${
                !unlocked
                  ? 'border-border/40 bg-surface-1/40 opacity-60'
                  : completed
                  ? 'border-success/60 bg-surface-1/90 shadow-md ring-1 ring-success/20 hover:border-success'
                  : 'border-border/90 bg-surface-1/90 hover:border-accent hover:shadow-lg'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent">
                    CHALLENGE 0{idx + 1}
                  </span>
                  {completed ? (
                    <span className="flex items-center gap-1 text-xs text-warning font-bold">
                      {'★'.repeat(stars)}
                      <span className="text-fg-subtle">{'☆'.repeat(3 - stars)}</span>
                    </span>
                  ) : unlocked ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-fg-muted bg-surface-2 px-2 py-0.5 rounded border border-border">
                      Available
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-fg-subtle bg-surface-2/40 px-2 py-0.5 rounded border border-border/40">
                      Locked
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-bold text-fg mt-2 font-display">{lvl.name}</h2>
                <p className="text-xs text-fg-muted mt-1 font-sans line-clamp-2">
                  {lvl.tagline}
                </p>

                <div className="mt-4 flex flex-col gap-1 border-t border-border/40 pt-3 text-[11px] text-fg-subtle">
                  <div className="flex justify-between">
                    <span>Target Clearance:</span>
                    <strong className="text-fg font-mono">{lvl.targetClearanceAngleDeg}°</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Allowable Tension:</span>
                    <strong className="text-fg font-mono">{lvl.maxAllowableTensionKn} kN</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Budget Limit:</span>
                    <strong className="text-fg font-mono">${lvl.budget}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-2">
                {unlocked ? (
                  <Link
                    to={`/mechatronics/level/${lvl.id}`}
                    onClick={() => soundFx.playTactileClick()}
                    className={`block w-full text-center rounded-lg py-2 text-xs font-bold transition-all active:scale-95 ${
                      completed
                        ? 'bg-surface-2 text-fg hover:bg-surface-3 border border-border hover:border-success'
                        : 'bg-accent text-accent-fg hover:opacity-90 shadow-[0_0_10px_rgba(255,106,44,0.3)]'
                    }`}
                  >
                    {completed ? 'Review Solution' : 'Engage System →'}
                  </Link>
                ) : (
                  <Link
                    to={`/mechatronics/level/${lvl.id}`}
                    onClick={() => soundFx.playTactileClick()}
                    className="block w-full text-center rounded-lg py-2 text-xs font-bold transition-all active:scale-95 bg-surface-2/80 text-amber-300 hover:border-amber-400/80 border border-border"
                    title="Acessar desafio em modo livre de inspeção da Guilda"
                  >
                    Inspeção Livre →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
