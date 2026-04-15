import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { UpdateUserRequest, UserResponse } from '../types';

interface UpdateUserVars {
  id: string;
  body: UpdateUserRequest;
}

// Sends a PUT request to update a user's profile details.
export function updateUserRequest({ id, body }: UpdateUserVars): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/users/${id}`, {
    method: 'PUT',
    body
  });
}

// Returns a mutation that updates a user's profile.
export function useUpdateUserMutation() {
  return useMutation({ mutationFn: updateUserRequest });
}