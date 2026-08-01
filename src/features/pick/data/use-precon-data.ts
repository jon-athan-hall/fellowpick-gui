import { useQueries, useQuery } from '@tanstack/react-query';
import { loadAddCandidates, loadPrecon } from './load-precon';

/**
 * React Query wrappers around the lazily-imported static card data.
 *
 * These fetch a bundled chunk rather than the network, so the usual caching
 * knobs are all turned off: the data cannot go stale within a build, and
 * re-requesting it should never re-run the import. What React Query is actually
 * buying here is deduplication — the deck page asks for the same precon from
 * more than one place — plus `useQueries` for the deck list, and pending/error
 * states in the shape the pick queries already use.
 *
 * Keys are namespaced under 'static' to keep them clearly apart from
 * picksQueryKeys, which mirror server DTOs and do go stale.
 */
const staticData = {
  staleTime: Infinity,
  gcTime: Infinity,
  retry: false,
  refetchOnMount: false,
} as const;

export const staticQueryKeys = {
  precon: (universeId: string, preconId: string) =>
    ['static', 'precon', universeId, preconId] as const,
  adds: (universeId: string, preconId: string) =>
    ['static', 'adds', universeId, preconId] as const,
};

export function usePreconQuery(universeId: string, preconId: string) {
  return useQuery({
    queryKey: staticQueryKeys.precon(universeId, preconId),
    queryFn: () => loadPrecon(universeId, preconId),
    enabled: Boolean(universeId && preconId),
    ...staticData,
  });
}

export function useAddCandidatesQuery(universeId: string, preconId: string) {
  return useQuery({
    queryKey: staticQueryKeys.adds(universeId, preconId),
    queryFn: () => loadAddCandidates(universeId, preconId),
    enabled: Boolean(universeId && preconId),
    ...staticData,
  });
}

/**
 * Every precon in a universe, for the deck list. One `useQueries` call rather
 * than a hook per card, since the list length is data-driven.
 */
export function usePreconsQuery(universeId: string, preconIds: string[]) {
  return useQueries({
    queries: preconIds.map((preconId) => ({
      queryKey: staticQueryKeys.precon(universeId, preconId),
      queryFn: () => loadPrecon(universeId, preconId),
      ...staticData,
    })),
  });
}
