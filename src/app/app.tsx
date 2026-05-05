import { DEFAULT_THEME, MantineProvider, createTheme, type MantineColorsTuple } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../features/auth';
import { CardPreviewProvider } from '../features/pick';
import { AppRouter } from './app-router';

// Custom oxidized-iron palette: less neon than Mantine's orange, hue-shifted
// toward red and brown. Index 6 is the "filled" shade, index 5 reads well on
// dark backgrounds. Lighter shades carry a peachy-cream tint; darker shades
// deepen toward a burnt-brown.
const rust: MantineColorsTuple = [
  '#fbece4',
  '#f3d2bb',
  '#e7af89',
  '#d88a5d',
  '#c66e3a',
  '#b25821',
  '#9a4716',
  '#7e3812',
  '#62290e',
  '#481d0a',
];

// Rust is the primary identity color (custom palette above). Yellow is
// registered as `secondary` for warm-accent roles (informational nudges,
// guest indicator). Red is used semantically for destructive/CUT actions;
// do not register it as a theme alias — keep `color="red"` literal so its
// meaning stays obvious.
const theme = createTheme({
  primaryColor: 'rust',
  colors: {
    secondary: DEFAULT_THEME.colors.yellow,
    rust,
  },
  headings: {
    fontFamily: 'MedievalSharp, cursive'
  },
  components: {
    Title: {
      defaultProps: { c: 'rust' },
      // Slight tracking globally on every Title — MedievalSharp reads better
      // with a touch of breathing room between letters.
      styles: {
        root: { letterSpacing: '0.05em' }
      }
    },
    // Standard panel: lighter dark.6 background, md padding, md radius. Pages
    // wrap sections in a bare <Paper> to get the card look. Override per-use
    // with style/props as needed (e.g. a colored borderTop on CUT/ADD panels).
    Paper: {
      defaultProps: {
        bg: 'dark.6',
        p: 'md',
        radius: 'md'
      }
    },
    // Standard list card (universes, precons). Override style/props per-use.
    Card: {
      defaultProps: {
        shadow: 'md',
        padding: 'md',
        radius: 'md',
        withBorder: true
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