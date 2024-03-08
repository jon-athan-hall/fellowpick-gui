import axios, { AxiosResponse } from 'axios';
import { Deck } from './deck-types';

// Get all decks.
export const fetchAllDecks = async (): Promise<Deck[]> => {
    const response: AxiosResponse<Deck[]> = await axios.get(`http://localhost:8080/decks`);
    return response.data;
};

// Get one deck.
export const fetchDeck = async (id: string | undefined): Promise<Deck> => {
    const response: AxiosResponse<Deck> = await axios.get(`http://localhost:8080/decks/${id}`);
    return response.data;
};
