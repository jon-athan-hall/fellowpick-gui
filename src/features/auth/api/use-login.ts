import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import { useAuth } from '../hooks/use-auth';
import type { AuthResponse, LoginRequest } from '../types';

// Sends a login request to the API with the given credentials.
export function loginRequest(body: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body,
    skipAuth: true
  });
}

// React Query mutation hook that logs in and stores the returned session.
export function useLoginMutation() {
  const { setSession } = useAuth();
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (res) => {
      setSession(res);
    }
  });
}
