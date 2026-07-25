import type { VehicleLevelDef } from '../vehicleTypes';

export const level2: VehicleLevelDef = {
  id: 'level-2',
  order: 2,
  name: 'Uphill Battle',
  tagline: 'Same target, but gravity is pulling back now — flat-ground winners can stall here.',
  hint:
    "This run climbs a 15° grade. Gravity now pulls straight back along the slope, and the tires' grip ceiling shrinks too (less weight presses straight down on an incline). Some combos won't even move forward — if the engine can't beat gravity's pull, the car rolls, it doesn't crawl. You'll need the strongest engine and the lightest chassis together; anything less either stalls or falls short.",
  distance: 80,
  targetSpeed: 27,
  inclineDegrees: 15,
  budget: 6200,
  unlockedEngines: ['engine-small', 'engine-large', 'engine-turbo'],
  unlockedChassis: ['chassis-light', 'chassis-heavy'],
};
