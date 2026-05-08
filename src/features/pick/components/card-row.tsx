import { Badge, Group, Text } from '@mantine/core';
import { memo } from 'react';
import { useCardPreview } from '../hooks/use-card-preview';
import type { Card, PickType } from '../types';
import { ManaCost } from './mana-cost';
import classes from './card-row.module.css';

interface CardRowProps {
  card: Card;
  count: number;
  pickType: PickType;
  /** Present iff the user has voted; also serves as the unpick target id. */
  pickId: string | undefined;
  onPick: (cardId: string, pickType: PickType) => void;
  onUnpick: (pickId: string) => void;
  canPick: boolean;
  isMobile: boolean;
  /** At mobile widths the row tap routes through this instead of toggling
   * the pick directly — the parent opens a bottom-sheet preview where the
   * user sees the card before voting. */
  onCardTap: (cardId: string) => void;
}

// Displays a single card row with pick count, mana cost, and name.
function CardRowImpl({
  card,
  count,
  pickType,
  pickId,
  onPick,
  onUnpick,
  canPick,
  isMobile,
  onCardTap,
}: CardRowProps) {
  const { setPreviewImage } = useCardPreview();
  const accentColor = pickType === 'CUT' ? 'red' : 'secondary';
  const userPicked = pickId !== undefined;

  const handleClick = isMobile
    ? () => onCardTap(card.id)
    : canPick
      ? () => (userPicked ? onUnpick(pickId) : onPick(card.id, pickType))
      : undefined;

  // Hover preview only at desktop widths. At mobile widths the row tap opens
  // a bottom-sheet preview instead, and the sidebar pane (where the hover
  // image renders) is collapsed off-screen anyway.
  const hoverHandlers = isMobile
    ? undefined
    : {
        onMouseEnter: () => setPreviewImage(card.scryfallImage),
        onMouseLeave: () => setPreviewImage(null),
      };

  return (
    <Group
      gap="md"
      py={6}
      px="sm"
      wrap="nowrap"
      style={{
        borderBottom: '1px solid var(--mantine-color-default-border)',
        cursor: 'pointer',
        transition: 'background-color 150ms ease',
      }}
      className={classes.row}
      onClick={handleClick}
      {...hoverHandlers}
    >
      <Badge variant="outline" size="lg" w={50} color={accentColor} style={{ flexShrink: 0 }}>
        {count}
      </Badge>
      <div className={classes.manaCostCol}>
        {card.manaCost && <ManaCost cost={card.manaCost} size={16} />}
      </div>
      <Text size="md" truncate style={{ flex: 1, minWidth: 0 }}>
        {card.name}
      </Text>
    </Group>
  );
}

export const CardRow = memo(CardRowImpl);
