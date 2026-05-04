import { Badge, Group, Switch, Text } from '@mantine/core';
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
}

// Displays a single card row with pick count, mana cost, name, and vote toggle.
function CardRowImpl({ card, count, pickType, pickId, onPick, onUnpick, canPick }: CardRowProps) {
  const { setPreviewImage } = useCardPreview();
  const accentColor = pickType === 'CUT' ? 'red' : 'secondary';
  const userPicked = pickId !== undefined;

  const handleClick = canPick
    ? () => (userPicked ? onUnpick(pickId) : onPick(card.id, pickType))
    : undefined;

  return (
    <Group
      gap="md"
      py={4}
      px="xs"
      wrap="nowrap"
      style={{
        borderBottom: '1px solid var(--mantine-color-default-border)',
        cursor: 'pointer',
        borderRadius: 'var(--mantine-radius-sm)',
        transition: 'background-color 150ms ease',
      }}
      className={classes.row}
      onClick={handleClick}
      onMouseEnter={() => setPreviewImage(card.scryfallImage)}
      onMouseLeave={() => setPreviewImage(null)}
    >
      <Group gap={8} wrap="nowrap" style={{ flexShrink: 0 }}>
        <Badge variant="outline" size="lg" w={50} color={accentColor}>
          {count}
        </Badge>
        {canPick && (
          <Switch
            checked={userPicked}
            readOnly
            size="sm"
            color={accentColor}
            tabIndex={-1}
            withThumbIndicator={false}
            styles={{ track: { cursor: 'pointer' } }}
          />
        )}
      </Group>
      <div style={{ flexShrink: 0, width: 80, display: 'flex', justifyContent: 'flex-end' }}>
        {card.manaCost && <ManaCost cost={card.manaCost} size={16} />}
      </div>
      <Text size="md" fw={500} truncate style={{ flex: 1, minWidth: 0 }}>
        {card.name}
      </Text>
    </Group>
  );
}

export const CardRow = memo(CardRowImpl);
