import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { MessageResponse } from '../types';

export function forgotPasswordRequest(email: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/api/auth/forgot-password', {
    method: 'POST',
    body: { email },
    skipAuth: true
  });
}

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: forgotPasswordRequest });
}
