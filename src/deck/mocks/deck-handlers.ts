import { http, HttpResponse } from 'msw';

import deckResponse from './deck/default.json';
import decksResponse from './decks/default.json';

const deckHandlers = [
  http.get(`${import.meta.env.VITE_API_BASE_URL}/decks`, () => {
    return HttpResponse.json(decksResponse);
  }),
  http.get(`${import.meta.env.VITE_API_BASE_URL}/decks/:id`, () => {
    return HttpResponse.json(deckResponse);
  })
];

export default deckHandlers;
