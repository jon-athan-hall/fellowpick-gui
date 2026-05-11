import { Paper, Stack, Text, Title } from '@mantine/core';
import { useAuth } from '../features/auth';

// Displays a welcome greeting and sign-out button for authenticated users.
export function HomePage() {
  const { user } = useAuth();

  return (
    <Paper>
      <Stack>
        <Title order={1}>Hello, {user?.name}</Title>
        <Text fz="xl">Choose a deck in the sidebar.</Text>
        <Text fz="xl">Pick some cards to <strong>CUT</strong>.</Text>
        <Text fz="xl">Then pick some cards to <strong>ADD</strong>.</Text>
      </Stack>
    </Paper>
  );
}