import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { PickCountResponse, PickRequest, PickResponse } from '../types';
import { picksQueryKeys } from './query-keys';

// Sends a pick request to the API.
function makePickRequest(body: PickRequest): Promise<PickResponse> {
  return apiFetch<PickResponse>('/api/picks', { method: 'POST', body });
}

// Returns a mutation that submits a pick with optimistic cache updates.
export function useMakePickMutation(preconId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: makePickRequest,
    onMutate: async (variables) => {
      // Cancel in-flight refetches so they don't overwrite our optimistic data.
      const countsKey = picksQueryKeys.counts(preconId);
      const myPicksKey = picksQueryKeys.myPicks(preconId);
      await Promise.all([
        queryClient.cancelQueries({ queryKey: countsKey }),
        queryClient.cancelQueries({ queryKey: myPicksKey }),
      ]);

      // Snapshot for rollback.
      const prevCounts = queryClient.getQueryData<PickCountResponse[]>(countsKey);
      const prevMyPicks = queryClient.getQueryData<PickResponse[]>(myPicksKey);

      // Optimistically add the pick.
      queryClient.setQueryData<PickResponse[]>(myPicksKey, (old) => [
        ...(old ?? []),
        { id: `optimistic-${Date.now()}`, preconId: variables.preconId, cardId: variables.cardId, pickType: variables.pickType },
      ]);

      // Optimistically increment the count.
      queryClient.setQueryData<PickCountResponse[]>(countsKey, (old) => {
        const counts = [...(old ?? [])];
        const entry = counts.find((c) => c.cardId === variables.cardId && c.pickType === variables.pickType);
        if (entry) {
          return counts.map((c) =>
            c.cardId === variables.cardId && c.pickType === variables.pickType
              ? { ...c, count: c.count + 1 }
              : c
          );
        }
        return [...counts, { cardId: variables.cardId, pickType: variables.pickType, count: 1 }];
      });

      return { prevCounts, prevMyPicks };
    },
    onError: (_err, _variables, context) => {
      if (context?.prevCounts) queryClient.setQueryData(picksQueryKeys.counts(preconId), context.prevCounts);
      if (context?.prevMyPicks) queryClient.setQueryData(picksQueryKeys.myPicks(preconId), context.prevMyPicks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: picksQueryKeys.counts(preconId) });
      queryClient.invalidateQueries({ queryKey: picksQueryKeys.myPicks(preconId) });
    },
  });
}
