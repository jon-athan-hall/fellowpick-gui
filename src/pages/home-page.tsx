import { Button, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation, useAuth } from '../features/auth';

// Displays a welcome greeting and sign-out button for authenticated users.
export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        notifications.show({ message: 'Signed out' });
        navigate('/login');
      }
    });
  }

  return (
    <Stack>
      <Title order={1}>Welcome, {user?.name}</Title>
      <Text>You are signed in as {user?.email}.</Text>
      <Button
        onClick={handleLogout}
        loading={logoutMutation.isPending}
        variant="default"
        w="fit-content"
      >
        Sign out
      </Button>
    </Stack>
  );
}