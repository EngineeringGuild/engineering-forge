/**
 * Engineering Forge - Educator Packaging Engine
 * Handles zero-backend deep linking and .forge-class export/import.
 */

import type { EducatorTrack, ForgeClassPackage } from './educatorTypes';

/**
 * Encodes a track into a URL-safe Base64 string for zero-backend deep links.
 */
export function encodeTrackToUrlHash(track: EducatorTrack): string {
  const jsonStr = JSON.stringify(track);
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return window.btoa(encodeURIComponent(jsonStr));
  }
  // Node / test environment safe fallback
  const globalBuffer = (globalThis as unknown as { Buffer?: { from: (str: string, enc: string) => { toString: (enc: string) => string } } }).Buffer;
  if (globalBuffer) {
    return globalBuffer.from(encodeURIComponent(jsonStr), 'utf-8').toString('base64');
  }
  return encodeURIComponent(jsonStr);
}

/**
 * Decodes a URL-safe Base64 string back into an EducatorTrack object.
 */
export function decodeTrackFromUrlHash(hash: string): EducatorTrack | null {
  try {
    let jsonStr: string;
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      jsonStr = decodeURIComponent(window.atob(hash));
    } else {
      const globalBuffer = (globalThis as unknown as { Buffer?: { from: (str: string, enc: string) => { toString: (enc: string) => string } } }).Buffer;
      if (globalBuffer) {
        jsonStr = decodeURIComponent(globalBuffer.from(hash, 'base64').toString('utf-8'));
      } else {
        jsonStr = decodeURIComponent(hash);
      }
    }
    const parsed = JSON.parse(jsonStr) as EducatorTrack;
    if (parsed && parsed.id && Array.isArray(parsed.levels)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Creates an exportable ForgeClassPackage with metadata.
 */
export function exportToClassPackage(track: EducatorTrack): ForgeClassPackage {
  return {
    format: 'forge-class/1.0',
    exportedAt: new Date().toISOString(),
    track,
  };
}

/**
 * Validates and imports a JSON string representing a .forge-class file.
 */
export function importFromClassPackage(jsonString: string): EducatorTrack | null {
  try {
    const pkg = JSON.parse(jsonString) as ForgeClassPackage;
    if (pkg && pkg.format === 'forge-class/1.0' && pkg.track && Array.isArray(pkg.track.levels)) {
      return pkg.track;
    }
    // Also accept raw track JSON directly
    const rawTrack = JSON.parse(jsonString) as EducatorTrack;
    if (rawTrack && rawTrack.id && Array.isArray(rawTrack.levels)) {
      return rawTrack;
    }
    return null;
  } catch {
    return null;
  }
}
