import { Link } from 'react-router-dom';

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
    path: '#',
    name: 'Machines',
    tagline: 'Coming soon.',
    status: 'coming-soon',
  },
];

export function PackSelect() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-10 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Engineering Forge
        </p>
        <h1 className="font-display text-4xl font-semibold text-fg">The Forge</h1>
        <p className="mt-2 text-fg-muted">
          You're an apprentice. Every level asks for a functional artifact — the physics decides
          if it holds.
        </p>
      </header>

      <ol className="flex flex-col gap-3">
        {PACKS.map((pack) => {
          const available = pack.status === 'available';
          const content = (
            <div
              className={`flex items-center justify-between rounded-xl border px-5 py-4 transition-colors ${
                available
                  ? 'border-border bg-surface-1 hover:border-accent'
                  : 'border-border/50 bg-surface-1/40 opacity-50'
              }`}
            >
              <div className="text-left">
                <p className="font-display text-lg text-fg">{pack.name}</p>
                <p className="text-sm text-fg-muted">{pack.tagline}</p>
              </div>
              {!available && (
                <span className="rounded-full border border-border px-2 py-1 text-xs text-fg-subtle">
                  Soon
                </span>
              )}
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
