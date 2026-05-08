import {
  Button,
  CloseButton,
  Drawer,
  Group,
  Image,
  Stack,
  Text,
} from '@mantine/core';
import type { Card, PickType } from '../types';

interface CardPreviewDrawerProps {
  card: Card | null;
  pickType: PickType;
  hasVoted: boolean;
  canVote: boolean;
  onVote: () => void;
  onClose: () => void;
}

// Mobile-only full-screen card preview.
//
// Visual: drawer fills the viewport in a lighter grey (dark.5), with a darker
// inset (dark.7) holding all of the content — close icon, card image, vote
// state note, and vote action button. The inset gives the content area a
// recessed feel against the drawer's raised surface.
//
// Layout: the inner Stack is a flex column. Close, image, and note stack from
// the top (the Stack's default `align: stretch` + `justify: flex-start`).
// The vote button gets `mt="auto"`, which absorbs all remaining vertical
// space and pins the button to the bottom of the inset — directly under the
// thumb. `safe-area-inset-bottom` keeps it clear of the iOS home indicator.
//
// Image is capped at 55vh so the button always has room below it on shorter
// phones. Mantine's Drawer unmounts its body when closed, so the image fetch
// is lazy — first request fires on open.
export function CardPreviewDrawer({
  card,
  pickType,
  hasVoted,
  canVote,
  onVote,
  onClose,
}: CardPreviewDrawerProps) {
  const accentColor = pickType === 'CUT' ? 'red' : 'secondary';
  const action = pickType === 'CUT' ? 'CUT' : 'ADDED';
  return (
    <Drawer
      opened={card !== null}
      onClose={onClose}
      position="bottom"
      size="100%"
      padding="md"
      withCloseButton={false}
      styles={{
        content: { backgroundColor: 'var(--mantine-color-dark-5)' },
        body: {
          padding: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Stack
        gap="md"
        p="md"
        style={{
          flex: 1,
          minHeight: 0,
          backgroundColor: 'var(--mantine-color-dark-7)',
          borderRadius: 'var(--mantine-radius-md)',
          paddingBottom:
            'calc(var(--mantine-spacing-md) + env(safe-area-inset-bottom))',
        }}
      >
        <Group justify="flex-end">
          <CloseButton onClick={onClose} aria-label="Close preview" />
        </Group>

        {card?.scryfallImage && (
          <Image
            src={card.scryfallImage}
            alt={card.name}
            mah="55vh"
            maw="100%"
            fit="contain"
          />
        )}

        {hasVoted && (
          <Text size="sm" c="dimmed" ta="center">
            ALREADY {action} BY YOU
          </Text>
        )}

        {canVote && (
          <Button
            fullWidth
            size="lg"
            color={accentColor}
            onClick={onVote}
            mt="auto"
          >
            {hasVoted ? `UNDO ${pickType}` : pickType}
          </Button>
        )}
      </Stack>
    </Drawer>
  );
}
