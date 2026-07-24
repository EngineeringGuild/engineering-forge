import type { VehicleLevelDef } from '../vehicleTypes';

export const tutorial: VehicleLevelDef = {
  id: 'tutorial',
  order: 0,
  name: 'First Drive',
  tagline: 'Pick an engine and a chassis. Reach the target speed.',
  hint:
    'Acceleration is force divided by mass — a bigger engine or a lighter chassis both help, but only one engine here is strong enough to hit this target at all. Once you find an engine that works, the lighter chassis will always go faster for the same price or less.',
  distance: 100,
  targetSpeed: 20,
  budget: 3900,
  unlockedEngines: ['engine-small', 'engine-large'],
  unlockedChassis: ['chassis-light', 'chassis-heavy'],
};
