import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { MessageResponse } from '../types';

// Sends a request to resend the email verification link.
export function resendVerificationRequest(): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/api/auth/resend-verification', {
    method: 'POST'
  });
}

// React Query mutation hook for resending the email verification link.
export function useResendVerificationMutation() {
  return useMutation({ mutationFn: resendVerificationRequest });
}
