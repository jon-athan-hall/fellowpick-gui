import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { ListUsersParams, Page, UserResponse } from '../types';
import { usersQueryKeys } from './query-keys';

export function listUsersRequest(params: ListUsersParams): Promise<Page<UserResponse>> {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.size !== undefined) search.set('size', String(params.size));
  if (params.sort) search.set('sort', params.sort);
  const qs = search.toString();
  return apiFetch<Page<UserResponse>>(`/api/users${qs ? `?${qs}` : ''}`);
}

export function useUsersQuery(params: ListUsersParams) {
  return useQuery({
    queryKey: usersQueryKeys.list(params),
    queryFn: () => listUsersRequest(params),
    placeholderData: keepPreviousData
  });
}