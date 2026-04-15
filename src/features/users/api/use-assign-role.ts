import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { UserResponse } from '../types';
import { usersQueryKeys } from './query-keys';

interface AssignRoleVars {
  userId: string;
  roleId: string;
}

// Sends a PUT request to assign a role to a user.
export function assignRoleRequest({ userId, roleId }: AssignRoleVars): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/users/${userId}/roles`, {
    method: 'PUT',
    body: { roleId }
  });
}

// Returns a mutation that assigns a role to a user and invalidates user queries.
export function useAssignRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignRoleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    }
  });
}