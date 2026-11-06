import { Link } from 'react-router-dom';
import { MaterialTestBench } from '../components/MaterialTestBench';

export function LabPage() {
  return (
    <div className="mx-auto flex min-h-svh max-w-5xl flex-col gap-6 p-6 font-mono">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-xs text-accent hover:underline flex items-center gap-1 font-bold"
            >
              ← Back to The Forge
            </Link>
            <span className="text-fg-subtle">/</span>
            <span className="text-xs text-fg-muted font-bold uppercase tracking-wider">
              Engineering Lab
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-fg mt-1">
            Materials & Continuum Mechanics Bench
          </h1>
          <p className="text-sm text-fg-muted font-sans mt-0.5">
            Phase 2 interactive test environment: verify Euler-Bernoulli beam elasticity, Euler column buckling, and real-time thermal expansion.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-lg bg-surface-2 border border-border px-3 py-1.5 text-fg font-semibold">
            ASTM E111 / AISC 360-16
          </span>
        </div>
      </header>

      {/* Interactive Material Test Bench */}
      <MaterialTestBench />
    </div>
  );
}
