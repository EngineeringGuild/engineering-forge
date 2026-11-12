import { Link, useLocation } from 'react-router-dom';
import { soundFx } from '../audio/soundFx';
import { useForgeEconomyStore } from '../state/forgeEconomyStore';

interface GlobalNavBarProps {
  className?: string;
  compact?: boolean;
}

export function GlobalNavBar({ className = '', compact = false }: GlobalNavBarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const wallet = useForgeEconomyStore((s) => s.wallet);

  const navLinks = [
    { path: '/', label: 'The Forge', icon: '⚡', exact: true },
    { path: '/structures', label: 'Estruturas', icon: '🏗️' },
    { path: '/circuits', label: 'Circuitos', icon: '⚡' },
    { path: '/machines', label: 'Máquinas', icon: '🏎️' },
    { path: '/mechatronics', label: 'Mecatrônica', icon: '🤖' },
    { path: '/lab', label: 'Laboratório', icon: '🔬' },
    { path: '/educator', label: 'Educador', icon: '🎓' },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) return currentPath === path;
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  return (
    <nav
      aria-label="Navegação Global da Forja"
      className={`border-b border-border/80 bg-surface-1/95 px-3 py-2 font-mono text-xs shadow-md backdrop-blur-md z-40 ${className}`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2.5">
        {/* Brand / Logo link to home */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            onClick={() => soundFx.playSnapNode()}
            onMouseEnter={() => soundFx.playSubtleHover()}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1 font-display font-extrabold tracking-wider text-fg hover:text-accent transition-colors"
            title="Ir para o Hub Central da Forja"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-accent text-sm">FORGE</span>
            <span className="text-[10px] text-fg-subtle border border-border px-1 py-0.2 rounded bg-surface-2 font-mono">
              v3.0
            </span>
          </Link>
        </div>

        {/* Division Corridor Fast Navigation Links */}
        <div className="flex flex-wrap items-center gap-1 overflow-x-auto py-0.5">
          {navLinks.map((link) => {
            const active = isActive(link.path, link.exact);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => soundFx.playTactileClick()}
                onMouseEnter={() => soundFx.playSubtleHover()}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  active
                    ? 'border border-accent/60 bg-accent/15 text-accent shadow-sm'
                    : 'border border-transparent text-fg-muted hover:border-border hover:bg-surface-2 hover:text-fg'
                }`}
                title={`Acessar divisão ${link.label}`}
              >
                <span>{link.icon}</span>
                <span className={compact ? 'hidden md:inline' : 'inline'}>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: Guild Telemetry & Wallet Badge */}
        <div className="hidden sm:flex items-center gap-2 text-[11px]">
          <div
            className="flex items-center gap-1.5 rounded bg-surface-2/90 px-2 py-0.5 border border-border"
            title="Saldo de Créditos da Guilda"
          >
            <span className="text-accent font-bold">₣</span>
            <span className="tabular-nums font-bold text-fg">{wallet.credits}</span>
          </div>

          <div
            className="flex items-center gap-1.5 rounded bg-surface-2/90 px-2 py-0.5 border border-border"
            title="Pontos de P&D (Research Points)"
          >
            <span className="text-cyan-400 font-bold">RP</span>
            <span className="tabular-nums font-bold text-fg">{wallet.researchPoints}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
