import { Badge, Group, Switch, Text } from '@mantine/core';
import { useCardPreview } from '../hooks/use-card-preview';
import type { Card, PickType } from '../types';
import { ManaCost } from './mana-cost';
import classes from './card-row.module.css';

interface CardRowProps {
  card: Card;
  count: number;
  pickType: PickType;
  userPicked: boolean;
  onPick: () => void;
  onUnpick: () => void;
  canPick: boolean;
}

// Displays a single card row with pick count, mana cost, name, and vote toggle.
export function CardRow({ card, count, userPicked, onPick, onUnpick, canPick }: CardRowProps) {
  const { setPreviewImage } = useCardPreview();

  return (
    <Group
      justify="space-between"
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
      onClick={canPick ? (userPicked ? onUnpick : onPick) : undefined}
      onMouseEnter={() => setPreviewImage(card.scryfallImage)}
      onMouseLeave={() => setPreviewImage(null)}
    >
      <Badge color="yellow" variant="outline" size="lg" w={50} style={{ flexShrink: 0 }}>
        {count}
      </Badge>
      <div style={{ flexShrink: 0, width: 100, display: 'flex', justifyContent: 'center' }}>
        {card.manaCost && <ManaCost cost={card.manaCost} size={16} />}
      </div>
      <Text size="md" fw={500} truncate style={{ flex: 1, minWidth: 0 }}>
        {card.name}
      </Text>
      {canPick && (
        <Switch
          checked={userPicked}
          readOnly
          color="yellow"
          size="sm"
          tabIndex={-1}
          withThumbIndicator={false}
          styles={{ track: { cursor: 'pointer' } }}
        />
      )}
    </Group>
  );
}
