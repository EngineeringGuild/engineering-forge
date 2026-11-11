import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalProgress } from '../state/useProgressTracker';
import { SoundSettingsModal } from '../components/SoundSettingsModal';
import { AchievementsModal } from '../components/AchievementsModal';
import { soundFx } from '../audio/soundFx';

interface PackCard {
  id: string;
  path: string;
  name: string;
  tagline: string;
  disciplineIcon: string;
  methodology: string;
  status: 'available' | 'coming-soon';
}

const PACKS: PackCard[] = [
  {
    id: 'structures',
    path: '/structures',
    name: 'Structures',
    tagline: 'Build a bridge. Real truss statics decide if it holds.',
    disciplineIcon: '🏗️',
    methodology: 'Direct Stiffness Method (DSM) · Axial Tension & Compression',
    status: 'available',
  },
  {
    id: 'circuits',
    path: '/circuits',
    name: 'Circuits',
    tagline: 'Wire a circuit. Ohm’s law decides if it lights up — or burns out.',
    disciplineIcon: '⚡',
    methodology: 'Laplacian Nodal Matrix · Kirchhoff Laws · Joule Heating',
    status: 'available',
  },
  {
    id: 'machines',
    path: '/machines',
    name: 'Machines & Powertrain',
    tagline: 'Spec an engine and chassis. Newton decides how fast it goes.',
    disciplineIcon: '🏎️',
    methodology: 'F=ma Kinematics · Coulomb Friction Grip · Slope Mechanics',
    status: 'available',
  },
  {
    id: 'mechatronics',
    path: '/mechatronics',
    name: 'Mechatronics & Systems',
    tagline: 'Couple electric winches, relays, and logic interlocks to control dynamic bridges.',
    disciplineIcon: '🤖',
    methodology: 'Electromechanical Coupling · Boolean Logic · Limit Switches',
    status: 'available',
  },
  {
    id: 'lab',
    path: '/lab',
    name: 'Lab & Virtual Test Bench',
    tagline: 'Free parametric sandbox workshop, virtual DMM/DSO & ASME/IEEE/ISO reports.',
    disciplineIcon: '🔬',
    methodology: 'Euler-Bernoulli Bending · Pacejka Curve · Reverse Troubleshooting',
    status: 'available',
  },
];

function getEngineerRank(percent: number) {
  if (percent >= 100) return { title: 'Chief Forgemaster', classGrade: 'Grade S · Mastered', badgeClass: 'text-warning border-warning/50 bg-warning/10 shadow-[0_0_12px_rgba(255,184,0,0.3)]' };
  if (percent >= 75) return { title: 'Master Systems Engineer', classGrade: 'Grade A · Advanced', badgeClass: 'text-accent border-accent/50 bg-accent/10 shadow-[0_0_10px_rgba(255,106,44,0.3)]' };
  if (percent >= 50) return { title: 'Senior Stress Analyst', classGrade: 'Grade B · Intermediate', badgeClass: 'text-info border-info/50 bg-info/10' };
  if (percent >= 25) return { title: 'Junior Systems Drafter', classGrade: 'Grade C · Practicing', badgeClass: 'text-success border-success/50 bg-success/10' };
  return { title: 'Apprentice Mechanician', classGrade: 'Grade D · Entry', badgeClass: 'text-fg-muted border-border bg-surface-2' };
}

