import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import axios from '@/axios';
import { Deck } from '../deck-types';

// Fetch all decks.
export const fetchAllDecks = async (): Promise<Deck[]> => {
    const response: AxiosResponse<Deck[]> = await axios.get(`/decks`);
    return response.data;
};

// Hook for fetch all decks query.
const useFetchAllDecks = () => {
  return useQuery({
    initialData: [],
    queryFn: fetchAllDecks,
    queryKey: ['decks'],
  });
};

export default useFetchAllDecks;
