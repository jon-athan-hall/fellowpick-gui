import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import { useAuth } from '../hooks/use-auth';
import type { AuthResponse, RegisterRequest } from '../types';

export function registerRequest(body: RegisterRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body,
    skipAuth: true
  });
}

export function useRegisterMutation() {
  const { setSession } = useAuth();
  return useMutation({
    mutationFn: registerRequest,
    onSuccess: (res) => {
      setSession(res);
    }
  });
}
