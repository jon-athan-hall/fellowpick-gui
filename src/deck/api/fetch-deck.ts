import { useQuery } from '@tanstack/react-query';

import { Deck } from '../deck-types';

// Preload all JSON files in the deck folder.
const deckFiles = import.meta.glob('/src/assets/decks/*.json');
console.log('Available deck paths:', Object.keys(deckFiles));

// Fetch deck.
export const fetchDeck = async (slug: string): Promise<Deck> => {
  const path = `/src/assets/decks/${slug}.json`;
  const loader = deckFiles[path];

  if (!loader) {
    throw new Error(`Deck file not found: ${slug}`);
  }

  const module = await loader() as { default: Deck};
  return module.default;
};

// Hook for fetch deck.
const useFetchDeck = (slug: string) => {
  return useQuery({
    queryFn: () => fetchDeck(slug),
    queryKey: ['deck', slug]
  });
};

export default useFetchDeck;
