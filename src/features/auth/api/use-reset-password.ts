import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { MessageResponse } from '../types';

interface ResetPasswordVars {
  token: string;
  newPassword: string;
}

export function resetPasswordRequest(vars: ResetPasswordVars): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/api/auth/reset-password', {
    method: 'POST',
    body: vars,
    skipAuth: true
  });
}

export function useResetPasswordMutation() {
  return useMutation({ mutationFn: resetPasswordRequest });
}
