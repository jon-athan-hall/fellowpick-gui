import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { MessageResponse } from '../../auth/types';
import type { ChangePasswordRequest } from '../types';

interface ChangePasswordVars {
  id: string;
  body: ChangePasswordRequest;
}

// Sends a PUT request to change a user's password.
export function changePasswordRequest({ id, body }: ChangePasswordVars): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/api/users/${id}/password`, {
    method: 'PUT',
    body
  });
}

// Returns a mutation that changes the current user's password.
export function useChangePasswordMutation() {
  return useMutation({ mutationFn: changePasswordRequest });
}