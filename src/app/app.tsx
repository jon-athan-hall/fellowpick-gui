import { DEFAULT_THEME, MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../features/auth';
import { CardPreviewProvider } from '../features/pick';
import { AppRouter } from './app-router';

// Yellow is the primary identity color. Orange is registered as `secondary`
// for warm-accent roles (informational nudges, guest indicator). Red is used
// semantically for destructive/CUT actions; do not register it as a theme
// alias — keep `color="red"` literal so its meaning stays obvious.
const theme = createTheme({
  primaryColor: 'yellow',
  colors: {
    secondary: DEFAULT_THEME.colors.orange,
  },
  headings: {
    fontFamily: 'MedievalSharp, cursive'
  },
  components: {
    Title: {
      defaultProps: {
        c: 'yellow'
      }
    }
  }
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

// Bootstraps the application with theme, routing, auth, and query providers.
export function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <CardPreviewProvider>
              <AppRouter />
            </CardPreviewProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </MantineProvider>
  );
}