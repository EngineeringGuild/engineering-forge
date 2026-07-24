export interface VehicleLevelDef {
  id: string;
  order: number;
  name: string;
  tagline: string;
  hint: string;
  /** Straight-line run distance, meters. */
  distance: number;
  /** Minimum speed the vehicle must reach at the end of the run, m/s. */
  targetSpeed: number;
  budget: number;
  unlockedEngines: string[];
  unlockedChassis: string[];
}
