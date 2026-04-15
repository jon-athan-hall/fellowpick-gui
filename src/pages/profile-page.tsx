import { Alert, Container, Divider, Group, Stack, Title } from '@mantine/core';
import { ResendVerificationBanner, useAuth } from '../features/auth';
import {
  ChangePasswordForm,
  ProfileDetailsForm,
  UserVerifiedBadge
} from '../features/users';

// Displays the current user's profile details, verification status, and password change form.
export function ProfilePage() {
  const { user, updateUser } = useAuth();

  if (!user) {
    return (
      <Container size="sm" py="xl">
        <Alert color="red">You must be signed in to view your profile.</Alert>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Title order={2}>Your profile</Title>
          <UserVerifiedBadge verified={user.verified} />
        </Group>
        {!user.verified && <ResendVerificationBanner />}
        <ProfileDetailsForm
          userId={user.id}
          initialName={user.name}
          initialEmail={user.email}
          onUpdated={(patch) => updateUser(patch)}
        />
        <Divider />
        <ChangePasswordForm userId={user.id} />
      </Stack>
    </Container>
  );
}
