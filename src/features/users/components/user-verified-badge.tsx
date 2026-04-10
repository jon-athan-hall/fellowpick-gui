import { Badge, Skeleton } from '@mantine/core';

export interface UserVerifiedBadgeProps {
  verified: boolean;
  loading?: boolean;
}

export function UserVerifiedBadge({ verified, loading = false }: UserVerifiedBadgeProps) {
  if (loading) {
    return <Skeleton height={22} width={80} radius="sm" />;
  }
  return (
    <Badge color={verified ? 'green' : 'yellow'} variant="light">
      {verified ? 'Verified' : 'Not verified'}
    </Badge>
  );
}
