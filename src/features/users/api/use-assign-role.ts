import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { UserResponse } from '../types';
import { usersQueryKeys } from './query-keys';

interface AssignRoleVars {
  userId: string;
  roleId: string;
}

export function assignRoleRequest({ userId, roleId }: AssignRoleVars): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/users/${userId}/roles`, {
    method: 'PUT',
    body: { roleId }
  });
}

export function useAssignRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignRoleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    }
  });
}