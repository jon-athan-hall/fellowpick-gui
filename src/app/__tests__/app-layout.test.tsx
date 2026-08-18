import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '../../features/auth';
import { renderWithProviders } from '../../test/render';
import { AppLayout } from '../app-layout';

vi.mock('../../features/auth/api/use-logout', async () => {
  const { useMutation } = await import('@tanstack/react-query');
  return {
    logoutRequest: vi.fn().mockResolvedValue({ message: 'ok' }),
    useLogoutMutation: () => useMutation({ mutationFn: () => Promise.resolve({ message: 'ok' }) })
  };
});

const adminUser: AuthUser = {
  id: 'u-1',
  name: 'Alice Admin',
  email: 'alice@example.com',
  roles: ['ROLE_ADMIN', 'ROLE_USER'],
  verified: true
};

const plainUser: AuthUser = { ...adminUser, id: 'u-2', name: 'Bob User', roles: ['ROLE_USER'] };

const routesTree = (
  <Routes>
    <Route element={<AppLayout />}>
      <Route path="/" element={<div>home content</div>} />
      <Route path="/login" element={<div>login content</div>} />
      <Route path="/admin/users" element={<div>admin users content</div>} />
      <Route path="/universes/:universeId" element={<div>universe content</div>} />
      <Route
        path="/universes/:universeId/precons/:preconId"
        element={<div>precon content</div>}
      />
    </Route>
  </Routes>
);

