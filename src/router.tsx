import { createBrowserRouter } from 'react-router-dom';

import App from './app/app';
import AuthForm from './auth/auth-form';
import DeckLayout from './deck/components/deck-layout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'decks/:deckId',
        element: <DeckLayout />
      },
      {
        path: 'login',
        element: <AuthForm />
      },
      {
        path: 'register',
        element: <AuthForm />
      }
    ]
  }
]);

export default router;