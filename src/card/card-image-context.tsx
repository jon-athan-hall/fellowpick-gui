import axios from 'axios';
import { createContext, ReactNode, useContext, useState } from 'react';

// Define the context type.
type CardImageContextType = {
  cardImageUrl: string;
  setCardImageUrl: (url: string) => void;
};

// Define the provider props type.
type CardImageProviderProps = {
  children: ReactNode;
};

// Create the context with a default value.
const CardImageContext = createContext<CardImageContextType>({
  cardImageUrl: '',
  setCardImageUrl: () => {}
});

// Create the provider component.
export const CardImageProvider = ({ children }: CardImageProviderProps) => {
  const [cardImageUrl, setCardImageUrl] = useState<string>('');

  return (
    <CardImageContext.Provider value={{ cardImageUrl, setCardImageUrl }}>
      {children}
    </CardImageContext.Provider>
  );
};

// Hook for card image context.
export const useCardImage = () => {
  const context = useContext(CardImageContext);
  if (!context) {
    throw new Error('The hook useCardImage must be used within a CardImageProvider');
  }
  return context;
};

// Helper function for getting the card image from Scryfall.
export const fetchScryfallImageUrl = async (scryfallId: string): Promise<string> => {
  try {
    const response = await axios.get(`https://api.scryfall.com/cards/${scryfallId}`);
    return response.data.image_uris?.normal ?? '';
  } catch (error) {
    console.error('Error fetching Scryfall card image: ', error);
    return '';
  }
};
