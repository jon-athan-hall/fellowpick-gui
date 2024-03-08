import {
  AppShell,
  Button,
  Group,
  Stack,
  Text,
  Title
} from '@mantine/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAllDecks } from './deck/deck-api';
import { Deck } from './deck/deck-types';

const App: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<Deck[], Error>({ queryKey: ['decks'], queryFn: fetchAllDecks });

  if (data === undefined || isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <AppShell
      header={{ height: '6em' }}
      navbar={{ width: '12em', breakpoint: 'sm' }}
    >
      <AppShell.Header p="md">
        <Group align="center" h="100%">
          <Title>Fellowpick</Title>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Stack>
          {data.map(deck => <Text>{deck.name}</Text>)}
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main>
        <Button variant="filled">Hey</Button>
      </AppShell.Main>
    </AppShell>
  );
};

export default App;
