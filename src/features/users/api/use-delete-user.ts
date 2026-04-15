import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import { usersQueryKeys } from './query-keys';

// Sends a DELETE request to soft-delete a user by ID.
export function deleteUserRequest(id: string): Promise<void> {
  return apiFetch<void>(`/api/users/${id}`, { method: 'DELETE' });
}

// Returns a mutation that deletes a user and invalidates user queries.
export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUserRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    }
  });
}