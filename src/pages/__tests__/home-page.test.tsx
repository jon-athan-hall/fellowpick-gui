import { screen } from '@testing-library/react';
import { useRoutes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { RequireAuth } from '../../features/auth';
import type { AuthUser } from '../../features/auth/types';
import { renderWithProviders } from '../../test/render';
import { pageFallbackRoute, pagePublicRoutes } from '../routes';

// The home page is the site's explanation of itself, so who can reach it and
// what it says to a stranger are both load-bearing.

const USER: AuthUser = {
  id: 'u-1',
  name: 'Frodo',
  email: 'frodo@example.com',
  roles: ['ROLE_USER'],
  verified: true,
};

// Mounted through the route table rather than by rendering HomePage directly:
// the point of half these tests is that `/` is not behind RequireAuth, which
// only the routing can show. The guard wraps a decoy so a regression that moved
// the home route back inside it would redirect here instead of rendering.
function App() {
  return useRoutes([
    ...pagePublicRoutes,
    { element: <RequireAuth />, children: [{ path: '/members', element: <p>members only</p> }] },
    pageFallbackRoute,
  ]);
}

function renderHome(auth: { isAuthenticated: boolean; user: AuthUser | null }) {
  return renderWithProviders(<App />, { routes: ['/'], auth });
}

describe('home page', () => {
  it('greets a signed-out visitor with the Gildor line', () => {
    renderHome({ isAuthenticated: false, user: null });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'A star shines on the hour of our meeting'
    );
  });

  it('greets a signed-in user by name', () => {
    renderHome({ isAuthenticated: true, user: USER });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome, Frodo');
  });

  // Short rather than trailing off into "Welcome, ", and short rather than the
  // guest flourish: someone signed in is not a stranger, named or not.
  it('greets a signed-in user with no name in one word', () => {
    renderHome({ isAuthenticated: true, user: { ...USER, name: '' } });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^Welcome$/);
  });

  it('renders at / without signing in — it is the landing page', () => {
    renderHome({ isAuthenticated: false, user: null });
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    // Not the login page it used to redirect to.
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });

  it('invites a signed-out visitor to sign in or register', () => {
    renderHome({ isAuthenticated: false, user: null });
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'create an account' })).toHaveAttribute(
      'href',
      '/register'
    );
  });

  // The one thing the page asks of anyone. Asking it of someone who has already
  // done it is noise.
  it('drops the invitation once someone is signed in', () => {
    renderHome({ isAuthenticated: true, user: USER });
    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'create an account' })).not.toBeInTheDocument();
  });
});
