import { Box, Card, Image, Paper, SimpleGrid, Stack, Title, UnstyledButton, Text } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import universes from '../data/universes.json';
import { DeckIdentity, loadPrecon } from '../features/pick';

// Scryfall hosts an art-only crop alongside the full card image at the same path.
function artCropUrl(largeUrl: string | null): string | null {
  return largeUrl ? largeUrl.replace('/large/', '/art_crop/') : null;
}

// Lists all precon decks within a selected universe.
export function PreconsPage() {
  const { universeId } = useParams<{ universeId: string }>();
  const navigate = useNavigate();

  const universe = universes.find((u) => u.id === universeId);

  if (!universe || !universeId) {
    return <Text>Universe not found.</Text>;
  }

  return (
    <Stack gap="lg">
      <Paper>
        <Title order={1}>{universe.name}</Title>
      </Paper>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        {universe.precons.map((p) => {
          const precon = loadPrecon(universeId, p.id);
          const commanders = precon?.commanders ?? [];
          const colorIdentity = precon?.colorIdentity ?? [];

          return (
            <UnstyledButton
              key={p.id}
              onClick={() => navigate(`/universes/${universeId}/precons/${p.id}`)}
              h="100%"
            >
              <Card
                h="100%"
                style={{ borderTop: '4px solid var(--mantine-color-secondary-6)' }}
              >
                {commanders.length > 0 && (
                  <Card.Section>
                    <SimpleGrid cols={commanders.length} spacing={0}>
                      {commanders.map((c) => {
                        const art = artCropUrl(c.scryfallImage);
                        return art ? (
                          <Image
                            key={c.id}
                            src={art}
                            h={220}
                            fit="cover"
                            alt={c.name}
                            style={{ objectPosition: 'top' }}
                          />
                        ) : (
                          <div key={c.id} style={{ height: 220 }} />
                        );
                      })}
                    </SimpleGrid>
                  </Card.Section>
                )}
                <Box mt="md">
                  <DeckIdentity
                    name={p.name}
                    commanders={commanders}
                    colorIdentity={colorIdentity}
                    titleOrder={2}
                  />
                </Box>
              </Card>
            </UnstyledButton>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
