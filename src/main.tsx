import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom';
import { MantineProvider} from "@mantine/core";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import router from './router.tsx';
import theme from './theme.ts';
import './index.css';
import { CardImageProvider } from './card/card-image-context.tsx';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <CardImageProvider>
        <RouterProvider router={router} />
      </CardImageProvider>
    </MantineProvider>
  </QueryClientProvider>
);
