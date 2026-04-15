export const picksQueryKeys = {
  counts: (preconId: string) => ['picks', preconId, 'counts'] as const,
  myPicks: (preconId: string) => ['picks', preconId, 'me'] as const,
};
