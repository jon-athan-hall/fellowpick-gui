import { AxiosResponse } from 'axios';

import axios from '../axios';
import { Deck } from './deck-types';

const URL_SUB = '/decks';

// Get all decks.
export const fetchAllDecks = async (): Promise<Deck[]> => {
    const response: AxiosResponse<Deck[]> = await axios.get(URL_SUB);
    return response.data;
};

// Get one deck.
export const fetchDeck = async (id: string | undefined): Promise<Deck> => {
    const response: AxiosResponse<Deck> = await axios.get(`${URL_SUB}/${id}`);
    return response.data;
};
