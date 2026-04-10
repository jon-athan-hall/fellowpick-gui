import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { UpdateUserRequest, UserResponse } from '../types';

interface UpdateUserVars {
  id: string;
  body: UpdateUserRequest;
}

export function updateUserRequest({ id, body }: UpdateUserVars): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/users/${id}`, {
    method: 'PUT',
    body
  });
}

export function useUpdateUserMutation() {
  return useMutation({ mutationFn: updateUserRequest });
}