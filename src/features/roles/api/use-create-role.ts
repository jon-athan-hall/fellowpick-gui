import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { CreateRoleRequest, RoleResponse } from '../types';
import { rolesQueryKeys } from './query-keys';

// Sends a POST request to create a new role.
export function createRoleRequest(body: CreateRoleRequest): Promise<RoleResponse> {
  return apiFetch<RoleResponse>('/api/roles', {
    method: 'POST',
    body
  });
}

// Returns a mutation that creates a role and invalidates the roles query cache.
export function useCreateRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
    }
  });
}