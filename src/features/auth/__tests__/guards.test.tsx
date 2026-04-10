import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../test/render';
import { RequireRole } from '../guards';
import type { AuthUser } from '../types';

const adminUser: AuthUser = {
  id: '1',
  name: 'Admin',
  email: 'admin@example.com',
  roles: ['ROLE_ADMIN', 'ROLE_USER'],
  verified: true
};

const plainUser: AuthUser = { ...adminUser, id: '2', roles: ['ROLE_USER'] };

const routesTree = (
  <Routes>
    <Route path="/login" element={<div>login page</div>} />
    <Route path="/" element={<div>home page</div>} />
    <Route
      path="/admin"
      element={
        <RequireRole role="ROLE_ADMIN">
          <div>admin page</div>
        </RequireRole>
      }
    />
  </Routes>
);

describe('RequireRole', () => {
  it('renders nothing while auth is loading', () => {
    renderWithProviders(routesTree, {
      routes: ['/admin'],
      auth: { isLoading: true }
    });
    expect(screen.queryByText('admin page')).not.toBeInTheDocument();
    expect(screen.queryByText('login page')).not.toBeInTheDocument();
    expect(screen.queryByText('home page')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated users to /login', () => {
    renderWithProviders(routesTree, { routes: ['/admin'] });
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('redirects authenticated users without the role to /', () => {
    renderWithProviders(routesTree, {
      routes: ['/admin'],
      auth: { user: plainUser, isAuthenticated: true }
    });
    expect(screen.getByText('home page')).toBeInTheDocument();
  });

  it('renders children when the user has the required role', () => {
    renderWithProviders(routesTree, {
      routes: ['/admin'],
      auth: { user: adminUser, isAuthenticated: true }
    });
    expect(screen.getByText('admin page')).toBeInTheDocument();
  });
});