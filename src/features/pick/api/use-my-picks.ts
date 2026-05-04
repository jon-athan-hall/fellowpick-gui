import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../../common/api/client';
import type { PickResponse } from '../types';
import { picksQueryKeys } from './query-keys';

function myPicksRequest(preconId: string): Promise<PickResponse[]> {
  return apiFetch<PickResponse[]>(`/api/picks/${preconId}/me`);
}

// Fetches the current user's picks for a given precon.
export function useMyPicksQuery(preconId: string, enabled: boolean) {
  return useQuery({
    queryKey: picksQueryKeys.myPicks(preconId),
    queryFn: () => myPicksRequest(preconId),
    enabled,
  });
}
