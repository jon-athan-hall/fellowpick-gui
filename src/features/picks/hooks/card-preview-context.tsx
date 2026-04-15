import { useState, type ReactNode } from 'react';
import { CardPreviewContext } from './card-preview-state';

export function CardPreviewProvider({ children }: { children: ReactNode }) {
  const [imageUrl, setPreviewImage] = useState<string | null>(null);

  return (
    <CardPreviewContext.Provider value={{ imageUrl, setPreviewImage }}>
      {children}
    </CardPreviewContext.Provider>
  );
}
