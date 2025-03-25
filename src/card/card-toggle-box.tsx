import { Box, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { MouseEvent, ReactElement, useState } from 'react';

import { Card } from './card-types';
import { fetchScryfallImageUrl, useCardImage } from '@/card/card-image-context';

type CardToggleBoxProps = {
  card: Card;
};

const CardToggleBox = ({ card }: CardToggleBoxProps): ReactElement => {
  const { setCardImageUrl } = useCardImage();
  const [isCut, setIsCut] = useState<boolean>(false);

  const handleChange = (_event: MouseEvent<HTMLElement>, newValue: boolean) => {
    if (newValue !== null) {
      setIsCut(newValue);
    }
  };

  const handleHover = async (scryfallId: string) => {
    const imageUrl = await fetchScryfallImageUrl(scryfallId);
    setCardImageUrl(imageUrl);
  };

  return (
    <Box
      onMouseEnter={() => handleHover(card.identifiers.scryfallId)}
      sx={{
        cursor: 'pointer',
        p: 1
      }}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
      >
        <Typography variant="body1">{card.name}</Typography>
        <ToggleButtonGroup
          color="primary"
          exclusive={true}
          onChange={handleChange}
          size="small"
          value={isCut}
        >
          <ToggleButton value={false}>KEEP</ToggleButton>
          <ToggleButton value={true}>CUT</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Box>
  );
};

export default CardToggleBox;
