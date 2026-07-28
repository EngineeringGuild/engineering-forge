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
  /** Grade of the run, degrees above horizontal. Omitted/0 = flat. */
  inclineDegrees?: number;
  /** Fixed cargo mass, kg, the level requires carrying — not a player pick. Omitted/0 = none. */
  payloadMass?: number;
  budget: number;
  unlockedEngines: string[];
  unlockedChassis: string[];
}
