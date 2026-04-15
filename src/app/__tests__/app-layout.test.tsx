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

  it('shows the universe and precon selects in the sidebar', () => {
    renderWithProviders(routesTree, { routes: ['/'], auth: {} });
    expect(screen.getByText('Universe')).toBeInTheDocument();
    expect(screen.getByText('Precon')).toBeInTheDocument();
  });

  it('disables the precon select when no universe is selected', () => {
    renderWithProviders(routesTree, { routes: ['/'], auth: {} });
    const preconInput = screen.getByPlaceholderText('Choose a precon');
    expect(preconInput).toBeDisabled();
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
