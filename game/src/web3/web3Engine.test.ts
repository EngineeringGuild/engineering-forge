import { describe, it, expect } from 'vitest';
import {
  computeDeterministicFingerprint,
  issueProofOfEngineering,
  type VehicleTelemetryReport,
} from './proofOfEngineering';
import {
  createVehicleNftMetadata,
  generateVehicleSvgArtwork,
} from './metadataGenerator';

describe('Web3 Proof-of-Engineering & Vehicle NFT Engine', () => {
  const sampleTelemetry: VehicleTelemetryReport = {
    vehicleId: 'veh-crawler-01',
    vehicleName: 'Titan Rover Mk I',
    builderAddress: '0x1234567890123456789012345678901234567890',
    totalMassKg: 1250,
    enginePowerWatts: 45000,
    maxVelocityMs: 16.5,
    tireFrictionMu: 0.85,
    safetyFactorNominal: 1.65,
    energyJoulesConsumed: 820000,
    slopeAngleDegPassed: 22.5,
    timestamp: 1731320000000,
  };

  it('computes deterministic cryptographic fingerprints', () => {
    const hash1 = computeDeterministicFingerprint(sampleTelemetry);
    const hash2 = computeDeterministicFingerprint(sampleTelemetry);

    expect(hash1).toMatch(/^0x[a-f0-9]{32}$/);
    expect(hash1).toBe(hash2);

    // Modify a physical property and assert hash changes
    const modified = { ...sampleTelemetry, maxVelocityMs: 16.6 };
    const hashModified = computeDeterministicFingerprint(modified);
    expect(hashModified).not.toBe(hash1);
  });

  it('issues Proof-of-Engineering certificate with correct performance tier', () => {
    const cert = issueProofOfEngineering(sampleTelemetry);

    expect(cert.certificateId).toContain('POE-');
    expect(cert.version).toBe('forge-poe/1.0');
    expect(cert.tier).toBe('Master'); // SF >= 1.5 && v >= 14
    expect(cert.mintEligible).toBe(true);
    expect(cert.guildSignature).toContain('SIG-ENG-GUILD-ORACLE-');
  });

  it('generates compliant ERC-721 metadata and dynamic SVG artwork', () => {
    const cert = issueProofOfEngineering(sampleTelemetry);
    const metadata = createVehicleNftMetadata(cert);

    expect(metadata.name).toContain('Forge Machine: Titan Rover Mk I');
    expect(metadata.image).toContain('data:image/svg+xml;base64,');
    expect(metadata.attributes.length).toBeGreaterThanOrEqual(7);

    const tierAttr = metadata.attributes.find((a) => a.trait_type === 'Tier');
    expect(tierAttr?.value).toBe('Master');

    const svgArtwork = generateVehicleSvgArtwork(cert);
    expect(svgArtwork).toContain('<svg');
    expect(svgArtwork).toContain('TITAN ROVER MK I');
    expect(svgArtwork).toContain('16.5 m/s');
    expect(svgArtwork).toContain('1.65');
  });
});
