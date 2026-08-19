import { Box, CloseButton, Drawer, Group, Image, Stack } from '@mantine/core';
import { CARD_CORNER_RADIUS } from '../card-art';
import { cardDisplayName } from '../card-name';
import type { Card, PickType } from '../types';
import { VoteUnit } from './vote-unit';

interface CardPreviewDrawerProps {
  card: Card | null;
  pickType: PickType;
  /** The community's tally for this card, shown inside the vote unit. */
  count: number;
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
  count,
  hasVoted,
  canVote,
  onVote,
  onClose,
}: CardPreviewDrawerProps) {
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
            alt={cardDisplayName(card)}
            mah="55vh"
            maw="100%"
            fit="contain"
            // Mantine's Image is `width: 100%`. Left at that, a viewport short
            // enough for the 55vh cap to bind would letterbox the art inside a
            // full-width box — and the radius below would then round the empty
            // bars while the card's own white corners stayed square. Auto width
            // makes the element the art's own size under either constraint.
            w="auto"
            mx="auto"
            // Clipped to the card's own corners. Without it the JPEG's four
            // white wedges sit against the dark inset behind it.
            style={{ borderRadius: CARD_CORNER_RADIUS }}
          />
        )}

        {/* Pinned to the bottom of the inset, under the thumb, by `mt="auto"`
         * absorbing the slack above it.
         *
         * The same unit the desktop table puts in its Votes column, at the
         * large size. It says both things the old button and its note said
         * between them — how many votes the card has, and whether one of them
         * is yours — without either having to be spelled out in a sentence.
         * A guest gets the count alone, since the ✓ half is only drawn when a
         * vote is possible. */}
        <Box mt="auto">
          <VoteUnit
            count={count}
            voted={hasVoted}
            canVote={canVote}
            pickType={pickType}
            size="lg"
            onClick={canVote ? onVote : undefined}
          />
        </Box>
      </Stack>
    </Drawer>
  );
}
