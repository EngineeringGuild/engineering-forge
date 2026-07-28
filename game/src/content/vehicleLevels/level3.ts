import type { VehicleLevelDef } from '../vehicleTypes';

export const level3: VehicleLevelDef = {
  id: 'level-3',
  order: 3,
  name: 'Delivery Run',
  tagline: 'A 400kg crate rides along this time — it counts, whether you picked it or not.',
  hint:
    "This run is flat, same distance as before — but there's a fixed 400kg crate aboard, and it's not optional. Mass is mass to F=ma, whether it's chassis or cargo: the combo that cleared this same distance easily back in the tutorial won't clear it loaded. Reach for more force, not a lighter chassis alone — the crate outweighs the difference between chassis choices.",
  distance: 100,
  targetSpeed: 32,
  payloadMass: 400,
  budget: 6200,
  unlockedEngines: ['engine-small', 'engine-large', 'engine-turbo'],
  unlockedChassis: ['chassis-light', 'chassis-heavy'],
};
