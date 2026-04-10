import { apiFetch } from '../../../shared/api/client';
import { tokenStore } from '../../../shared/api/token-store';
import type { AuthResponse } from '../types';

/**
 * Refresh is a plain function (no hook) because it's called from two
 * non-component contexts:
 *   1. The API client's 401 interceptor in shared/api/client.ts
 *   2. The AuthContext's rehydrate-on-mount effect
 *
 * Sends the stored refresh token in `body` mode; sends no body in `cookie`
 * mode and lets the browser attach the HTTP-only cookie.
 */
export function refreshRequest(): Promise<AuthResponse> {
  const refreshToken = tokenStore.getRefreshToken();
  return apiFetch<AuthResponse>('/api/auth/refresh', {
    method: 'POST',
    body: refreshToken ? { refreshToken } : undefined,
    skipAuth: true,
    skipRefresh: true
  });
}
