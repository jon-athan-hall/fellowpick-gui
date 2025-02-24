import { Box, Container, CssBaseline, Drawer, Link, List, ListItem } from '@mui/material';
import { Link as RouterLink, Outlet } from 'react-router-dom';

import { useCardImage } from '@/card/card-image-context.tsx';
import AppHeader from './app-header.tsx';

const App: React.FC = () => {
  const { cardImageUrl } = useCardImage();
  const decks = {
      'elven-council': 'Elven Council',
      'food-and-fellowship': 'Food and Fellowship',
      'riders-of-rohan': 'Riders of Rohan',
      'the-hosts-of-mordor': 'The Hosts of Mordor'
  };

  return (
    <Container disableGutters={true} maxWidth={false}>
      <CssBaseline />
      <AppHeader />
      <Drawer
        sx={{
          '& .MuiDrawer-paper': {
            top: 80
          }
        }}
        variant="permanent"
      >
        <List>
          {Object.entries(decks).map(([slug, name]) => (
            <ListItem key={slug}>
              <Link component={RouterLink} to={`decks/${slug}`}>
                {name}
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
