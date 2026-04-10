import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { CreateRoleRequest, RoleResponse } from '../types';
import { rolesQueryKeys } from './query-keys';

export function createRoleRequest(body: CreateRoleRequest): Promise<RoleResponse> {
  return apiFetch<RoleResponse>('/api/roles', {
    method: 'POST',
    body
  });
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
    }
  });
}