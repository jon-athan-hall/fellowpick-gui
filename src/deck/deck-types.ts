export enum ColorIdentity {
  W = 'W',
  U = 'U',
  B = 'B',
  R = 'R',
  G = 'G'
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
