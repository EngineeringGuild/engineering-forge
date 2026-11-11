import { LevelSelectList } from '../components/LevelSelectList';
import { LEVELS } from '../content/levels';
import { useGameStore } from '../state/gameStore';
import { usePackProgress } from '../state/useProgressTracker';
import { CompletionBadge } from '../components/CompletionBadge';
import { ForgeDivisionHeader } from '../components/ForgeDivisionHeader';

export function StructuresLevelSelect() {
  const progress = useGameStore((s) => s.progress);
  const isLevelUnlocked = useGameStore((s) => s.isLevelUnlocked);
  const { completed, total } = usePackProgress('structures');

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <ForgeDivisionHeader
        divisionCode="DIV-01 // STRUCTURES & STATICS"
        disciplineTitle="Structural Engineering"
        disciplineSubtitle="Trusses & Bridges"
        tagline="Design load-bearing trusses and suspension spans. Direct Stiffness Method (DSM) computes axial tensions and compression limits."
        completedCount={completed}
        totalCount={total}
        disciplineIcon="🏗️"
      />

      {/* Persistent Category Completion Badge */}
      <CompletionBadge category="structures" className="mb-6" />

      <LevelSelectList
        levels={LEVELS}
        basePath="/structures/level"
        isLevelUnlocked={isLevelUnlocked}
        starsFor={(id) => progress[id]?.stars ?? 0}
      />
    </div>
  );
}
