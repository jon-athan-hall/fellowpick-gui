import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import { rolesQueryKeys } from './query-keys';

// Sends a DELETE request to remove a role by ID.
export function deleteRoleRequest(id: string): Promise<void> {
  return apiFetch<void>(`/api/roles/${id}`, {
    method: 'DELETE'
  });
}

// Returns a mutation that deletes a role and invalidates the roles query cache.
export function useDeleteRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
    }
  });
}