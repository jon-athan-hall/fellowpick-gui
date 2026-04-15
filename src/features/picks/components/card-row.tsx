import { ActionIcon, Badge, Group, Text } from '@mantine/core';
import { useCardPreview } from '../hooks/card-preview-context';
import type { Card, PickType } from '../types';

interface CardRowProps {
  card: Card;
  count: number;
  pickType: PickType;
  userPicked: boolean;
  onPick: () => void;
  onUnpick: () => void;
  canPick: boolean;
}

export function CardRow({ card, count, pickType, userPicked, onPick, onUnpick, canPick }: CardRowProps) {
  const { setPreviewImage } = useCardPreview();

  const color = pickType === 'CUT' ? 'red' : 'green';
  const label = pickType === 'CUT' ? '✂' : '+';

  return (
    <Group
      justify="space-between"
      py={4}
      px="xs"
      style={{ borderBottom: '1px solid var(--mantine-color-default-border)', cursor: 'default' }}
      onMouseEnter={() => setPreviewImage(card.scryfallImage)}
      onMouseLeave={() => setPreviewImage(null)}
    >
      <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
        <Badge color={color} variant="filled" size="lg" w={50}>
          {count}
        </Badge>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Text size="sm" fw={500} truncate>
            {card.name}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {card.manaCost ? card.manaCost : ''} {card.type}
          </Text>
        </div>
      </Group>
      {canPick && (
        <ActionIcon
          variant={userPicked ? 'filled' : 'outline'}
          color={color}
          size="sm"
          onClick={userPicked ? onUnpick : onPick}
          aria-label={userPicked ? `Undo ${pickType}` : `${pickType} ${card.name}`}
        >
          {label}
        </ActionIcon>
      )}
    </Group>
  );
}
