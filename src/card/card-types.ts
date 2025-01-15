export enum ColorIdentity {
  W = 'W',
  U = 'U',
  B = 'B',
  R = 'R',
  G = 'G'
};

export type Card = {
  colorIdentity: ColorIdentity[];
  id: string;
  imageUrl: string;
  name: string;
};
