import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { MessageResponse } from '../types';

// Sends a forgot-password request to the API for the given email address.
export function forgotPasswordRequest(email: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/api/auth/forgot-password', {
    method: 'POST',
    body: { email },
    skipAuth: true
  });
}

// React Query mutation hook for requesting a password-reset email.
export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: forgotPasswordRequest });
}
