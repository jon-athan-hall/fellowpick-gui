import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import type { PickCountResponse, PickResponse } from '../types';
import { picksQueryKeys } from './query-keys';

// Sends a delete pick request to the API.
function removePickRequest(pickId: string): Promise<void> {
  return apiFetch<void>(`/api/picks/${pickId}`, { method: 'DELETE' });
}

// Returns a mutation that deletes a pick with optimistic cache updates.
export function useRemovePickMutation(preconId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removePickRequest,
    onMutate: async (pickId) => {
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

      // Find the pick being removed to know which count to decrement.
      const removedPick = prevMyPicks?.find((p) => p.id === pickId);

      // Optimistically remove the pick.
      queryClient.setQueryData<PickResponse[]>(myPicksKey, (old) =>
        (old ?? []).filter((p) => p.id !== pickId)
      );

      // Optimistically decrement the count.
      if (removedPick) {
        queryClient.setQueryData<PickCountResponse[]>(countsKey, (old) =>
          (old ?? []).map((c) =>
            c.cardId === removedPick.cardId && c.pickType === removedPick.pickType
              ? { ...c, count: Math.max(0, c.count - 1) }
              : c
          )
        );
      }

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
