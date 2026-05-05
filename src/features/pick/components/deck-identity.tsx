import { Group, Stack, Text, Title } from '@mantine/core';
import type { Card } from '../types';
import { ManaCost } from './mana-cost';

interface DeckIdentityProps {
  name: string;
  commanders: Card[];
  colorIdentity: string[];
  /** Title heading level. Default 3 for list cards; pass 2 for page headers. */
  titleOrder?: 1 | 2 | 3 | 4 | 5 | 6;
}

// Renders a deck's identifying info — name, commander(s), and color identity —
// shared between precon list cards and the precon detail page header.
export function DeckIdentity({ name, commanders, colorIdentity, titleOrder = 3 }: DeckIdentityProps) {
  return (
    <Stack gap="xs">
      <Title order={titleOrder} mb={0}>{name}</Title>
      {commanders.length > 0 && (
        <Group>
          {colorIdentity.length > 0 && (
            <ManaCost cost={colorIdentity.map((c) => `{${c}}`).join('')} size={24} />
          )}
          <Text
            size="md"
            c="secondary"
            tt="uppercase"
            style={{ letterSpacing: '0.06em' }}
          >
            {commanders.map((c) => c.name).join(' & ')}
          </Text>
        </Group>
      )}
    </Stack>
  );
}
