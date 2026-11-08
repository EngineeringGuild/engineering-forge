import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MaterialTestBench } from '../components/MaterialTestBench';
import { SandboxWorkspace } from '../components/SandboxWorkspace';

export function LabPage() {
  const [activeTab, setActiveTab] = useState<'bench' | 'sandbox'>('sandbox');

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
              Engineering Lab & Sandbox
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-fg mt-1">
            {activeTab === 'sandbox'
              ? "The Tinkerer's Workshop & Free Sandbox"
              : 'Materials & Multi-Physics Continuum Bench'}
          </h1>
          <p className="text-sm text-fg-muted font-sans mt-0.5">
            {activeTab === 'sandbox'
              ? 'Unconstrained sandbox mode: build infinite-budget bridge chasm spans, custom breadboard networks, and dialled vehicle test runs.'
              : 'Interactive test bench: verify Euler-Bernoulli beam flexure, Euler compressive buckling, Pacejka tire traction, electro-thermal Joule coupling, and aerodynamic FSI.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Main Lab Switcher */}
          <div className="flex items-center gap-1 rounded-xl bg-surface-2 p-1 border border-border">
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`rounded-lg px-3 py-1.5 font-bold text-xs transition-colors ${
                activeTab === 'sandbox'
                  ? 'bg-accent text-accent-fg shadow-sm'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              🛠️ Free Sandbox
            </button>
            <button
              onClick={() => setActiveTab('bench')}
              className={`rounded-lg px-3 py-1.5 font-bold text-xs transition-colors ${
                activeTab === 'bench'
                  ? 'bg-accent text-accent-fg shadow-sm'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              🔬 Material Bench
            </button>
          </div>
        </div>
      </header>

      {/* Active Tab View */}
      {activeTab === 'sandbox' ? <SandboxWorkspace /> : <MaterialTestBench />}
    </div>
  );
}
