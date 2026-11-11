import { useEffect } from 'react';
import { useAchievementStore } from '../state/achievementStore';

export function AchievementBanner() {
  const { recentUnlocked, clearRecentBanner } = useAchievementStore();

  useEffect(() => {
    if (!recentUnlocked) return;
    const timer = setTimeout(() => {
      clearRecentBanner();
    }, 5000);
    return () => clearTimeout(timer);
  }, [recentUnlocked, clearRecentBanner]);

  if (!recentUnlocked) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex max-w-sm animate-in slide-in-from-bottom-5 duration-300 items-start gap-3 rounded-xl border border-warning/60 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-md font-mono text-xs">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/20 text-2xl border border-warning/40">
        {recentUnlocked.icon}
      </span>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-bold uppercase tracking-wider text-warning text-[10px]">
            Achievement Unlocked!
          </span>
          <span className="text-[10px] font-bold text-accent">+{recentUnlocked.points} XP</span>
        </div>
        <h4 className="font-bold text-fg text-sm mt-0.5">{recentUnlocked.title}</h4>
        <p className="text-fg-muted font-sans text-xs mt-0.5 leading-tight">
          {recentUnlocked.description}
        </p>
      </div>
      <button
        onClick={clearRecentBanner}
        className="text-fg-subtle hover:text-fg text-sm ml-1"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}
