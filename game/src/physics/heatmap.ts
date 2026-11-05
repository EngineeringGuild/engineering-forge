/**
 * Physics Heatmap & Stress Scale Utilities
 *
 * Provides continuous and discrete color mapping for structural stress levels
 * from 0% (low stress / blue) to 100%+ (yield failure / red) in accordance
 * with standard engineering FEA visualization practices (e.g. ASTM / ASME contour conventions).
 */

export interface ColorStop {
  stop: number; // 0.0 to 1.0
  r: number;
  g: number;
  b: number;
  hex: string;
  label: string;
}

/**
 * 6-stop scientific stress color gradient:
 * 0.00 -> Royal Blue (Low / minimal stress)
 * 0.25 -> Cyan (Low-medium stress)
 * 0.50 -> Emerald Green (Optimal design load / 50% capacity)
 * 0.75 -> Amber/Yellow (Elevated stress / warning)
 * 0.90 -> Orange (Critical stress / near yield)
 * 1.00 -> Crimson Red (100%+ Failure / plastic deformation)
 */
export const STRESS_HEATMAP_STOPS: ColorStop[] = [
  { stop: 0.0, r: 37, g: 99, b: 235, hex: '#2563eb', label: '0% Safe' },
  { stop: 0.25, r: 6, g: 182, b: 212, hex: '#06b6d4', label: '25% Low' },
  { stop: 0.5, r: 16, g: 185, b: 129, hex: '#10b981', label: '50% Nominal' },
  { stop: 0.75, r: 245, g: 158, b: 11, hex: '#f59e0b', label: '75% Elevated' },
  { stop: 0.9, r: 249, g: 115, b: 22, hex: '#f97316', label: '90% Warning' },
  { stop: 1.0, r: 239, g: 68, b: 68, hex: '#ef4444', label: '100% Critical' },
];

/**
 * Returns a smooth RGB color string for any utilization value (0.0 to 1.0+).
 */
export function getStressHeatmapRgb(utilization: number, isFailed?: boolean): string {
  if (isFailed) return '#ef4444';

  const u = Math.max(0, Math.min(1.0, utilization));

  // Find surrounding color stops
  let lower = STRESS_HEATMAP_STOPS[0];
  let upper = STRESS_HEATMAP_STOPS[STRESS_HEATMAP_STOPS.length - 1];

  for (let i = 0; i < STRESS_HEATMAP_STOPS.length - 1; i++) {
    if (u >= STRESS_HEATMAP_STOPS[i].stop && u <= STRESS_HEATMAP_STOPS[i + 1].stop) {
      lower = STRESS_HEATMAP_STOPS[i];
      upper = STRESS_HEATMAP_STOPS[i + 1];
      break;
    }
  }

  const range = upper.stop - lower.stop;
  const factor = range > 0 ? (u - lower.stop) / range : 0;

  const r = Math.round(lower.r + factor * (upper.r - lower.r));
  const g = Math.round(lower.g + factor * (upper.g - lower.g));
  const b = Math.round(lower.b + factor * (upper.b - lower.b));

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Calculates safety factor SF = 1 / utilization (with min cap 0.01).
 * In civil & mechanical engineering (ASME Sec VIII / AISC):
 * SF >= 1.5: High design margin
 * 1.0 <= SF < 1.5: Acceptable operating margin
 * SF < 1.0: Structure yields / fails
 */
export function calculateSafetyFactor(utilization: number): {
  sf: number;
  rating: 'generous' | 'nominal' | 'marginal' | 'failing';
  label: string;
} {
  if (utilization <= 0.001) {
    return { sf: 99.9, rating: 'generous', label: 'SF > 10' };
  }
  const sf = Math.max(0, 1.0 / utilization);
  if (sf < 1.0) {
    return { sf, rating: 'failing', label: `SF ${sf.toFixed(2)} (Yield Failure)` };
  }
  if (sf < 1.4) {
    return { sf, rating: 'marginal', label: `SF ${sf.toFixed(2)} (Marginal)` };
  }
  if (sf <= 2.5) {
    return { sf, rating: 'nominal', label: `SF ${sf.toFixed(2)} (Nominal)` };
  }
  return { sf, rating: 'generous', label: `SF ${sf.toFixed(2)} (Generous)` };
}

/**
 * Formats force in Newtons (N) or kiloNewtons (kN) with sign and tension/compression descriptor.
 */
export function formatForce(forceN: number): {
  formatted: string;
  type: 'tension' | 'compression' | 'neutral';
  magnitudeN: number;
} {
  const mag = Math.abs(forceN);
  if (mag < 1) {
    return { formatted: '0 N', type: 'neutral', magnitudeN: 0 };
  }

  const inKn = mag >= 1000;
  const valStr = inKn ? `${(mag / 1000).toFixed(1)} kN` : `${Math.round(mag)} N`;

  if (forceN > 0) {
    return { formatted: `+${valStr} (T)`, type: 'tension', magnitudeN: mag };
  } else {
    return { formatted: `-${valStr} (C)`, type: 'compression', magnitudeN: mag };
  }
}
