/**
 * Mirrors the fellowpick-api pick DTOs and the static card/universe JSON data.
 */

// --- Static data types (loaded from src/data/ JSON files) ---

export interface Universe {
  id: string;
  name: string;
  description: string;
  sets: string[];
  precons: PreconSummary[];
}

export interface PreconSummary {
  id: string;
  name: string;
  /**
   * Duplicated from the precon file so the nav can draw a deck's pips without
   * loading its chunk. Written by upsertUniverseEntry in the import script.
   */
  colorIdentity: string[];
}

export interface Card {
  id: string;
  name: string;
  manaCost: string | null;
  /** Full type line, e.g. "Legendary Creature — Elf Noble". */
  type: string;
  colorIdentity: string[];
  scryfallImage: string | null;

  // Written by scripts/import-mtgjson.mjs to support search, sorting and
  // filtering. Present on every card in every data file — only flavorName and
  // oracleText are ever null, and only because most cards are not reskins and a
  // few have no rules text.

  /** In-universe name a bonus sheet gives a reprint, e.g. "Hero of Light". */
  flavorName: string | null;
  /** Converted mana cost, straight from MTGJSON rather than parsed. */
  manaValue: number;
  /** Card types only, e.g. ["Artifact", "Creature"] — no subtypes. */
  types: string[];
  rarity: string;
  keywords: string[];
  /** Rules text for every face, joined — see combinedText in the import script. */
  oracleText: string | null;
}

export interface Precon {
  id: string;
  name: string;
  universe: string;
  setCode: string;
  colorIdentity: string[];
  commanders: Card[];
  mainBoard: Record<string, Card>;
}

export interface CardSet {
  setCode: string;
  name: string;
  releaseDate: string;
  totalCards: number;
  cards: Record<string, Card>;
}

// --- API types (matches backend DTOs) ---

export type PickType = 'CUT' | 'ADD';

export interface PickRequest {
  preconId: string;
  cardId: string;
  pickType: PickType;
}

export interface PickResponse {
  id: string;
  preconId: string;
  cardId: string;
  pickType: PickType;
}

export interface PickCountResponse {
  cardId: string;
  pickType: PickType;
  count: number;
}

// --- Route context ---

/**
 * What the deck layout route hands down to whichever board is mounted under it.
 *
 * CUT and ADD are separate routes sharing one parent, so everything that must
 * not be fetched or recomputed twice — the deck, the community counts, the
 * user's own picks, the vote handlers — is resolved once by the layout and
 * passed through the outlet. A board owns only what is genuinely its own: which
 * list of cards it shows, its sort snapshot and its page.
 */
export interface PreconBoardContext {
  precon: Precon;
  addCandidates: Card[];
  /** Raw counts, used to anchor a board's sort. */
  counts: PickCountResponse[];
  /** Counts have arrived; until they have, a board leaves its list unsorted. */
  countsReady: boolean;
  /** `<cardId>` → per-pick-type community totals, for cell rendering. */
  countMap: Record<string, Record<PickType, number>>;
  /** `<cardId>:<pickType>` → pickId for the current user. Presence = voted. */
  myPickMap: Record<string, string>;
  canPick: boolean;
  isMobile: boolean;
  onCardTap: (cardId: string) => void;
  onPick: (cardId: string, pickType: PickType) => void;
  onUnpick: (pickId: string) => void;
}
