import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { MessageResponse } from '../types';

interface ResetPasswordVars {
  token: string;
  newPassword: string;
}

// Sends a password-reset request with the reset token and new password.
export function resetPasswordRequest(vars: ResetPasswordVars): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/api/auth/reset-password', {
    method: 'POST',
    body: vars,
    skipAuth: true
  });
}

// React Query mutation hook for resetting a user's password via a token.
export function useResetPasswordMutation() {
  return useMutation({ mutationFn: resetPasswordRequest });
}
