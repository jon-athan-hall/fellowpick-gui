import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../features/auth';
import { CardPreviewProvider } from '../features/picks/hooks/card-preview-context';
import { AppRouter } from './app-router';

const theme = createTheme({
  primaryColor: 'yellow',
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