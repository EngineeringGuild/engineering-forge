/**
 * Engineering Forge - Universal Blueprint Serialization & Library System
 * Enables sharing, exporting, importing, and persisting player engineering designs.
 * Supports compact Base64 tokens (EF-BP1-...) and formatted JSON blueprints.
 */

import type { BuiltMember, BuiltNode } from '../game/build';
import type { BuiltEdge } from '../game/circuitBuild';

export type BlueprintDomain = 'structures' | 'circuits' | 'machines';

export interface StructuresBlueprintData {
  nodes: BuiltNode[];
  members: BuiltMember[];
  nextId?: number;
}

export interface CircuitsBlueprintData {
  nodes: BuiltNode[];
  edges: BuiltEdge[];
  nextId?: number;
}

export interface MachinesBlueprintData {
  selectedEngine: string;
  selectedChassis: string;
}

export type BlueprintDataMap = {
  structures: StructuresBlueprintData;
  circuits: CircuitsBlueprintData;
  machines: MachinesBlueprintData;
};

export interface UniversalBlueprint<T extends BlueprintDomain = BlueprintDomain> {
  schemaVersion: 1;
  id: string;
  domain: T;
  name: string;
  levelId?: string;
  author?: string;
  createdAt: string;
  estimatedCost: number;
  data: BlueprintDataMap[T];
}

const STORAGE_KEY = 'engineering-forge-blueprints-library';
const TOKEN_PREFIX = 'EF-BP1:';

function toBase64(str: string): string {
  if (typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(str)));
  }
  const buf = (globalThis as unknown as { Buffer?: { from: (s: string, enc: string) => { toString: (enc: string) => string } } }).Buffer;
  if (buf) {
    return buf.from(str, 'utf-8').toString('base64');
  }
  throw new Error('No base64 encoder available');
}

function fromBase64(b64: string): string {
  if (typeof atob === 'function') {
    return decodeURIComponent(escape(atob(b64)));
  }
  const buf = (globalThis as unknown as { Buffer?: { from: (s: string, enc: string) => { toString: (enc: string) => string } } }).Buffer;
  if (buf) {
    return buf.from(b64, 'base64').toString('utf-8');
  }
  throw new Error('No base64 decoder available');
}

export class BlueprintManager {
  private static instance: BlueprintManager;

  public static getInstance(): BlueprintManager {
    if (!BlueprintManager.instance) {
      BlueprintManager.instance = new BlueprintManager();
    }
    return BlueprintManager.instance;
  }

  /**
   * Generates a unique blueprint identifier.
   */
  public generateId(): string {
    return `bp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Serializes a UniversalBlueprint into a compact Base64 token suitable for URL or chat sharing.
   */
  public encodeToToken(blueprint: UniversalBlueprint): string {
    const rawJson = JSON.stringify(blueprint);
    const base64 = toBase64(rawJson);
    return `${TOKEN_PREFIX}${base64}`;
  }

  /**
   * Deserializes a blueprint token (or raw JSON) back into a typed UniversalBlueprint.
   * Throws Error if formatting is invalid or corrupt.
   */
  public decodeFromToken(tokenOrJson: string): UniversalBlueprint {
    const trimmed = tokenOrJson.trim();
    let jsonString: string;

    if (trimmed.startsWith(TOKEN_PREFIX)) {
      const base64Part = trimmed.slice(TOKEN_PREFIX.length);
      try {
        jsonString = fromBase64(base64Part);
      } catch (err) {
        throw new Error(`Failed to decode base64 blueprint token: ${(err as Error).message}`);
      }
    } else {
      jsonString = trimmed;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      throw new Error(`Invalid blueprint JSON payload: ${(err as Error).message}`);
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Blueprint data is not an object.');
    }

    const obj = parsed as Record<string, unknown>;

    if (obj.schemaVersion !== 1) {
      throw new Error(`Unsupported blueprint schema version: ${String(obj.schemaVersion)}`);
    }

    if (obj.domain !== 'structures' && obj.domain !== 'circuits' && obj.domain !== 'machines') {
      throw new Error(`Invalid blueprint domain: ${String(obj.domain)}`);
    }

    if (!obj.data || typeof obj.data !== 'object') {
      throw new Error('Missing or corrupt blueprint payload data.');
    }

    return parsed as UniversalBlueprint;
  }

  /**
   * Saves a blueprint into localStorage library.
   */
  public saveToLibrary(blueprint: UniversalBlueprint): void {
    if (typeof window === 'undefined') return;
    const library = this.listLibrary();
    const existingIndex = library.findIndex((b) => b.id === blueprint.id);
    if (existingIndex >= 0) {
      library[existingIndex] = blueprint;
    } else {
      library.unshift(blueprint);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  }

  /**
   * Retrieves all saved blueprints from localStorage.
   */
  public listLibrary(domainFilter?: BlueprintDomain): UniversalBlueprint[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const valid = parsed.filter(
        (b): b is UniversalBlueprint =>
          Boolean(b && typeof b === 'object' && b.schemaVersion === 1 && b.id && b.domain),
      );
      if (domainFilter) {
        return valid.filter((b) => b.domain === domainFilter);
      }
      return valid;
    } catch {
      return [];
    }
  }

  /**
   * Deletes a blueprint from the library by ID.
   */
  public deleteFromLibrary(id: string): void {
    if (typeof window === 'undefined') return;
    const library = this.listLibrary();
    const filtered = library.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Clears all blueprints from the library.
   */
  public clearLibrary(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const blueprintManager = BlueprintManager.getInstance();
