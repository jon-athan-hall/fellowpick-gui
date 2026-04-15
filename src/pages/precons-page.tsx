import { Card, SimpleGrid, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import universes from '../data/universes.json';

// Lists all precon decks within a selected universe.
export function PreconsPage() {
  const { universeId } = useParams<{ universeId: string }>();
  const navigate = useNavigate();

  const universe = universes.find((u) => u.id === universeId);

  if (!universe) {
    return (
      <Text>Universe not found.</Text>
    );
  }

  return (
    <Stack gap="lg">
      <Title order={2}>{universe.name} — Precon Decks</Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {universe.precons.map((p) => (
          <UnstyledButton
            key={p.id}
            onClick={() => navigate(`/universes/${universeId}/precons/${p.id}`)}
          >
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4}>{p.name}</Title>
            </Card>
          </UnstyledButton>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
