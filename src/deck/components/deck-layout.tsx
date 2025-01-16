import { Card, Group, Loader, Paper, Stack, Switch, Text, Title } from '@mantine/core';
import { useParams } from 'react-router-dom';

import { useCardImage } from '@/card/card-image-context';
import useFetchDeck from '../api/fetch-deck';

const DeckLayout: React.FC = () => {
  const { deckId } = useParams(); // Grab the deckId parameter from the route.
  const { setCardImageUrl } = useCardImage();
  const { data, isLoading } = useFetchDeck(deckId!);

  // Show a loader while the fetch is happening.
  if (data === undefined || data === null || isLoading) {
    return <Loader color="lime" />;
  };

  return (
    <Paper p="md">
      <Stack gap="xs">
        <Title order={2}>{data.name}</Title>
        {data.cards.map(card => (
          <Card
            key={card.id}
            onMouseEnter={() => setCardImageUrl(card.imageUrl)}
            p="xs"
            styles={{ root: { cursor: 'pointer' }}}
          >
            <Group justify="space-between">
              <Text>{card.name}</Text>
              <Switch />
            </Group>
          </Card>
        ))}
      </Stack>
    </Paper>
  );
};

export default DeckLayout;
