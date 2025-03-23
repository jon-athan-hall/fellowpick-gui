import { Card } from '@/card/card-types';

export type Deck = {
  data: {
    mainBoard: Card[];
    name: string;
  }
  meta: {
    date: string;
    version: string;
  }
};
