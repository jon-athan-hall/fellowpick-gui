import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '../features/auth/hooks/auth-state';

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial route(s) for the in-memory router. Defaults to ['/']. */
  routes?: string[];
  /**
   * Auth context overrides. Pass partial values to override the defaults
   * (unauthenticated, not loading). Pass `null` to render without an
   * AuthContext.Provider at all (useful for testing the useAuth hook itself).
   */
  auth?: Partial<AuthContextValue> | null;
}

const defaultAuth: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  setSession: () => {},
  clearSession: () => {},
  updateUser: () => {}
};

// Creates an AuthContextValue with sensible defaults, optionally overridden.
export function makeAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return { ...defaultAuth, ...overrides };
}

/**
 * Renders a UI tree wrapped in the standard app providers: Mantine, a fresh
 * QueryClient (retries disabled), MemoryRouter, and AuthContext.
 *
 * Tests that need to assert routing behavior should render their own
 * <Routes> tree as the `ui` argument and pass `routes` to control the
 * starting URL.
 */
export function renderWithProviders(
  ui: ReactElement,
  { routes = ['/'], auth, ...renderOptions }: RenderWithProvidersOptions = {}
): RenderResult {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  const authValue = auth === null ? null : makeAuthValue(auth);

  function Wrapper({ children }: { children: ReactNode }) {
    const tree = (
      <MantineProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={routes}>{children}</MemoryRouter>
        </QueryClientProvider>
      </MantineProvider>
    );
    return authValue === null ? (
      tree
    ) : (
      <AuthContext.Provider value={authValue}>{tree}</AuthContext.Provider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
