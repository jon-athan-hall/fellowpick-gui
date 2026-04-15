import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { PickCountResponse } from '../types';
import { picksQueryKeys } from './query-keys';

function pickCountsRequest(preconId: string): Promise<PickCountResponse[]> {
  return apiFetch<PickCountResponse[]>(`/api/picks/${preconId}`, { skipAuth: true });
}

export function usePickCountsQuery(preconId: string) {
  return useQuery({
    queryKey: picksQueryKeys.counts(preconId),
    queryFn: () => pickCountsRequest(preconId),
  });
}
