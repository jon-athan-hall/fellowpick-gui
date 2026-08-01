import type { Precon, Card } from '../types';
import universes from '../../../data/universes.json';

// Lazy on purpose. Eager globs inlined every precon and every candidate list —
// 3.66 MB of JSON across four universes — into the main chunk, so opening one
// deck downloaded all twelve. Without `eager`, Vite emits a chunk per file and
// fetches only what a page asks for.
//
// `import: 'default'` unwraps the module for us, which is also why the old
// "either { default: T } or T" handling is gone.
const preconModules = import.meta.glob('../../../data/*/precons/*.json', {
  import: 'default',
}) as Record<string, () => Promise<Precon>>;

const addModules = import.meta.glob('../../../data/*/adds/*.json', {
  import: 'default',
}) as Record<string, () => Promise<Card[]>>;

// Looks up a universe by ID from the static universes list.
export function findUniverse(universeId: string) {
  return universes.find((u) => u.id === universeId) ?? null;
}

// Loads a precon's JSON data by universe and precon ID.
export async function loadPrecon(universeId: string, preconId: string): Promise<Precon | null> {
  const key = Object.keys(preconModules).find(
    (k) => k.includes(`/${universeId}/precons/${preconId}.json`)
  );
  if (!key) return null;
  return preconModules[key]();
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
export async function loadAddCandidates(universeId: string, preconId: string): Promise<Card[]> {
  const key = Object.keys(addModules).find(
    (k) => k.includes(`/${universeId}/adds/${preconId}.json`)
  );
  if (!key) return [];
  return addModules[key]();
}
