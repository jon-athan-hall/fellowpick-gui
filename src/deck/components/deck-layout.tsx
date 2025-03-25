import {
  Box,
  Divider,
  LinearProgress, Stack,
  Typography
} from '@mui/material';
import { ReactElement } from 'react';
import { useParams } from 'react-router-dom';

import CardToggleBox from '@/card/card-toggle-box';
import useFetchDeck from '../api/fetch-deck';

const DeckLayout = (): ReactElement => {
  const { deckId } = useParams(); // Grab the deckId parameter from the route.
  const { data: deck, isLoading } = useFetchDeck(deckId!);

  // Show a loader while the fetch is happening.
  if (deck === undefined || deck === null || isLoading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography
        variant="h2"
        sx={{
          mb: 1
        }}
      >
        {deck.data.name}
      </Typography>
      <Stack
        divider={
          <Divider
            flexItem={true}
            orientation="horizontal"
          />
        }
        sx={{
          maxWidth: 384
        }}
      >
      {deck.data.mainBoard.map(card => <CardToggleBox card={card} key={card.number} />)}
      </Stack>
    </Box>
  );
};

export default DeckLayout;
