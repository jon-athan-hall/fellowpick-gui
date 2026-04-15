import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import { picksQueryKeys } from './query-keys';

function removePickRequest(pickId: string): Promise<void> {
  return apiFetch<void>(`/api/picks/${pickId}`, { method: 'DELETE' });
}

// Returns a mutation that deletes a pick and invalidates related pick queries.
export function useRemovePickMutation(preconId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removePickRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: picksQueryKeys.counts(preconId) });
      queryClient.invalidateQueries({ queryKey: picksQueryKeys.myPicks(preconId) });
    },
  });
}
