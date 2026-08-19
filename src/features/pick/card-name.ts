import type { Card } from './types';

/** The two fields the name helpers read — anything card-shaped will do. */
type NameFields = Pick<Card, 'name' | 'flavorName'>;

/**
 * The name printed on the card.
 *
 * Masterpiece and bonus sheets reskin existing cards: FCA prints Adeline,
 * Resplendent Cathar as "Hero of Light", and 63 of its 63 cards are reskins.
 * The reskin is the whole point of those sets, so it leads — a player holding
 * the card is looking at "Hero of Light", and a list that called it Adeline
 * would be naming something they cannot see.
 *
 * `flavorName` is written by scripts/import-mtgjson.mjs and is null on every
 * card that is not a reskin, which is most of them.
 */
export function cardDisplayName(card: NameFields): string {
  return card.flavorName ?? card.name;
}

/**
 * The original Magic name, or null when it is already what's displayed.
 *
 * Shown in parentheses beside the printed name, because the Oracle name is what
 * every other Magic tool, deck list and rules discussion calls the card — a
 * reskin that only ever showed its in-universe name would be unsearchable
 * anywhere but here.
 */
export function cardOracleName(card: NameFields): string | null {
  return card.flavorName ? card.name : null;
}
