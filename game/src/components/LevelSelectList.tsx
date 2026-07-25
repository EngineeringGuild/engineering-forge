import { Link } from 'react-router-dom';

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
}

export function LevelSelectList({ levels, basePath, isLevelUnlocked, starsFor }: Props) {
  return (
    <ol className="flex flex-col gap-3">
      {levels.map((level) => {
        const unlocked = isLevelUnlocked(level.id);
        const stars = starsFor(level.id);
        const statusText = unlocked
          ? stars > 0
            ? `, ${stars} of 3 stars`
            : ', not yet completed'
          : ', locked';
        const content = (
          <div
            className={`flex items-center justify-between rounded-xl border px-5 py-4 transition-colors ${
              unlocked
                ? 'border-border bg-surface-1 hover:border-accent'
                : 'border-border/50 bg-surface-1/40 opacity-50'
            }`}
          >
            <div className="text-left">
              <p className="font-display text-lg text-fg">{level.name}</p>
              <p className="text-sm text-fg-muted">{level.tagline}</p>
            </div>
            <div className="text-xl text-warning" aria-hidden="true">
              {unlocked ? (stars > 0 ? '★'.repeat(stars).padEnd(3, '☆') : '☆☆☆') : '🔒'}
            </div>
            <span className="sr-only">{statusText}</span>
          </div>
        );
        return (
          <li key={level.id}>
            {unlocked ? (
              <Link to={`${basePath}/${level.id}`}>{content}</Link>
            ) : (
              <div className="cursor-not-allowed" aria-disabled="true">
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
