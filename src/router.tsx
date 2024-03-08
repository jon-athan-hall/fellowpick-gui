import { createBrowserRouter } from 'react-router-dom';
import App from './app';
import DeckLayout from './deck/deck-layout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'decks/:deckId',
        element: <DeckLayout />
      }
    ]
  }
]);

export default router;