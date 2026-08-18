import {
  Alert,
  Anchor,
  Box,
  Button,
  Flex,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../features/auth';
import { getApiErrorMessage } from '../common/api/errors';

/**
 * Everything stacked above this page inside the shell: the fixed header, then
 * Main's own top padding. Read from the shell's variables rather than restated
 * as numbers, so it survives a change to `padding` or `header.height` in
 * app-layout.
 */
const CHROME_ABOVE = 'var(--app-shell-header-offset, 0rem) + var(--app-shell-padding, 1rem)';

/**
 * From `sm` up, `UniverseNav` is stacked above this page too. It costs exactly
 * its own height — its `mt="-md"` and `mb="md"` cancel — which is the tab's
 * `sm` padding top and bottom either side of one line of text.
 */
const NAV_HEIGHT = '3rem';

/**
 * The card is centred on the **viewport**, not on the space left under the
 * chrome, so it sits where the eye expects rather than pushed down by the
 * header. The frame starts `T` below the viewport top, so a frame `100dvh - 2T`
 * tall has its middle at exactly `50dvh`.
 *
 * That also makes overflow impossible: the frame's bottom edge lands at
 * `100dvh - T`, always short of the fold.
 */
const CENTRED_ON_VIEWPORT = `calc(100dvh - 2 * (${CHROME_ABOVE}))`;
const CENTRED_ON_VIEWPORT_BELOW_NAV = `calc(100dvh - 2 * (${CHROME_ABOVE} + ${NAV_HEIGHT}))`;

// Renders the sign-in form with email/password fields and login validation.
//
// The card sits at half the main column and floats on a sapphire radial glow
// rather than a shadow — the same trick the header's wizard uses, which is what
// ties this page to the chrome above it. Input and button sizing, the h1 size
// and the error tint are all theme defaults now, so nothing here re-states them.
export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Enter a valid email'),
      password: (v) => (v.length >= 8 ? null : 'Password must be at least 8 characters')
    }
  });

  function handleSubmit(values: typeof form.values) {
    loginMutation.mutate(values, {
      onSuccess: () => {
        navigate('/');
      }
    });
  }

  const errorMessage = getApiErrorMessage(loginMutation.error, 'Login failed');

  return (
    // Centring frame. `py` gives the glow's two rem of vertical bleed somewhere
    // to go, and `overflow: hidden` catches the horizontal bleed — without
    // either, the glow is what puts scrollbars on the page. Nothing visible is
    // lost to the clip: the gradient reaches full transparency at 70% of its
    // radius, well inside the element's own edge.
    <Flex
      align="center"
      py="xl"
      mih={{ base: CENTRED_ON_VIEWPORT, sm: CENTRED_ON_VIEWPORT_BELOW_NAV }}
      style={{ overflow: 'hidden' }}
    >
      {/* The glow's frame, and the reason it is a separate element from the
          card: it spans the full column while standing only as tall as the
          card, so the wash is wide and shallow. Sized to the card instead, the
          ellipse collapses to the card's own width and disappears behind it. */}
      <Flex pos="relative" w="100%" justify="center">
        {/* Decorative: a soft sapphire wash bleeding out past the card on every
            side. It is a sibling rather than a box-shadow so it can be wider and
            softer than the card itself, which is what makes it read as a glow
            instead of an edge. */}
        <Box
          aria-hidden="true"
          pos="absolute"
          style={{
            inset: '-2rem',
            background:
              'radial-gradient(50% 55% at 50% 40%, color-mix(in srgb, var(--mantine-color-sapphire-6) 40%, transparent), transparent 70%)',
            filter: 'blur(24px)',
            pointerEvents: 'none'
          }}
        />

        {/* Half the column, but never narrower than 20rem and never wider than
            the space available — one expression instead of a breakpoint, and it
            cannot overflow the way a bare `min-width` would (min-width beats
            max-width, so the card would win the argument and push the page).
            The redundant-looking `calc()` wrapper is load-bearing: Mantine's rem
            converter returns anything starting with `calc(` verbatim, and would
            otherwise take this string apart at its commas. */}
        <Paper withBorder p="xl" pos="relative" w="calc(min(100%, max(20rem, 50%)))">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="lg">
              <Stack gap="xs">
                <Title order={1}>Sign in</Title>
                {/* The ✦ rule, the same gold spark the header sets between its
                    descriptors. The two rules flex, so the spark stays centred
                    at any card width. */}
                <Group gap="xs" wrap="nowrap" align="center" aria-hidden="true">
                  <Box flex={1} h={1} bg="dark.4" />
                  <Text component="span" c="gold.4" lh={1}>
                    ✦
                  </Text>
                  <Box flex={1} h={1} bg="dark.4" />
                </Group>
              </Stack>

              {errorMessage && (
                <Alert color="red" p="sm">
                  {errorMessage}
                </Alert>
              )}

              <Stack gap="md">
                <TextInput
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  {...form.getInputProps('email')}
                />
                <PasswordInput
                  label="Password"
                  placeholder="••••••••"
                  required
                  {...form.getInputProps('password')}
                />
              </Stack>

              <Stack gap="md">
                <Button type="submit" fullWidth loading={loginMutation.isPending}>
                  Sign in
                </Button>
                <Group justify="space-between">
                  <Anchor component={Link} to="/register" fz="sm">
                    Need an account? Register
                  </Anchor>
                  <Anchor component={Link} to="/forgot-password" fz="sm">
                    Forgot your password?
                  </Anchor>
                </Group>
              </Stack>
            </Stack>
          </form>
        </Paper>
      </Flex>
    </Flex>
  );
}
