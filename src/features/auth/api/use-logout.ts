import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import { tokenStore } from '../../../shared/api/token-store';
import { useAuth } from '../hooks/use-auth';
import type { MessageResponse } from '../types';

// Sends a logout request to the API, revoking the current refresh token.
export function logoutRequest(): Promise<MessageResponse> {
  const refreshToken = tokenStore.getRefreshToken();
  return apiFetch<MessageResponse>('/api/auth/logout', {
    method: 'POST',
    body: refreshToken ? { refreshToken } : undefined,
    skipAuth: true
  });
}

// React Query mutation hook that logs out and clears the local session.
export function useLogoutMutation() {
  const { clearSession } = useAuth();
  return useMutation({
    mutationFn: logoutRequest,
    // Best-effort: clear local session even if the server call fails (e.g.
    // offline). The refresh token will still expire server-side eventually.
    onSettled: () => {
      clearSession();
    }
  });
}
