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
}

export interface Card {
  id: string;
  name: string;
  setCode: string;
  number: string;
  manaCost: string | null;
  manaValue: number;
  type: string;
  text: string | null;
  colorIdentity: string[];
  colors: string[];
  rarity: string;
  power: string | null;
  toughness: string | null;
  keywords: string[];
  scryfallImage: string | null;
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
