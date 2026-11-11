import type { WinchMotor, BasculeBridgeDeck } from '../physics/mechatronics';

export interface MechatronicsComponent {
  id: string;
  name: string;
  type: 'logic_gate' | 'relay' | 'limit_switch' | 'winch_motor' | 'power_supply' | 'sensor';
  description: string;
  cost: number;
  specs: string;
}

export interface MechatronicsLevelDef {
  id: string;
  name: string;
  tagline: string;
  discipline: 'mechatronics';
  order: number;
  brief: {
    problem: string;
    physicsLesson: string;
    constraints: string[];
  };
  budget: number;
  deck: BasculeBridgeDeck;
  availableWinches: WinchMotor[];
  availableGates: Array<'AND' | 'OR' | 'NOT' | 'XOR'>;
  allowRelay: boolean;
  allowLimitSwitch: boolean;
  requiredLogicInterlock?: {
    inputs: Array<{ id: string; label: string; initialValue: boolean }>;
    targetOutput: string;
    expectedState: boolean;
    description: string;
  };
  targetClearanceAngleDeg: number;
  maxAllowableCurrentA: number;
  maxAllowableTensionKn: number;
}
