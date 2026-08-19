import { Anchor, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth';
import { CenteredGlowPanel, PANEL_HALF_COLUMN } from '../common/components/centered-glow-panel';
import { SparkRule } from '../common/components/spark-rule';

// The landing page, and the site's own explanation of itself. Reached at `/`
// whether or not anyone is signed in.
//
// Same card, centring and glow as the sign-in page, so the two read as one
// pair — only wider, because this card holds four paragraphs rather than two
// fields and the sign-in width would set the measure far too narrow.
/**
 * Frodo's greeting to Gildor in Fellowship, Book I ch. 3 — the English of
 * *Elen síla lúmenn' omentielvo*.
 *
 * A greeting offered to a stranger on first meeting, which is what a landing
 * page is. It only ever shows to someone signed out; a reader who is already
 * here gets a word rather than a flourish, because the second meeting does not
 * want the same fanfare as the first.
 */
const GUEST_GREETING = 'A star shines on the hour of our meeting';

export function HomePage() {
  const { user, isAuthenticated } = useAuth();

  // Keyed on being signed in rather than on having a name: someone signed in
  // whose name has not arrived is still not a stranger, so they get the short
  // greeting with nothing trailing off after a comma.
  const greeting = !isAuthenticated
    ? GUEST_GREETING
    : user?.name
      ? `Welcome, ${user.name}`
      : 'Welcome';

  return (
    <CenteredGlowPanel w={PANEL_HALF_COLUMN}>
      <Stack gap="lg">
        <Stack gap="lg">
          <Title c="gold.5" order={1} ta="center">
            {greeting}
          </Title>
          <SparkRule />
        </Stack>

        <Stack>
          <Text fz="xl">
            <Text span c="gold.5" fz="xl">Fellowpick</Text> is a place to upgrade your favorite Universes Beyond precons, while strictly
            staying in that universe.
          </Text>
          <Text fz="xl">
            I was inspired to build this site after the Tales of Middle-Earth set was announced, and
            it's finally in a stable state. It's great timing since more UB precons have been released,
            not to mention we have the latest Hobbit set!
          </Text>
          <Text fz="xl">
            Navigate to a deck to contribute your picks. Cut as many cards as you want. Then add as
            many cards as you want.
          </Text>
          <Text fz="xl">
            With enough users, anyone can come to the site, and get the top recommendations
            for cuts and adds. Maybe someone wants to drop a few of the worst cards, or maybe someone
            wants a complete overhaul with 25 synergistic replacements. Either way, they can review what
            their <Text span c="gold.5" fz="xl">fellow</Text> Magic players <Text span c="gold.5" fz="xl">pick</Text>.
          </Text>
          {/* Only for signed-out readers. Browsing and reading the results take
              no account — voting does — so this is the one thing the page asks
              of anyone, and asking it of someone already signed in would be
              noise. */}
          {!user && (
            <Text fz="xl">
              Browsing is open to everyone.{' '}
              <Anchor component={Link} to="/login" c="gold.5" fz="xl" underline="always">
                Sign in
              </Anchor>{' '}
              or{' '}
              <Anchor component={Link} to="/register" c="gold.5" fz="xl" underline="always">
                create an account
              </Anchor>{' '}
              when you want your own picks to count.
            </Text>
          )}
        </Stack>
      </Stack>
    </CenteredGlowPanel>
  );
}
