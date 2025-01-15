import { Anchor, AppShell, Box, Group, Image, NavLink, rem, Stack, Text, Title} from '@mantine/core';
import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

import { useCardImage } from '@/card/card-image-context';
import useFetchAllDecks from '@/deck/api/fetch-all-decks';

const App: React.FC = () => {
  const { cardImageUrl } = useCardImage();
  const { data, isLoading } = useFetchAllDecks();
  const [activeDeck, setActiveDeck] = useState(0);

  if (data === undefined || isLoading) return <div>Loading...</div>;

  return (
    <AppShell
      header={{ height: rem(100) }}
      navbar={{ breakpoint: 'sm', width: rem(400) }}
    >
      <AppShell.Header p="lg">
        <Group justify="space-between">
          <Title>Fellowpick</Title>
          <Group>
            <Anchor component={Link} onClick={() => setActiveDeck(0)} to="/login">Login</Anchor>
            <Anchor component={Link} onClick={() => setActiveDeck(0)} to="/register">Register</Anchor>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Stack gap="xs" h="100%">
          {data.map(deck => (
            <NavLink
              active={deck.id === activeDeck}
              component={Link}
              key={deck.id}
              label={<Text size="lg">{deck.name}</Text>}
              onClick={() => setActiveDeck(deck.id)}
              to={`decks/${deck.id}`}
            />
          ))}
          <Image mt="auto" src={cardImageUrl} />
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main>
        <Box p="md">
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
};

export default App;
