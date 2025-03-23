export enum ColorIdentity {
  W = 'W',
  U = 'U',
  B = 'B',
  R = 'R',
  G = 'G'
}

export type Card = {
  colorIdentity: ColorIdentity[];
  identifiers: {
    scryfallId: string;
  }
  name: string;
  number: string;
  setCode: string
};
