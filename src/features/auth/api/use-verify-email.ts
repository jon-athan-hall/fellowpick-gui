import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { MessageResponse } from '../types';

export function verifyEmailRequest(token: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/api/auth/verify', {
    method: 'POST',
    body: { token },
    skipAuth: true
  });
}

// A query (not a mutation) so the result survives React 18 strict-mode
// remounts: useMutation observers are per-instance and lose their result
// across the dev double-mount, leaving the UI stuck in `isPending`.
// useQuery is keyed by token and shares state via the QueryClient cache.
export function useVerifyEmailQuery(token: string | null) {
  return useQuery({
    queryKey: ['auth', 'verify', token],
    queryFn: () => verifyEmailRequest(token as string),
    enabled: token !== null,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity
  });
}
