import { createBrowserRouter } from 'react-router-dom';

import App from './app';
import AuthForm from './auth/auth-form';
import { AuthAction } from './auth/auth-types';
import DeckLayout from './deck/deck-layout';

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
        element: <AuthForm initialAction={AuthAction.Login} />
      },
      {
        path: 'register',
        element: <AuthForm initialAction={AuthAction.Register} />
      }
    ]
  }
]);

export default router;