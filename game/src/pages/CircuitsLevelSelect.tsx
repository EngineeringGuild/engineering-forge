import { LevelSelectList } from '../components/LevelSelectList';
import { CIRCUIT_LEVELS } from '../content/circuitLevels';
import { useCircuitStore } from '../state/circuitStore';
import { usePackProgress } from '../state/useProgressTracker';
import { CompletionBadge } from '../components/CompletionBadge';
import { ForgeDivisionHeader } from '../components/ForgeDivisionHeader';

export function CircuitsLevelSelect() {
  const progress = useCircuitStore((s) => s.progress);
  const isLevelUnlocked = useCircuitStore((s) => s.isLevelUnlocked);
  const { completed, total } = usePackProgress('circuits');

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <ForgeDivisionHeader
        divisionCode="DIV-02 // ELECTRICAL CIRCUITS"
        disciplineTitle="Electrical Engineering"
        disciplineSubtitle="DC Circuit Topologies"
        tagline="Wire circuits, balance series and parallel branches. Laplacian nodal analysis computes exact currents, node voltages, and Joule dissipation."
        completedCount={completed}
        totalCount={total}
        disciplineIcon="⚡"
      />

      {/* Persistent Category Completion Badge */}
      <CompletionBadge category="circuits" className="mb-6" />

      <LevelSelectList
        levels={CIRCUIT_LEVELS}
        basePath="/circuits/level"
        isLevelUnlocked={isLevelUnlocked}
        starsFor={(id) => progress[id]?.stars ?? 0}
      />
    </div>
  );
}
