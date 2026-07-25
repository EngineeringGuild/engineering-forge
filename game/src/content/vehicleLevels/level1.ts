import type { VehicleLevelDef } from '../vehicleTypes';

export const level1: VehicleLevelDef = {
  id: 'level-1',
  order: 1,
  name: 'Full Throttle',
  tagline: 'This one needs real power — but power alone only gets you so far.',
  hint:
    "Neither the small nor the large engine reaches this target on either chassis — you need the turbo. Once you test it, watch for a note about traction: an engine can push harder than the tires can grip, and past that point extra force just spins the wheels instead of adding speed. Try the turbo on both chassis and compare — a lighter chassis needs less force to reach the same grip ceiling.",
  distance: 100,
  targetSpeed: 35,
  budget: 6200,
  unlockedEngines: ['engine-small', 'engine-large', 'engine-turbo'],
  unlockedChassis: ['chassis-light', 'chassis-heavy'],
};