describe('AppLayout', () => {
  it('always shows the brand', () => {
    renderWithProviders(routesTree, { routes: ['/login'], auth: {} });
    expect(screen.getByLabelText('Fellowpick home')).toBeInTheDocument();
    expect(screen.getByText('Fellowpick')).toBeInTheDocument();
  });

  it('shows the guest avatar menu when unauthenticated', () => {
    renderWithProviders(routesTree, { routes: ['/login'], auth: {} });
    expect(screen.getByRole('button', { name: /guest menu/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /user menu/i })).not.toBeInTheDocument();
  });

  it('shows the guest menu with sign in and register options', async () => {
    renderWithProviders(routesTree, { routes: ['/login'], auth: {} });
    fireEvent.click(screen.getByRole('button', { name: /guest menu/i }));
    const items = await screen.findAllByRole('menuitem');
    const labels = items.map((el) => el.textContent?.trim());
    expect(labels).toContain('Sign in');
    expect(labels).toContain('Register');
  });

  it('shows the user avatar menu when authenticated', () => {
    renderWithProviders(routesTree, {
      routes: ['/'],
      auth: { user: plainUser, isAuthenticated: true }
    });
    expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument();
    // Avatar shows initials
    expect(screen.getByText('BU')).toBeInTheDocument();
  });

  it('gives every universe a dropdown trigger in the desktop nav', () => {
    renderWithProviders(routesTree, { routes: ['/'], auth: {} });
    for (const name of [/Middle-Earth/, /Final Fantasy/, /Teenage Mutant Ninja Turtles/]) {
      expect(screen.getByRole('button', { name })).toHaveAttribute('aria-haspopup', 'menu');
    }
  });

  // Mantine mounts a Menu dropdown with `display: none` while its open
  // transition runs, and jsdom never fires `transitionend`, so the items only
  // enter the accessibility tree during the `act()` flush inside `waitFor`.
  // That means dropdown content must be captured in a SINGLE `findBy*` call and
  // asserted on afterwards — a second `findBy*` finds nothing. Negative cases
  // use `queryByText`, which does not filter on visibility and so genuinely
  // proves the content is not mounted at all.
  const openedMenuItems = async (universe: RegExp) => {
    fireEvent.click(screen.getByRole('button', { name: universe }));
    const items = await screen.findAllByRole('menuitem');
    return (name: RegExp) => items.find((el) => name.test(el.textContent ?? ''));
  };

  it('keeps deck links out of the DOM until a dropdown is opened', () => {
    renderWithProviders(routesTree, { routes: ['/'], auth: {} });
    expect(screen.queryByText('Food and Fellowship')).not.toBeInTheDocument();
  });

  it('lists only the universe’s decks once its dropdown opens', async () => {
    renderWithProviders(routesTree, { routes: ['/'], auth: {} });
    const item = await openedMenuItems(/Middle-Earth/);

    // Decks and nothing else — the universe's own overview page is reached from
    // the mobile drawer and the universes index, not from here.
    expect(item(/All Middle-Earth decks/)).toBeUndefined();
    expect(item(/Food and Fellowship/)).toHaveAttribute(
      'href',
      '/universes/middle-earth/precons/food-and-fellowship'
    );
    expect(item(/The Hosts of Mordor/)).toBeInTheDocument();
    // Only this universe's decks — another universe's stay in their own menu.
    expect(screen.queryByText('Turtle Power')).not.toBeInTheDocument();
  });

  it('names each deck’s colour identity in its dropdown item', async () => {
    renderWithProviders(routesTree, { routes: ['/'], auth: {} });
    const item = await openedMenuItems(/Middle-Earth/);
    expect(item(/Elven Council/)).toHaveAccessibleName(/Colour identity: Blue, Green/);
  });

  it('marks the active universe and deck as the current page', async () => {
    renderWithProviders(routesTree, {
      routes: ['/universes/middle-earth/precons/elven-council'],
      auth: {}
    });
    expect(screen.getByRole('button', { name: /Middle-Earth/ })).toHaveAttribute(
      'aria-current',
      'page'
    );

    const item = await openedMenuItems(/Middle-Earth/);
    expect(item(/Elven Council/)).toHaveAttribute('aria-current', 'page');
    expect(item(/Riders of Rohan/)).not.toHaveAttribute('aria-current');
  });

  it('opens the mobile drawer with every universe and deck nested under it', async () => {
    renderWithProviders(routesTree, { routes: ['/'], auth: {} });
    fireEvent.click(screen.getByRole('button', { name: /toggle navigation/i }));
    await waitFor(() =>
      expect(screen.getByRole('link', { name: /Middle-Earth/ })).toBeInTheDocument()
    );
    // The drawer shows every deck, not only the active universe's, and each
    // one carries its colour identity the way the desktop dropdowns do.
    const turtles = screen.getByRole('link', { name: /Turtle Power/ });
    expect(turtles).toHaveAttribute(
      'href',
      '/universes/teenage-mutant-ninja-turtles/precons/turtle-power'
    );
    expect(turtles).toHaveAccessibleName(/Colour identity: White, Blue, Black, Red, Green/);
  });


  it('opens the user menu and exposes profile + sign out items', async () => {
    renderWithProviders(routesTree, {
      routes: ['/'],
      auth: { user: plainUser, isAuthenticated: true }
    });
    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
    const items = await screen.findAllByRole('menuitem');
    const labels = items.map((el) => el.textContent?.trim());
    expect(labels).toContain('Profile');
    expect(labels).toContain('Sign out');
  });

  it('renders the matched route inside the shell', () => {
    renderWithProviders(routesTree, {
      routes: ['/'],
      auth: { user: plainUser, isAuthenticated: true }
    });
    expect(screen.getByText('home content')).toBeInTheDocument();
  });

  it('clears the session when sign out is clicked', async () => {
    const clearSession = vi.fn();
    renderWithProviders(routesTree, {
      routes: ['/'],
      auth: { user: plainUser, isAuthenticated: true, clearSession }
    });
    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
    const items = await screen.findAllByRole('menuitem');
    const signOut = items.find((el) => el.textContent?.includes('Sign out'));
    if (!signOut) throw new Error('Sign out menu item not found');
    fireEvent.click(signOut);
    await waitFor(() => expect(clearSession).toHaveBeenCalled());
  });
});
