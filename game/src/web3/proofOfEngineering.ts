/**
 * Engineering Forge - Proof-of-Engineering Web3 Protocol
 * Cryptographic validation of physical vehicle and structural designs.
 * DOC-09: On-chain certification, physical performance telemetry, and immutable tokens.
 */

export interface VehicleTelemetryReport {
  vehicleId: string;
  vehicleName: string;
  builderAddress: string;
  totalMassKg: number;
  enginePowerWatts: number;
  maxVelocityMs: number;
  tireFrictionMu: number;
  safetyFactorNominal: number;
  energyJoulesConsumed: number;
  slopeAngleDegPassed: number;
  timestamp: number;
}

export interface ProofOfEngineeringCertificate {
  certificateId: string;
  version: 'forge-poe/1.0';
  vehicleTelemetry: VehicleTelemetryReport;
  deterministicHash: string;
  guildSignature: string;
  mintEligible: boolean;
  tier: 'Standard' | 'Elite' | 'Master' | 'Legendary';
}

/**
 * Computes deterministic SHA-256 style fingerprint from vehicle physical parameters.
 */
export function computeDeterministicFingerprint(telemetry: VehicleTelemetryReport): string {
  const payload = [
    telemetry.vehicleId,
    telemetry.totalMassKg.toFixed(2),
    telemetry.enginePowerWatts.toFixed(0),
    telemetry.maxVelocityMs.toFixed(2),
    telemetry.tireFrictionMu.toFixed(2),
    telemetry.safetyFactorNominal.toFixed(2),
    telemetry.energyJoulesConsumed.toFixed(0),
    telemetry.slopeAngleDegPassed.toFixed(1),
  ].join(':');

  // Simple deterministic djb2/fnv-1a hybrid hash for web client runtime without external libs
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const part3 = (Math.imul(h1, 31) >>> 0).toString(16).padStart(8, '0');
  const part4 = (Math.imul(h2, 37) >>> 0).toString(16).padStart(8, '0');

  return `0x${part1}${part2}${part3}${part4}`;
}

/**
 * Evaluates performance telemetry and issues an on-chain Proof-of-Engineering certificate.
 */
export function issueProofOfEngineering(
  telemetry: VehicleTelemetryReport
): ProofOfEngineeringCertificate {
  const hash = computeDeterministicFingerprint(telemetry);

  // Performance Tier calculation
  let tier: 'Standard' | 'Elite' | 'Master' | 'Legendary' = 'Standard';
  if (telemetry.safetyFactorNominal >= 2.0 && telemetry.maxVelocityMs >= 18) {
    tier = 'Legendary';
  } else if (telemetry.safetyFactorNominal >= 1.5 && telemetry.maxVelocityMs >= 14) {
    tier = 'Master';
  } else if (telemetry.safetyFactorNominal >= 1.2) {
    tier = 'Elite';
  }

  // Guild Oracle Mock Signature (deterministic derived from hash and Guild Oracle Key)
  const guildSignature = `SIG-ENG-GUILD-ORACLE-${hash.slice(2, 18).toUpperCase()}`;

  return {
    certificateId: `POE-${Date.now().toString(36).toUpperCase()}-${hash.slice(2, 8).toUpperCase()}`,
    version: 'forge-poe/1.0',
    vehicleTelemetry: telemetry,
    deterministicHash: hash,
    guildSignature,
    mintEligible: telemetry.safetyFactorNominal >= 1.0,
    tier,
  };
}
