import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { RoleResponse } from '../types';
import { rolesQueryKeys } from './query-keys';

// Fetches all roles from the API.
export function rolesRequest(): Promise<RoleResponse[]> {
  return apiFetch<RoleResponse[]>('/api/roles');
}

// Returns a query that fetches and caches the list of all roles.
export function useRolesQuery() {
  return useQuery({
    queryKey: rolesQueryKeys.all,
    queryFn: rolesRequest
  });
}