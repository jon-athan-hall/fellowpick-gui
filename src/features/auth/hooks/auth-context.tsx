import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { registerRefreshHandler } from '../../../shared/api/client';
import { tokenStore } from '../../../shared/api/token-store';
import { refreshRequest } from '../api/refresh';
import { decodeJwt, userFromClaims } from '../jwt';
import type { AuthResponse, AuthUser } from '../types';
import { AuthContext } from './auth-state';

export type { AuthContextValue } from './auth-state';

function userFromAuthResponse(res: AuthResponse): AuthUser | null {
  const claims = decodeJwt(res.accessToken);
  return claims ? userFromClaims(claims) : null;
}

// Provides auth state (user, tokens, session lifecycle) to the component tree.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setSession = useCallback((res: AuthResponse) => {
    tokenStore.setAccessToken(res.accessToken);
    // Only persist when present — null means cookie mode and the browser
    // already has the refresh token.
    if (res.refreshToken) {
      tokenStore.setRefreshToken(res.refreshToken);
    }
    setUser(userFromAuthResponse(res));
  }, []);

  const clearSession = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // Functional update so concurrent patches compose. Patches are dropped
  // when there's no current user — nothing valid to merge into.
  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  // Register the refresh handler used by the API client's 401 interceptor,
  // and try to rehydrate the session on mount.
  useEffect(() => {
    const tryRefresh = async (): Promise<boolean> => {
      try {
        const res = await refreshRequest();
        setSession(res);
        return true;
      } catch {
        clearSession();
        return false;
      }
    };

    registerRefreshHandler(tryRefresh);
    tryRefresh().finally(() => {
      setIsLoading(false);
    });
  }, [setSession, clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      setSession,
      clearSession,
      updateUser
    }),
    [user, isLoading, setSession, clearSession, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
