export enum ColorIdentity {
  W,
  U,
  B,
  R,
  G
};

export interface Card {
  id: string;
  name: string;
  colorIdentity: ColorIdentity[];
};

export interface Deck {
  id: number;
  name: string;
  cards: Card[];
};
