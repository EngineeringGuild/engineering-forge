/**
 * Engineering Forge - ERC-721 / OpenSea / Metaplex Metadata Standard
 * Formats verifiable Proof-of-Engineering certificates into standard Web3 NFT JSON metadata.
 */

import type { ProofOfEngineeringCertificate } from './proofOfEngineering';

export interface NftAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'number' | 'boost_percentage' | 'date';
  max_value?: number;
}

export interface VehicleNftMetadata {
  name: string;
  description: string;
  image: string; // SVG or IPFS URI
  external_url: string;
  attributes: NftAttribute[];
  properties: {
    engine_version: string;
    deterministic_hash: string;
    guild_signature: string;
    tier: string;
    verified_standards: string[];
  };
}

/**
 * Generates dynamic SVG vector badge representing the physical vehicle digital twin.
 */
export function generateVehicleSvgArtwork(cert: ProofOfEngineeringCertificate): string {
  const tel = cert.vehicleTelemetry;
  const tierColor =
    cert.tier === 'Legendary'
      ? '#f59e0b'
      : cert.tier === 'Master'
      ? '#8b5cf6'
      : cert.tier === 'Elite'
      ? '#06b6d4'
      : '#10b981';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050811" />
      <stop offset="100%" stop-color="#0d1527" />
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${tierColor}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.8" />
    </linearGradient>
  </defs>

  <rect width="500" height="500" rx="20" fill="url(#bg)" stroke="${tierColor}" stroke-width="4" />

  <!-- Industrial grid overlay -->
  <path d="M 0 100 L 500 100 M 0 200 L 500 200 M 0 300 L 500 300 M 0 400 L 500 400" stroke="#1e293b" stroke-width="1" />
  <path d="M 100 0 L 100 500 M 200 0 L 200 500 M 300 0 L 300 500 M 400 0 L 400 500" stroke="#1e293b" stroke-width="1" />

  <!-- Badge Header -->
  <text x="30" y="50" font-family="monospace" font-size="14" fill="#64748b" letter-spacing="2">ENGINEERING GUILD • PROOF-OF-ENGINEERING</text>
  <text x="30" y="85" font-family="monospace" font-weight="900" font-size="22" fill="#ffffff">${tel.vehicleName.toUpperCase()}</text>
  <rect x="360" y="65" width="110" height="26" rx="6" fill="${tierColor}22" stroke="${tierColor}" stroke-width="1.5" />
  <text x="415" y="83" font-family="monospace" font-size="12" font-weight="bold" fill="${tierColor}" text-anchor="middle">${cert.tier.toUpperCase()}</text>

  <!-- Technical Schematic Render -->
  <g transform="translate(100, 160)">
    <!-- Chassis beam -->
    <rect x="0" y="40" width="300" height="24" rx="4" fill="#334155" stroke="#94a3b8" stroke-width="2" />
    <!-- Cabin cage -->
    <polygon points="60,40 100,0 200,0 240,40" fill="#1e293b" stroke="${tierColor}" stroke-width="2.5" />
    <!-- Axles and Wheels -->
    <circle cx="50" cy="75" r="28" fill="#0f172a" stroke="#cbd5e1" stroke-width="6" />
    <circle cx="50" cy="75" r="8" fill="${tierColor}" />
    <circle cx="250" cy="75" r="28" fill="#0f172a" stroke="#cbd5e1" stroke-width="6" />
    <circle cx="250" cy="75" r="8" fill="${tierColor}" />
  </g>

  <!-- Telemetry HUD Card -->
  <rect x="30" y="320" width="440" height="110" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1.5" />
  
  <text x="50" y="355" font-family="monospace" font-size="12" fill="#94a3b8">VELOCIDADE MÁX:</text>
  <text x="170" y="355" font-family="monospace" font-size="14" font-weight="bold" fill="#38bdf8">${tel.maxVelocityMs.toFixed(1)} m/s</text>

  <text x="50" y="385" font-family="monospace" font-size="12" fill="#94a3b8">FATOR DE SEG. (SF):</text>
  <text x="170" y="385" font-family="monospace" font-size="14" font-weight="bold" fill="#4ade80">${tel.safetyFactorNominal.toFixed(2)}</text>

  <text x="270" y="355" font-family="monospace" font-size="12" fill="#94a3b8">MASSA TOTAL:</text>
  <text x="380" y="355" font-family="monospace" font-size="14" font-weight="bold" fill="#f8fafc">${tel.totalMassKg.toFixed(1)} kg</text>

  <text x="270" y="385" font-family="monospace" font-size="12" fill="#94a3b8">ATRITO PNEU (μ):</text>
  <text x="380" y="385" font-family="monospace" font-size="14" font-weight="bold" fill="#fbbf24">${tel.tireFrictionMu.toFixed(2)}</text>

  <text x="50" y="415" font-family="monospace" font-size="10" fill="#64748b">HASH: ${cert.deterministicHash.slice(0, 32)}...</text>

  <!-- Footer Certification -->
  <text x="250" y="470" font-family="monospace" font-size="11" fill="#475569" text-anchor="middle">CERTIFIED BY ENGINEERING GUILD ORACLE • ASME / ISO COMPLIANT</text>
</svg>`;
}

/**
 * Creates standardized ERC-721 JSON metadata for IPFS/Wallet minting.
 */
export function createVehicleNftMetadata(
  cert: ProofOfEngineeringCertificate
): VehicleNftMetadata {
  const tel = cert.vehicleTelemetry;
  const svg = generateVehicleSvgArtwork(cert);
  const svgBase64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

  return {
    name: `Forge Machine: ${tel.vehicleName} #${cert.certificateId.slice(-4)}`,
    description: `Token Verificável de Engenharia emitido pelo Engineering Forge. Este ativo representa um gêmeo digital veicular comprovado por física newtoniana, atrito de Coulomb e fator de segurança estrutural.`,
    image: svgBase64,
    external_url: `https://forge.guildeng.com/certificate/${cert.certificateId}`,
    attributes: [
      { trait_type: 'Tier', value: cert.tier },
      { trait_type: 'Max Velocity (m/s)', value: Number(tel.maxVelocityMs.toFixed(1)), display_type: 'number' },
      { trait_type: 'Safety Factor', value: Number(tel.safetyFactorNominal.toFixed(2)), display_type: 'number' },
      { trait_type: 'Mass (kg)', value: Number(tel.totalMassKg.toFixed(1)), display_type: 'number' },
      { trait_type: 'Tire Friction (μ)', value: Number(tel.tireFrictionMu.toFixed(2)), display_type: 'number' },
      { trait_type: 'Engine Power (W)', value: Math.round(tel.enginePowerWatts), display_type: 'number' },
      { trait_type: 'Max Incline Passed (°)', value: Math.round(tel.slopeAngleDegPassed), display_type: 'number' },
      { trait_type: 'Certification Date', value: Math.floor(tel.timestamp / 1000), display_type: 'date' },
    ],
    properties: {
      engine_version: 'Engineering Forge v2.0 (Newton/Coulomb Solver)',
      deterministic_hash: cert.deterministicHash,
      guild_signature: cert.guildSignature,
      tier: cert.tier,
      verified_standards: ['ASME BTH-1', 'ISO 13482', 'Coulomb Static Friction'],
    },
  };
}
