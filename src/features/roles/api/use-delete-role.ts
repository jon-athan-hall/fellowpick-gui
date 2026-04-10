import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import { rolesQueryKeys } from './query-keys';

export function deleteRoleRequest(id: string): Promise<void> {
  return apiFetch<void>(`/api/roles/${id}`, {
    method: 'DELETE'
  });
}

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
    }
  });
}