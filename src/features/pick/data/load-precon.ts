import type { Precon, CardSet, Card } from '../types';
import universes from '../../../data/universes.json';

const preconModules = import.meta.glob('../../../data/*/precons/*.json', { eager: true }) as Record<string, { default: Precon }>;
const setModules = import.meta.glob('../../../data/*/sets/*.json', { eager: true }) as Record<string, { default: CardSet }>;

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

// Loads all card set JSON files belonging to a given universe.
export function loadUniverseSets(universeId: string): CardSet[] {
  return Object.entries(setModules)
    .filter(([k]) => k.includes(`/${universeId}/sets/`))
    .map(([, mod]) => {
      const data = mod as unknown as CardSet;
      return data.setCode ? data : mod.default;
    });
}

/**
 * Returns all in-universe cards that match the commander's color identity
 * and are NOT already in the precon's mainBoard or commander list.
 */
export function getAddCandidates(precon: Precon, sets: CardSet[]): Card[] {
  const preconCardIds = new Set([
    ...Object.keys(precon.mainBoard),
    ...precon.commanders.map((c) => c.id),
  ]);

  const commanderColors = new Set(precon.colorIdentity);

  const candidates: Card[] = [];

  for (const set of sets) {
    for (const card of Object.values(set.cards)) {
      // Skip cards already in the precon
      if (preconCardIds.has(card.id)) continue;

      // Card's color identity must be a subset of commander's color identity
      const fits = card.colorIdentity.every((c) => commanderColors.has(c));
      if (!fits) continue;

      // Skip basic lands and tokens
      if (card.type.includes('Basic Land')) continue;

      candidates.push(card);
    }
  }

  return candidates;
}
