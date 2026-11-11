import { LevelSelectList } from '../components/LevelSelectList';
import { VEHICLE_LEVELS } from '../content/vehicleLevels';
import { useVehicleStore } from '../state/vehicleStore';
import { usePackProgress } from '../state/useProgressTracker';
import { CompletionBadge } from '../components/CompletionBadge';
import { ForgeDivisionHeader } from '../components/ForgeDivisionHeader';

export function VehiclesLevelSelect() {
  const progress = useVehicleStore((s) => s.progress);
  const isLevelUnlocked = useVehicleStore((s) => s.isLevelUnlocked);
  const { completed, total } = usePackProgress('machines');

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <ForgeDivisionHeader
        divisionCode="DIV-03 // POWERTRAIN & MACHINES"
        disciplineTitle="Mechanical Dynamics"
        disciplineSubtitle="Kinematics & Friction"
        tagline="Spec an engine and chassis combination. Newton's 2nd Law and Coulomb friction determine maximum grip, slope ascent, and target velocity."
        completedCount={completed}
        totalCount={total}
        disciplineIcon="🏎️"
      />

      {/* Persistent Category Completion Badge */}
      <CompletionBadge category="machines" className="mb-6" />

      <LevelSelectList
        levels={VEHICLE_LEVELS}
        basePath="/machines/level"
        isLevelUnlocked={isLevelUnlocked}
        starsFor={(id) => progress[id]?.stars ?? 0}
      />
    </div>
  );
}
