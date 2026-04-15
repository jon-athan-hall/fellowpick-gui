import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { UserResponse } from '../types';
import { usersQueryKeys } from './query-keys';

interface RemoveRoleVars {
  userId: string;
  roleId: string;
}

// Sends a DELETE request to remove a role from a user.
export function removeRoleRequest({ userId, roleId }: RemoveRoleVars): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/users/${userId}/roles/${roleId}`, {
    method: 'DELETE'
  });
}

// Returns a mutation that removes a role from a user and invalidates user queries.
export function useRemoveRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeRoleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    }
  });
}