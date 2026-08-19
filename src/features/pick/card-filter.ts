import { cardDisplayName, cardOracleName } from './card-name';
import type { Card } from './types';

/**
 * What the filter bar above the table narrows the list by. A field set to its
 * empty value means that filter is off, so `NO_FILTERS` is the whole list.
 */
export interface CardFilters {
  /** A single card type from `Card.types`, e.g. "Creature". null = every type. */
  type: string | null;
  /** Substring of a card's name. '' = every card. */
  search: string;
  /** Inclusive `[min, max]` converted mana cost. See MAX_CMC for the open top. */
  cmc: [number, number];
}

/**
 * The top of the CMC slider, and an open bound rather than a literal 8: a max
 * of MAX_CMC admits every card costing that much *or more*.
 *
 * The scale stops here because the data does, near enough. 8 or above is 74
 * cards out of the ~5,400 candidate rows and runs to 11, so a slider that ran
 * to the true maximum would spend a third of its length on 1% of the cards and
 * make the crowded 2–4 range harder to hit.
 */
export const MAX_CMC = 8;

export const NO_FILTERS: CardFilters = { type: null, search: '', cmc: [0, MAX_CMC] };

/**
 * The card types actually present in a list, A→Z.
 *
 * Derived from the cards rather than hard-coded, because which types exist
 * varies by board: no shipped set has a Planeswalker or a Battle, and Kindred
 * turns up on exactly two cards. An option that matches nothing is an option
 * that wastes a click.
 *
 * Callers pass the *unfiltered* list, so choosing a type never removes the
 * options beside it and strands the reader on a dropdown of one.
 */
export function cardTypeOptions(cards: Card[]): string[] {
  return [...new Set(cards.flatMap((card) => card.types))].sort((a, b) => a.localeCompare(b));
}

/**
 * Lowercased and stripped of diacritics, so a search matches what someone can
 * type on the keyboard in front of them.
 *
 * Fifty-one names in the shipped data carry an accent, and they are the ones
 * people go looking for by name: Andúril, Éowyn, Nazgûl, Gríma, Lothlórien.
 * Matching those literally means "eowyn" finds nothing while Éowyn sits in the
 * list, which reads as the search being broken rather than as a spelling
 * lesson. Folding both sides costs a normalize per card per keystroke on a list
 * that never exceeds a thousand.
 */
function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/**
 * Whether a card answers to a name someone typed.
 *
 * Both names count, because both are on the row: a reskin shows its printed
 * name with the Oracle name in parentheses, and either is a reasonable thing to
 * search for. Substring rather than prefix, so "henge" finds The Great Henge
 * without knowing it starts with "The".
 */
function matchesSearch(card: Card, needle: string): boolean {
  if (fold(cardDisplayName(card)).includes(needle)) return true;
  const oracleName = cardOracleName(card);
  return oracleName !== null && fold(oracleName).includes(needle);
}

/**
 * The cards a set of filters admits. Filters are cumulative: a card has to
 * satisfy every one that is switched on.
 *
 * Type matches against `types` rather than the full type line, so "Creature"
 * finds an Artifact Creature — a player filtering for creatures means every
 * card they can attack with, not only the ones whose type line says nothing
 * else.
 */
export function filterCards(cards: Card[], filters: CardFilters): Card[] {
  const { type } = filters;
  const needle = fold(filters.search.trim());
  const [minCmc, maxCmc] = filters.cmc;
  // A max at the top of the scale is "and up", so it bounds nothing — which is
  // also what makes the untouched slider cost nothing to evaluate.
  const capped = maxCmc < MAX_CMC;

  if (type === null && needle === '' && minCmc === 0 && !capped) return cards;

  return cards.filter((card) => {
    if (type !== null && !card.types.includes(type)) return false;
    if (needle !== '' && !matchesSearch(card, needle)) return false;
    if (card.manaValue < minCmc) return false;
    if (capped && card.manaValue > maxCmc) return false;
    return true;
  });
}
