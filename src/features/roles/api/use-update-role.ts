import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { RoleResponse, UpdateRoleRequest } from '../types';
import { rolesQueryKeys } from './query-keys';

interface UpdateRoleVars {
  id: string;
  body: UpdateRoleRequest;
}

// Sends a PUT request to update a role's details.
export function updateRoleRequest({ id, body }: UpdateRoleVars): Promise<RoleResponse> {
  return apiFetch<RoleResponse>(`/api/roles/${id}`, {
    method: 'PUT',
    body
  });
}

// Returns a mutation that updates a role and invalidates the roles query cache.
export function useUpdateRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRoleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
    }
  });
}