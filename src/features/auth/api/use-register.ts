import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import { useAuth } from '../hooks/use-auth';
import type { AuthResponse, RegisterRequest } from '../types';

// Sends a registration request to the API with the given user details.
export function registerRequest(body: RegisterRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body,
    skipAuth: true
  });
}

// React Query mutation hook that registers a new user and stores the session.
export function useRegisterMutation() {
  const { setSession } = useAuth();
  return useMutation({
    mutationFn: registerRequest,
    onSuccess: (res) => {
      setSession(res);
    }
  });
}