export function PackSelect() {
  const globalProgress = useGlobalProgress();
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const rank = useMemo(() => getEngineerRank(globalProgress.percent), [globalProgress.percent]);

  return (
    <div className="min-h-screen bg-bg text-fg selection:bg-accent selection:text-accent-foreground py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        
        {/* Diegetic Industrial System Telemetry Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/80 bg-surface-1/90 px-4 py-2 font-mono text-[11px] text-fg-subtle backdrop-blur-md">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-fg">
              <span className="led-indicator led-green animate-pulse" />
              <span>TERMINAL STATUS: ONLINE</span>
            </span>
            <span className="hidden sm:inline border-l border-border pl-3">
              SOLVER: <strong className="text-info">DSM+NEWTON-60FPS</strong>
            </span>
            <span className="hidden md:inline border-l border-border pl-3">
              SUBSYSTEMS: <strong className="text-success">5/5 NOMINAL</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playTactileClick();
                setShowAchievements(true);
              }}
              onMouseEnter={() => soundFx.playSubtleHover()}
              title="Engineering Milestones & Trophy Shelf"
              className="flex items-center gap-1.5 rounded border border-warning/40 bg-surface-2/80 px-2.5 py-1 font-mono text-xs text-warning hover:bg-warning/20 hover:border-warning transition-all active:scale-95"
            >
              <span>🏆</span>
              <span>Trophies</span>
            </button>
            <button
              onClick={() => {
                soundFx.playTactileClick();
                setShowSoundSettings(true);
              }}
              onMouseEnter={() => soundFx.playSubtleHover()}
              title="Audio Synthesis Settings"
              className="flex items-center gap-1.5 rounded border border-border bg-surface-2/80 px-2.5 py-1 font-mono text-xs text-fg-muted hover:border-accent hover:text-fg transition-all active:scale-95"
            >
              <span>🔊</span>
              <span>Audio</span>
            </button>
          </div>
        </div>

        {/* Forge Industrial Header */}
        <header className="relative mb-8 text-center sm:text-left sm:flex sm:items-end sm:justify-between border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
                ENGINEERING FORGE
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/10 border border-accent/30 text-accent">
                v3.0.0 PHYSICAL SUITE
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-fg flex items-center justify-center sm:justify-start gap-3">
              <span>The Forge</span>
              <span className="text-accent text-3xl sm:text-4xl">⚙️</span>
            </h1>
            <p className="mt-2 text-sm text-fg-muted max-w-xl">
              Real-world engineering laboratory. Design physical artifacts — structural trusses, circuit topologies, and mechanical powertrains. Let the laws of physics determine failure or triumph.
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex flex-col items-center sm:items-end">
            <div className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold ${rank.badgeClass}`}>
              <div className="text-[10px] uppercase tracking-wider opacity-80">Guild Title</div>
              <div className="text-sm">{rank.title}</div>
            </div>
            <span className="text-[10px] font-mono text-fg-subtle mt-1">{rank.classGrade}</span>
          </div>
        </header>

        {/* Engineering Command Mastery Card */}
        <div className="industrial-panel mb-8 rounded-xl p-5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/15 border border-accent/40 text-accent font-mono text-lg font-bold shadow-inner">
                ⚡
              </div>
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-fg-subtle font-medium block">
                  APPRENTICESHIP CERTIFICATION PROGRESS
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-display font-bold text-fg">
                    Mastery <span className="text-accent">{globalProgress.percent}%</span>
                  </span>
                  <span className="text-xs font-mono text-fg-subtle">
                    ({globalProgress.completedLevels}/{globalProgress.totalLevels} Challenges Cleared)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="rounded-lg bg-surface-2/90 px-3 py-1.5 border border-border shadow-sm">
                <span className="text-fg-subtle block text-[10px] uppercase">Earned Stars</span>
                <span className="text-warning font-bold text-sm">
                  ★ {globalProgress.earnedStars} <span className="text-fg-subtle font-normal text-xs">/ {globalProgress.maxStars}</span>
                </span>
              </div>
              <div className="rounded-lg bg-surface-2/90 px-3 py-1.5 border border-border shadow-sm">
                <span className="text-fg-subtle block text-[10px] uppercase">Safety Margin</span>
                <span className="text-success font-bold text-sm">
                  SF ≥ 1.50
                </span>
              </div>
            </div>
          </div>

          {/* Precision Meter Bar */}
          <div className="mt-4">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2 border border-border/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent via-warning to-accent transition-all duration-700 shadow-[0_0_12px_rgba(255,106,44,0.5)]"
                style={{ width: `${globalProgress.percent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-fg-subtle mt-1.5 px-0.5">
              <span>0% APPRENTICE</span>
              <span>50% ANALYST</span>
              <span>100% FORGEMASTER</span>
            </div>
          </div>
        </div>

        {/* Engineering Disciplines Grid */}
        <section aria-labelledby="disciplines-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="disciplines-heading" className="font-mono text-xs uppercase tracking-widest text-fg-subtle font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span>FACILITY MODULES & DISCIPLINE CORRIDORS</span>
            </h2>
            <span className="font-mono text-[11px] text-fg-subtle">SELECT A DIVISION</span>
          </div>

          <ol className="flex flex-col gap-3.5">
            {PACKS.map((pack) => {
              const available = pack.status === 'available';
              const packData = pack.id !== 'lab' ? globalProgress.packs[pack.id as 'structures' | 'circuits' | 'machines' | 'mechatronics'] : null;
              const completed = packData?.completed ?? 0;
              const total = packData?.total ?? 0;
              const allCompleted = packData?.isAllCompleted ?? false;

              const cardStyle = !available
                ? 'border-border/50 bg-surface-1/40 opacity-50'
                : allCompleted
                ? 'border-success/60 bg-surface-1/95 shadow-[0_0_18px_-2px_rgba(22,163,74,0.35)] ring-1 ring-success/30 hover:border-success hover:shadow-[0_0_24px_-2px_rgba(22,163,74,0.5)]'
                : 'border-border/90 bg-surface-1/90 hover:border-accent hover:shadow-[0_0_18px_-2px_rgba(255,106,44,0.3)] hover:bg-surface-1';

              const content = (
                <div
                  onMouseEnter={() => soundFx.playSubtleHover()}
                  onClick={() => soundFx.playTactileClick()}
                  className={`group relative overflow-hidden rounded-xl border p-5 transition-all duration-200 active:scale-[0.99] ${cardStyle}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2 border border-border text-2xl shadow-inner group-hover:scale-105 group-hover:border-accent/50 transition-transform">
                        {pack.disciplineIcon}
                      </div>

                      <div className="text-left">
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-display text-lg font-bold text-fg group-hover:text-accent transition-colors">
                            {pack.name}
                          </h3>
                          {allCompleted && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/20 text-success border border-success/40" title="All division levels completed">
                              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-fg-muted mt-0.5 line-clamp-1">{pack.tagline}</p>
                        <p className="text-[11px] font-mono text-fg-subtle mt-1 hidden sm:block">
                          {pack.methodology}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                      {available ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-mono font-medium ${
                              pack.id === 'lab'
                                ? 'bg-accent/20 text-accent border border-accent/40 shadow-[0_0_8px_rgba(255,106,44,0.3)]'
                                : allCompleted
                                ? 'bg-success/20 text-success border border-success/40'
                                : completed > 0
                                ? 'bg-surface-2 text-fg border border-border'
                                : 'bg-surface-2/60 text-fg-subtle border border-border/40'
                            }`}
                          >
                            {pack.id === 'lab'
                              ? '🔬 Open Test Bench'
                              : allCompleted
                              ? '✓ 100% Cleared'
                              : `${completed}/${total} Cleared`}
                          </span>
                          <span className="text-fg-subtle group-hover:text-accent group-hover:translate-x-1 transition-all">
                            →
                          </span>
                        </div>
                      ) : (
                        <span className="rounded-full border border-border px-2.5 py-1 text-xs font-mono text-fg-subtle">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );

              return (
                <li key={pack.id}>
                  {available ? (
                    <Link to={pack.path} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl">
                      {content}
                    </Link>
                  ) : (
                    <div className="cursor-not-allowed">{content}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        {/* Secondary Educational & Manufacturing Portal Teasers */}
        <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/educator"
            onMouseEnter={() => soundFx.playSubtleHover()}
            onClick={() => soundFx.playTactileClick()}
            className="industrial-panel rounded-xl p-4 border border-border/80 hover:border-accent hover:shadow-[0_0_15px_-3px_rgba(255,106,44,0.3)] transition-all block group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-accent font-semibold flex items-center gap-1.5">
                <span className="led-indicator led-cyan" />
                ACADEMY CORRIDOR
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-2 border border-border text-fg-subtle">
                DISPONÍVEL
              </span>
            </div>
            <h4 className="font-display font-bold text-fg text-base group-hover:text-accent transition-colors">
              Modo Educador & Salas de Aula
            </h4>
            <p className="text-xs text-fg-muted mt-1">
              Trilhas didáticas estruturadas para professores de física e ciências, restrições de inventário e gabaritos automáticos.
            </p>
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-accent group-hover:translate-x-1 transition-transform">
                <span>Acessar Academia do Educador</span>
                <span>→</span>
              </span>
            </div>
          </Link>

          <div className="industrial-panel rounded-xl p-4 border border-border/80">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-warning font-semibold flex items-center gap-1.5">
                <span className="led-indicator led-amber" />
                DIGITAL-TO-PHYSICAL
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-2 border border-border text-fg-subtle">
                DOC-09
              </span>
            </div>
            <h4 className="font-display font-bold text-fg text-base">Exportador CAD/3D & NFT Digital Twin</h4>
            <p className="text-xs text-fg-muted mt-1">
              Exportação paramétrica de conectores STL para impressão 3D, corte a laser DXF e registro de veículos homologados.
            </p>
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-warning">
                <span>Roteiro Homologado em DOC-09</span>
                <span>→</span>
              </span>
            </div>
          </div>
        </section>

        {/* Footer Technical Stamp */}
        <footer className="mt-10 border-t border-border/40 pt-4 flex flex-wrap items-center justify-between text-[11px] font-mono text-fg-subtle gap-2">
          <div>
            <span>ENGINEERING GUILD</span> · <span>IDEA-010 A FORJA</span>
          </div>
          <div>
            <span>COMPLIANCE: ASME · IEEE · ISO · BNCC · NGSS</span>
          </div>
        </footer>

        <SoundSettingsModal
          isOpen={showSoundSettings}
          onClose={() => setShowSoundSettings(false)}
        />

        <AchievementsModal
          isOpen={showAchievements}
          onClose={() => setShowAchievements(false)}
        />
      </div>
    </div>
  );
}
