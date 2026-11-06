import { Link } from 'react-router-dom';
import { useGlobalProgress } from '../state/useProgressTracker';

interface PackCard {
  id: string;
  path: string;
  name: string;
  tagline: string;
  status: 'available' | 'coming-soon';
}

const PACKS: PackCard[] = [
  {
    id: 'structures',
    path: '/structures',
    name: 'Structures',
    tagline: 'Build a bridge. Real truss statics decide if it holds.',
    status: 'available',
  },
  {
    id: 'circuits',
    path: '/circuits',
    name: 'Circuits',
    tagline: 'Wire a circuit. Ohm’s law decides if it lights up — or burns out.',
    status: 'available',
  },
  {
    id: 'machines',
    path: '/machines',
    name: 'Machines',
    tagline: 'Spec an engine and chassis. Newton decides how fast it goes.',
    status: 'available',
  },
  {
    id: 'lab',
    path: '/lab',
    name: 'Materials Lab',
    tagline: 'Test beam bending, elasticity, density & Euler buckling in real-time.',
    status: 'available',
  },
];

export function PackSelect() {
  const globalProgress = useGlobalProgress();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-8 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Engineering Forge
        </p>
        <h1 className="font-display text-4xl font-semibold text-fg">The Forge</h1>
        <p className="mt-2 text-fg-muted">
          You're an apprentice. Every level asks for a functional artifact — the physics decides
          if it holds.
        </p>
      </header>

      {/* Global Achievement & Progress Banner */}
      <div className="mb-6 rounded-xl border border-border bg-surface-1/90 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-accent border border-accent/40 font-mono text-xs font-bold">
              ⚡
            </span>
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-fg-muted font-medium block">
                Forge Apprenticeship Progress
              </span>
              <span className="text-xs text-fg">
                Overall Mastery: <strong className="text-accent">{globalProgress.percent}%</strong>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="rounded bg-surface-2 px-2.5 py-1 border border-border text-fg-muted">
              Levels: <strong className="text-fg">{globalProgress.completedLevels}/{globalProgress.totalLevels}</strong>
            </span>
            <span className="rounded bg-surface-2 px-2.5 py-1 border border-border text-warning">
              ★ <strong>{globalProgress.earnedStars}/{globalProgress.maxStars}</strong>
            </span>
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500 shadow-[0_0_10px_rgba(255,106,44,0.4)]"
            style={{ width: `${globalProgress.percent}%` }}
          />
        </div>
      </div>

      <ol className="flex flex-col gap-3">
        {PACKS.map((pack) => {
          const available = pack.status === 'available';
          const packData = pack.id !== 'lab' ? globalProgress.packs[pack.id as 'structures' | 'circuits' | 'machines'] : null;
          const completed = packData?.completed ?? 0;
          const total = packData?.total ?? 0;
          const allCompleted = packData?.isAllCompleted ?? false;

          const cardStyle = !available
            ? 'border-border/50 bg-surface-1/40 opacity-50'
            : allCompleted
            ? 'border-success/60 bg-surface-1/90 shadow-[0_0_15px_-2px_rgba(22,163,74,0.35)] ring-1 ring-success/30 hover:border-success hover:shadow-[0_0_20px_-2px_rgba(22,163,74,0.5)]'
            : 'border-border bg-surface-1 hover:border-accent hover:shadow-[0_0_12px_-3px_rgba(255,106,44,0.25)]';

          const content = (
            <div
              className={`flex items-center justify-between rounded-xl border px-5 py-4 transition-all duration-200 ${cardStyle}`}
            >
              <div className="text-left">
                <div className="flex items-center gap-2.5">
                  <p className="font-display text-lg text-fg">{pack.name}</p>
                  {allCompleted && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/20 text-success border border-success/30">
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
                <p className="text-sm text-fg-muted">{pack.tagline}</p>
              </div>
              <div className="flex items-center gap-2">
                {available ? (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-mono font-medium ${
                      pack.id === 'lab'
                        ? 'bg-accent/20 text-accent border border-accent/40'
                        : allCompleted
                        ? 'bg-success/20 text-success border border-success/40'
                        : completed > 0
                        ? 'bg-surface-2 text-fg border border-border'
                        : 'bg-surface-2/60 text-fg-subtle border border-border/40'
                    }`}
                  >
                    {pack.id === 'lab'
                      ? '🔬 Test Bench'
                      : allCompleted
                      ? '✓ Completed'
                      : `${completed}/${total} Levels`}
                  </span>
                ) : (
                  <span className="rounded-full border border-border px-2 py-1 text-xs text-fg-subtle">
                    Soon
                  </span>
                )}
              </div>
            </div>
          );
          return (
            <li key={pack.id}>
              {available ? (
                <Link to={pack.path}>{content}</Link>
              ) : (
                <div className="cursor-not-allowed">{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

