import type { Card } from './types';

/**
 * What the Type column shows: card types only, never subtypes — "Creature",
 * not "Legendary Creature — Elf Noble".
 *
 * `types` is written by scripts/import-mtgjson.mjs for exactly this, so the
 * full `type` line never has to be parsed at runtime. A card with more than one
 * reads as a single string, e.g. "Artifact Creature".
 */
export function cardTypeLabel(card: Card): string {
  return card.types.join(' ');
}
