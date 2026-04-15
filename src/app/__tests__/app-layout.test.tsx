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
    </Route>
  </Routes>
);

describe('AppLayout', () => {
  it('always shows the brand', () => {
    renderWithProviders(routesTree, { routes: ['/login'], auth: {} });
    expect(screen.getByLabelText('Fellowpick home')).toBeInTheDocument();
    expect(screen.getByText('Fellowpick')).toBeInTheDocument();
  });

  it('shows Sign in / Register in the header when unauthenticated', () => {
    renderWithProviders(routesTree, { routes: ['/login'], auth: {} });
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
    // No user menu, no navbar links
    expect(screen.queryByRole('button', { name: /user menu/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
  });

  it('shows the user menu and navbar when authenticated', () => {
    renderWithProviders(routesTree, {
      routes: ['/'],
      auth: { user: plainUser, isAuthenticated: true }
    });
    expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument();
    expect(screen.getByText('Bob User')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    // No admin links for non-admin
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
    expect(screen.queryByText('Roles')).not.toBeInTheDocument();
  });

  it('shows the admin section for users with ROLE_ADMIN', () => {
    renderWithProviders(routesTree, {
      routes: ['/'],
      auth: { user: adminUser, isAuthenticated: true }
    });
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Roles')).toBeInTheDocument();
  });

  it('opens the user menu and exposes profile + sign out items', async () => {
    renderWithProviders(routesTree, {
      routes: ['/'],
      auth: { user: plainUser, isAuthenticated: true }
    });
    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
    // Mantine Menu renders the dropdown into a portal — use findBy to wait
    // for the portal mount. Mantine Menu items have role=menuitem but the
    // text label sits in a nested div, so query the items by their visible
    // text instead of by accessible name.
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
    // clearSession is invoked from the logout mutation's onSettled callback
    // after the mocked promise resolves; wait for it.
    await waitFor(() => expect(clearSession).toHaveBeenCalled());
  });
});