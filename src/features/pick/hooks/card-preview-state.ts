import { createContext } from 'react';

export interface CardPreviewState {
  imageUrl: string | null;
  setPreviewImage: (url: string | null) => void;
}

export const CardPreviewContext = createContext<CardPreviewState>({
  imageUrl: null,
  setPreviewImage: () => {},
});
