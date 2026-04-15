import { Badge, Skeleton } from '@mantine/core';

export interface UserVerifiedBadgeProps {
  verified: boolean;
  loading?: boolean;
}

// Displays a badge indicating whether the user's email is verified.
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
