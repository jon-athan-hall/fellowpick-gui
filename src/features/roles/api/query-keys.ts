export const rolesQueryKeys = {
  all: ['roles'] as const,
  detail: (id: string) => ['roles', id] as const
};
