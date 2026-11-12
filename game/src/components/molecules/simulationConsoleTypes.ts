export type PhysicsSimulationEventType = 'collision' | 'force' | 'stress' | 'kinematics' | 'system';

export type PhysicsSimulationEventSeverity = 'info' | 'warning' | 'alert' | 'success';

export interface PhysicsSimulationEvent {
  id: string;
  timestamp: string | number; // e.g. "00:01.42" or elapsed seconds
  type: PhysicsSimulationEventType;
  message: string;
  severity?: PhysicsSimulationEventSeverity;
  details?: Record<string, string | number>;
}

export const SAMPLE_PHYSICS_EVENTS: PhysicsSimulationEvent[] = [
  {
    id: 'evt-sys-01',
    timestamp: '00:00.00',
    type: 'system',
    message: 'Motor de física inicializado (Verlet/Euler estendido, Δt = 16.7ms, g = 9.81 m/s²)',
    severity: 'info',
  },
  {
    id: 'evt-frc-01',
    timestamp: '00:00.50',
    type: 'force',
    message: 'Carga de tráfego aplicada no vão central: 40.0 kN',
    severity: 'info',
    details: { loadId: 'L-01', magnitudeKN: 40.0, node: 'N-03' },
  },
  {
    id: 'evt-str-01',
    timestamp: '00:00.83',
    type: 'stress',
    message: 'Membro M-04 atingiu 68% da tensão admissível (27.2 MPa / 40.0 MPa)',
    severity: 'warning',
    details: { member: 'M-04', stressMPa: 27.2, allowableMPa: 40.0, ratio: '68%' },
  },
  {
    id: 'evt-col-01',
    timestamp: '00:01.12',
    type: 'collision',
    message: 'Contato roda-pista detectado (Normal = 12.8 kN, Coeficiente μ = 0.85)',
    severity: 'success',
    details: { normalKN: 12.8, frictionCoeff: 0.85, wheelAxle: 'Rear-01' },
  },
];
