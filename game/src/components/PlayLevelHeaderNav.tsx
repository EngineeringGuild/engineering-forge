import { Link, useNavigate } from 'react-router-dom';
import { soundFx } from '../audio/soundFx';

export interface LevelNavEntry {
  id: string;
  name: string;
}

interface PlayLevelHeaderNavProps {
  divisionTitle: string;
  divisionPath: string;
  currentLevelId: string;
  currentLevelName: string;
  levels: LevelNavEntry[];
  levelBasePath: string;
  className?: string;
}

export function PlayLevelHeaderNav({
  divisionTitle,
  divisionPath,
  currentLevelId,
  currentLevelName,
  levels,
  levelBasePath,
  className = '',
}: PlayLevelHeaderNavProps) {
  const navigate = useNavigate();
  const currentIndex = levels.findIndex((l) => l.id === currentLevelId);
  const prevLevel = currentIndex > 0 ? levels[currentIndex - 1] : null;
  const nextLevel = currentIndex >= 0 && currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;

  const handleLevelSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    soundFx.playSnapNode();
    const targetId = e.target.value;
    if (targetId && targetId !== currentLevelId) {
      navigate(`${levelBasePath}/${targetId}`);
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-surface-1/95 p-2 px-3 font-mono text-xs shadow-md backdrop-blur-md ${className}`}
    >
      {/* Left: Division Corridor Back Button & Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          to={divisionPath}
          onClick={() => soundFx.playTactileClick()}
          onMouseEnter={() => soundFx.playSubtleHover()}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-xs font-semibold text-fg-muted hover:border-accent hover:text-fg transition-all active:scale-95"
          title={`Voltar para o painel de ${divisionTitle}`}
        >
          <span className="text-accent font-bold">←</span>
          <span>{divisionTitle}</span>
        </Link>

        <span className="text-fg-subtle">/</span>

        <span className="hidden sm:inline font-bold text-fg truncate max-w-[200px]" title={currentLevelName}>
          {currentLevelName}
        </span>
      </div>

      {/* Center: Previous / Dropdown Switcher / Next Level Selector */}
      <div className="flex items-center gap-1.5">
        {/* Previous Level Button */}
        {prevLevel ? (
          <Link
            to={`${levelBasePath}/${prevLevel.id}`}
            onClick={() => soundFx.playSnapNode()}
            onMouseEnter={() => soundFx.playSubtleHover()}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface-2 text-xs font-bold text-fg hover:border-accent hover:text-accent transition-all"
            title={`Nível Anterior: ${prevLevel.name}`}
          >
            ◀
          </Link>
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/40 bg-surface-2/40 text-xs text-fg-subtle/40 cursor-not-allowed">
            ◀
          </span>
        )}

        {/* Level Selector Dropdown */}
        <select
          value={currentLevelId}
          onChange={handleLevelSelect}
          className="rounded-lg border border-border bg-surface-2 px-2 py-1 text-xs font-mono font-semibold text-fg focus:border-accent focus:outline-none cursor-pointer"
          title="Selecione qualquer desafio da divisão"
        >
          {levels.map((lvl, idx) => (
            <option key={lvl.id} value={lvl.id} className="bg-surface-1 text-fg">
              {idx + 1}. {lvl.name}
            </option>
          ))}
        </select>

        {/* Next Level Button */}
        {nextLevel ? (
          <Link
            to={`${levelBasePath}/${nextLevel.id}`}
            onClick={() => soundFx.playSnapNode()}
            onMouseEnter={() => soundFx.playSubtleHover()}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface-2 text-xs font-bold text-fg hover:border-accent hover:text-accent transition-all"
            title={`Próximo Nível: ${nextLevel.name}`}
          >
            ▶
          </Link>
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/40 bg-surface-2/40 text-xs text-fg-subtle/40 cursor-not-allowed">
            ▶
          </span>
        )}
      </div>

      {/* Right: Quick Home Hub Link */}
      <div className="flex items-center gap-1.5">
        <Link
          to="/"
          onClick={() => soundFx.playTactileClick()}
          onMouseEnter={() => soundFx.playSubtleHover()}
          className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-2 py-1 text-xs text-fg-muted hover:border-accent hover:text-fg transition-all"
          title="Voltar para a Forja (Menu Principal)"
        >
          <span>🏠</span>
          <span className="hidden sm:inline">Hub</span>
        </Link>
      </div>
    </div>
  );
}
