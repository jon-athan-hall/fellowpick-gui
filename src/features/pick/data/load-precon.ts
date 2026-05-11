import type { Precon, Card } from '../types';
import universes from '../../../data/universes.json';

const preconModules = import.meta.glob('../../../data/*/precons/*.json', { eager: true }) as Record<string, { default: Precon }>;
const addModules = import.meta.glob('../../../data/*/adds/*.json', { eager: true }) as Record<string, { default: Card[] }>;

// Looks up a universe by ID from the static universes list.
export function findUniverse(universeId: string) {
  return universes.find((u) => u.id === universeId) ?? null;
}

// Loads a precon's JSON data by universe and precon ID.
export function loadPrecon(universeId: string, preconId: string): Precon | null {
  const key = Object.keys(preconModules).find(
    (k) => k.includes(`/${universeId}/precons/${preconId}.json`)
  );
  if (!key) return null;
  const mod = preconModules[key];
  return (mod as unknown as Precon).id ? (mod as unknown as Precon) : mod.default;
}

/**
 * Returns the precomputed ADD candidates for a precon — the in-universe cards
 * that match the commander's color identity, with name-duplicates collapsed
 * and any name already in the deck excluded.
 *
 * The actual filtering happens at build time in `scripts/build-add-candidates.mjs`,
 * which emits one file per precon under `src/data/<universe>/adds/<precon-id>.json`.
 * At runtime we just load the materialized file — no set scanning, no filtering.
 *
 * If you add a new precon (or change a set), re-run `npm run build-data` to
 * regenerate. `npm run build` does this automatically via the prebuild hook.
 */
export function loadAddCandidates(universeId: string, preconId: string): Card[] {
  const key = Object.keys(addModules).find(
    (k) => k.includes(`/${universeId}/adds/${preconId}.json`)
  );
  if (!key) return [];
  const mod = addModules[key];
  // JSON imports come through as either { default: T } or T directly,
  // depending on bundler flags. Handle both.
  if (Array.isArray(mod)) return mod as unknown as Card[];
  return mod.default ?? [];
}
