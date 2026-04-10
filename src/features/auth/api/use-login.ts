import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import { useAuth } from '../hooks/use-auth';
import type { AuthResponse, LoginRequest } from '../types';

export function loginRequest(body: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body,
    skipAuth: true
  });
}

export function useLoginMutation() {
  const { setSession } = useAuth();
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (res) => {
      setSession(res);
    }
  });
}
