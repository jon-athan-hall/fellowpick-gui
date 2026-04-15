import { createContext, useContext, useState, type ReactNode } from 'react';

interface CardPreviewState {
  imageUrl: string | null;
  setPreviewImage: (url: string | null) => void;
}

const CardPreviewContext = createContext<CardPreviewState>({
  imageUrl: null,
  setPreviewImage: () => {},
});

export function CardPreviewProvider({ children }: { children: ReactNode }) {
  const [imageUrl, setPreviewImage] = useState<string | null>(null);

  return (
    <CardPreviewContext.Provider value={{ imageUrl, setPreviewImage }}>
      {children}
    </CardPreviewContext.Provider>
  );
}

export function useCardPreview() {
  return useContext(CardPreviewContext);
}
