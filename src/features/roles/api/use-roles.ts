import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { RoleResponse } from '../types';
import { rolesQueryKeys } from './query-keys';

export function rolesRequest(): Promise<RoleResponse[]> {
  return apiFetch<RoleResponse[]>('/api/roles');
}

export function useRolesQuery() {
  return useQuery({
    queryKey: rolesQueryKeys.all,
    queryFn: rolesRequest
  });
}