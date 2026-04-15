import { Card, SimpleGrid, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import universes from '../data/universes.json';

// Displays a grid of available MTG universes for browsing precon decks.
export function UniversesPage() {
  const navigate = useNavigate();

  return (
    <Stack gap="lg">
      <Title order={2}>Choose a Universe</Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {universes.map((u) => (
          <UnstyledButton key={u.id} onClick={() => navigate(`/universes/${u.id}`)}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4}>{u.name}</Title>
              <Text size="sm" c="dimmed" mt="xs">
                {u.description}
              </Text>
              <Text size="xs" c="dimmed" mt="xs">
                {u.precons.length} precon deck{u.precons.length !== 1 ? 's' : ''}
              </Text>
            </Card>
          </UnstyledButton>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
