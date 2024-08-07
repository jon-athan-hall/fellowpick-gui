import { useParams } from 'react-router-dom';
import {
  Card,
  Loader,
  Paper,
  Stack,
  Title
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';

import { fetchDeck } from './deck-api';
import { ColorIdentity, Deck } from './deck-types';

const DeckLayout: React.FC = () => {
  // Grab the deckId parameter from the route.
  const { deckId } = useParams();

  // Fetch the deck data from the backend using the deckId.
  const { data, isLoading } = useQuery<Deck, Error>({
    queryKey: ['deck', deckId],
    queryFn: () => fetchDeck(deckId)
  });

  // Show a loader while the fetch is happening.
  if (data === undefined || data === null || isLoading) {
    return <Loader color="lime" />;
  };

  return (
    <Paper p="md">
      <Stack>
        <Title order={2}>{data.name}</Title>
        {data.cards.map(card => (
          <Card key={card.id}>{card.name}</Card>
        ))}
      </Stack>
    </Paper>
  );
};

export default DeckLayout;
