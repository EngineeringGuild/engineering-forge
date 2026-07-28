import { tutorial } from './tutorial';
import { level1 } from './level1';
import { level2 } from './level2';
import { level3 } from './level3';
import { level4 } from './level4';
import type { VehicleLevelDef } from '../vehicleTypes';

export const VEHICLE_LEVELS: VehicleLevelDef[] = [tutorial, level1, level2, level3, level4];

export function getVehicleLevel(id: string): VehicleLevelDef | undefined {
  return VEHICLE_LEVELS.find((level) => level.id === id);
}

export function nextVehicleLevelId(id: string): string | undefined {
  const index = VEHICLE_LEVELS.findIndex((level) => level.id === id);
  if (index === -1 || index === VEHICLE_LEVELS.length - 1) return undefined;
  return VEHICLE_LEVELS[index + 1].id;
}
