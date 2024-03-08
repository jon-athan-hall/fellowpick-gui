import ReactDOM from 'react-dom/client'
import { MantineProvider} from "@mantine/core";
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import theme from './theme.ts';
import App from './App.tsx'
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <App />
    </MantineProvider>
  </QueryClientProvider>
);
