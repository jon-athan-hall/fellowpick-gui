import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAllDecks } from './deck/deck-api';
import { Deck } from './deck/deck-types';

const App: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<Deck[], Error>({ queryKey: ['decks'], queryFn: fetchAllDecks });

  if (data === undefined || isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <>
      <ul>
        {data.map(deck => <li>{deck.name}</li>)}
      </ul>
    </>
  )
}

export default App;
