import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { createTheme, MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const theme = createTheme({});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <MantineProvider theme={theme}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </MantineProvider>,
);
