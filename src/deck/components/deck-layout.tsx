import {
  Box,
  LinearProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { useParams } from 'react-router-dom';

import { useCardImage } from '@/card/card-image-context';
import useFetchDeck from '../api/fetch-deck';

const DeckLayout: React.FC = () => {
  const { deckId } = useParams(); // Grab the deckId parameter from the route.
  const { setCardImageUrl } = useCardImage();
  const { data: deck, isLoading } = useFetchDeck(deckId!);

  // Show a loader while the fetch is happening.
  if (deck === undefined || deck === null || isLoading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h2">{deck.name}</Typography>
        {deck.cards.map(card => (
          <Box
            key={card.id}
            onMouseEnter={() => setCardImageUrl(card.imageUrl)}
            p="xs"
          >
            <Stack direction="row">
              <Typography variant="body1">{card.name}</Typography>
              <ToggleButtonGroup>
                <ToggleButton value={false}></ToggleButton>
                <ToggleButton value={true}>CUT</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Box>
        ))}
    </Box>
  );
};

export default DeckLayout;
