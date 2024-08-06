import { Link, Outlet } from 'react-router-dom';
import {
  Anchor,
  AppShell,
  Box,
  Group,
  Stack,
  Title
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { fetchAllDecks } from './deck/deck-api';
import { Deck } from './deck/deck-types';

const App: React.FC = () => {
  const { data, isLoading } = useQuery<Deck[], Error>({ queryKey: ['decks'], queryFn: fetchAllDecks });

  if (data === undefined || isLoading) return <div>Loading...</div>;

  return (
    <AppShell
      header={{ height: '6em' }}
      navbar={{ width: '12em', breakpoint: 'sm' }}
    >
      <AppShell.Header p="lg">
        <Group justify="space-between">
          <Title>Fellowpick</Title>
          <Group>
            <Anchor component={Link} to="/login">Login</Anchor>
            <Anchor component={Link} to="/register">Register</Anchor>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Stack>
          {data.map(deck => <Link key={deck.id} to={`decks/${deck.id}`}>{deck.name}</Link>)}
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
