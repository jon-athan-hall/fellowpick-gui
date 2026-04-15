import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { PickRequest, PickResponse } from '../types';
import { picksQueryKeys } from './query-keys';

function makePickRequest(body: PickRequest): Promise<PickResponse> {
  return apiFetch<PickResponse>('/api/picks', { method: 'POST', body });
}

// Returns a mutation that submits a pick and invalidates related pick queries.
export function useMakePickMutation(preconId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: makePickRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: picksQueryKeys.counts(preconId) });
      queryClient.invalidateQueries({ queryKey: picksQueryKeys.myPicks(preconId) });
    },
  });
}
