import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import axios from '@/axios';
import { Deck } from '../deck-types';

// Fetch deck.
export const fetchDeck = async (id: string): Promise<Deck> => {
  try {
    const response: AxiosResponse<Deck> = await axios.get(`decks/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching deck');
  };
};

// Hook for fetch deck.
const useFetchDeck = (id: string) => {
  return useQuery({
    queryFn: () => fetchDeck(id),
    queryKey: ['deck', id]
  });
};

export default useFetchDeck;
