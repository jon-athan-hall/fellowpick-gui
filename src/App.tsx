import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import {
  Anchor,
  AppShell,
  Box,
  Group,
  NavLink,
  Title
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { fetchAllDecks } from './deck/deck-api';
import { Deck } from './deck/deck-types';

const App: React.FC = () => {
  const { data, isLoading } = useQuery<Deck[], Error>({ queryKey: ['decks'], queryFn: fetchAllDecks });
  const [activeDeck, setActiveDeck] = useState(0);

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
            <Anchor component={Link} onClick={() => setActiveDeck(0)} to="/login">Login</Anchor>
            <Anchor component={Link} onClick={() => setActiveDeck(0)} to="/register">Register</Anchor>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        {data.map(deck => (
          <NavLink
            active={deck.id === activeDeck}
            component={Link}
            key={deck.id}
            label={deck.name}
            onClick={() => setActiveDeck(deck.id)}
            to={`decks/${deck.id}`}
          />
        ))}
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
