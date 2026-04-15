import { createContext } from 'react';
import type { AuthUser, AuthResponse } from '../types';

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Apply an auth response: store tokens and derive the user. */
  setSession: (res: AuthResponse) => void;
  /** Clear all auth state (called on logout). */
  clearSession: () => void;
  /**
   * Patch the locally-cached user (e.g. after a profile update). The JWT
   * still holds the old claims until the next refresh, but the UI updates
   * immediately.
   */
  updateUser: (patch: Partial<AuthUser>) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
