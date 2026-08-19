import { Stack, Text, Title } from '@mantine/core';
import { useAuth } from '../features/auth';
import { CenteredGlowPanel, PANEL_PROSE_COLUMN } from '../common/components/centered-glow-panel';
import { SparkRule } from '../common/components/spark-rule';

// Displays the welcome greeting for authenticated users.
//
// Same card, centring and glow as the sign-in page, so the two read as one
// pair — only wider, because this card holds four paragraphs rather than two
// fields and the sign-in width would set the measure far too narrow.
export function HomePage() {
  const { user } = useAuth();

  return (
    <CenteredGlowPanel w={PANEL_PROSE_COLUMN}>
      <Stack gap="lg">
        <Stack gap="xs">
          <Title c="gold.5" order={1}>
            Hello, {user?.name}
          </Title>
          <SparkRule />
        </Stack>

        <Stack>
          <Text fz="xl">
            Fellowpick is a place to upgrade your favorite Universes Beyond precons, while strictly
            staying in that universe.
          </Text>
          <Text fz="xl">
            I was inspired to build this site after the Tales of Middle-Earth set was announced, and
            it's finally in a stable state. It's great timing with more precons from other Universes
            Beyond, plus the release of The Hobbit.
          </Text>
          <Text fz="xl">
            Pick out a deck to contribute your votes. Cut as many cards as you want. Then add as
            many cards as you want.
          </Text>
          <Text fz="xl">
            With enough users, anyone can come to the site, and get the top recommendations
            for cuts and adds. Maybe someone wants to drop 5 of the worst cards, or maybe someone
            wants a complete overhaul with 25 replacements. Either way, they can review what
            their <Text span c="gold.5" fz="xl">fellow</Text> Magic players <Text span c="gold.5" fz="xl">pick</Text>.
          </Text>
        </Stack>
      </Stack>
    </CenteredGlowPanel>
  );
}
