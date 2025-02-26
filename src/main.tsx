import { ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom';

import { CardImageProvider } from './card/card-image-context.tsx';
import { enableMocking } from './utils.ts';
import router from './router.tsx';
import theme from './theme.ts';
import './index.css';

const queryClient = new QueryClient();

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CardImageProvider>
          <RouterProvider router={router} />
        </CardImageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
});
