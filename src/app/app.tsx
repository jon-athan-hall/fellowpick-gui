import { AppBar, Box, Container, Drawer, Link, List, ListItem, Typography } from '@mui/material';
import { Link as RouterLink, Outlet } from 'react-router-dom';

import { useCardImage } from '@/card/card-image-context';
import useFetchAllDecks from '@/deck/api/fetch-all-decks';

const App: React.FC = () => {
  const { cardImageUrl } = useCardImage();
  const { data: decks, isLoading } = useFetchAllDecks();

  // @TODO Do something better with this loading.
  if (decks === undefined || isLoading) return <div>Loading...</div>;

  return (
    <Container maxWidth={false}>
      <AppBar>
          <Typography variant="h1">Fellowpick</Typography>
          <Link component={RouterLink} to="/login">Login</Link>
          <Link component={RouterLink} to="/register">Register</Link>
      </AppBar>
      <Drawer variant="permanent">
        <List>
          {decks.map(deck => (
            <ListItem key={deck.id}>
              <Link component={RouterLink} to={`decks/${deck.id}`}>
                {deck.name}
              </Link>
            </ListItem>
          ))}
          <Box component="img" src={cardImageUrl} />
        </List>
      </Drawer>
      <Box>
        <Outlet />
      </Box>
    </Container>
  );
};

export default App;
