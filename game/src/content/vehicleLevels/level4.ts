import type { VehicleLevelDef } from '../vehicleTypes';

export const level4: VehicleLevelDef = {
  id: 'level-4',
  order: 4,
  name: 'The Sweet Spot',
  tagline: 'Arriving too hard fails the handoff just as much as arriving too soft.',
  hint:
    "This run has a ceiling, not just a floor: land between 20 and 25 m/s. The strongest engine you own isn't the answer here — it'll blow straight through the top of the window. Work out each engine+chassis combo's speed and pick the one that lands inside the range, not just above the minimum.",
  distance: 100,
  targetSpeed: 20,
  maxSpeed: 25,
  budget: 4500,
  unlockedEngines: ['engine-small', 'engine-large', 'engine-turbo'],
  unlockedChassis: ['chassis-light', 'chassis-heavy'],
};
