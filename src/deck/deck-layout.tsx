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
import { Deck } from './deck-types';
import { useCardImage } from '../card/card-image-context';

const DeckLayout: React.FC = () => {
  const { setCardImageUrl } = useCardImage();

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
      <Stack gap="xs">
        <Title order={2}>{data.name}</Title>
        {data.cards.map(card => (
          <Card
            key={card.id}
            onMouseEnter={() => setCardImageUrl(card.imageUrl)}
            p="xs"
            styles={{ root: { cursor: 'pointer' }}}
          >{card.name}</Card>
        ))}
      </Stack>
    </Paper>
  );
};

export default DeckLayout;
