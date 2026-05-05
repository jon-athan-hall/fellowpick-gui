import { Alert, Group, Paper, Stack, Title } from '@mantine/core';
import { ResendVerificationBanner, useAuth } from '../features/auth';
import {
  ChangePasswordForm,
  ProfileDetailsForm,
  UserVerifiedBadge
} from '../features/user';

// Displays the current user's profile details, verification status, and password change form.
export function ProfilePage() {
  const { user, updateUser } = useAuth();

  if (!user) {
    return <Alert color="red">You must be signed in to view your profile.</Alert>;
  }

  return (
    <Stack gap="lg">
      <Paper>
        <Group justify="space-between" align="center">
          <Title order={2}>Your profile</Title>
          <UserVerifiedBadge verified={user.verified} />
        </Group>
      </Paper>
      {!user.verified && <ResendVerificationBanner />}
      <Paper>
        <ProfileDetailsForm
          userId={user.id}
          initialName={user.name}
          initialEmail={user.email}
          onUpdated={(patch) => updateUser(patch)}
        />
      </Paper>
      <Paper>
        <ChangePasswordForm userId={user.id} />
      </Paper>
    </Stack>
  );
}
