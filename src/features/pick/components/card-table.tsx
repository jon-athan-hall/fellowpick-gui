import { Badge, Group, Switch, Text } from '@mantine/core';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_SortingState,
} from 'mantine-react-table';
import { useMemo } from 'react';
import { useCardPreview } from '../hooks/use-card-preview';
import type { Card, PickType } from '../types';
import { ManaCost } from './mana-cost';

export type SortColumn = 'votes' | 'cmc' | 'name';

interface CardTableProps {
  /** Pre-sorted, pre-paginated slice for the current page. */
  cards: Card[];
  /** Live community-vote counts. Read in cell rendering only — not used for
   * sorting (we pre-sort externally to keep the order locked across votes). */
  countMap: Record<string, Record<PickType, number>>;
  /** `<cardId>:<pickType>` → pickId for the current user. Presence = user
   * has voted. */
  myPickMap: Record<string, string>;
  pickType: PickType;
  canPick: boolean;
  isMobile: boolean;
  /** Controlled MRT sort state. Single column, single direction. */
  sorting: MRT_SortingState;
  onSortingChange: (next: MRT_SortingState) => void;
  /** Tap a row on mobile to open the preview drawer. */
  onCardTap: (cardId: string) => void;
  /** Click a row on desktop to vote. */
  onPick: (cardId: string, pickType: PickType) => void;
  onUnpick: (pickId: string) => void;
}

// Renders the card list as a Mantine React Table v2. We pass the data already
// sorted and paginated from the parent — `manualSorting: true` tells MRT not
// to reorder (preserves the "card you just voted on stays put" lock), and
// pagination is rendered externally so this table only owns the columns.
export function CardTable({
  cards,
  countMap,
  myPickMap,
  pickType,
  canPick,
  isMobile,
  sorting,
  onSortingChange,
  onCardTap,
  onPick,
  onUnpick,
}: CardTableProps) {
  const { setPreviewImage } = useCardPreview();
  const accentColor = pickType === 'CUT' ? 'red' : 'secondary';

  const columns = useMemo<MRT_ColumnDef<Card>[]>(() => {
    return [
      {
        id: 'votes',
        accessorFn: (row) => countMap[row.id]?.[pickType] ?? 0,
        header: 'Votes',
        size: 110,
        Cell: ({ row }) => {
          const count = countMap[row.original.id]?.[pickType] ?? 0;
          const userPicked = myPickMap[`${row.original.id}:${pickType}`] !== undefined;
          return (
            <Group gap={8} wrap="nowrap">
              <Badge variant="outline" size="lg" w={50} color={accentColor}>
                {count}
              </Badge>
              {!isMobile && canPick && (
                // pointer-events: none so the Switch doesn't double-fire a
                // synthetic click on top of the row click.
                <div style={{ pointerEvents: 'none' }}>
                  <Switch
                    checked={userPicked}
                    readOnly
                    size="sm"
                    color={accentColor}
                    tabIndex={-1}
                    withThumbIndicator={false}
                  />
                </div>
              )}
            </Group>
          );
        },
      },
      {
        id: 'cmc',
        accessorFn: (row) => row.manaValue,
        header: 'CMC',
        size: 80,
        Cell: ({ row }) =>
          row.original.manaCost ? <ManaCost cost={row.original.manaCost} size={16} /> : null,
      },
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        size: 300,
        grow: true,
        Cell: ({ row }) => (
          <Text size="md" truncate>
            {row.original.name}
          </Text>
        ),
      },
    ];
  }, [accentColor, canPick, countMap, isMobile, myPickMap, pickType]);

  const handleRowClick = (card: Card) => {
    if (isMobile) {
      onCardTap(card.id);
      return;
    }
    if (!canPick) return;
    const pickId = myPickMap[`${card.id}:${pickType}`];
    if (pickId) onUnpick(pickId);
    else onPick(card.id, pickType);
  };

  const table = useMantineReactTable({
    columns,
    data: cards,
    // Data arrives pre-sorted and pre-paginated; MRT just renders it. With
    // pagination off there is no pagination row model, so `manualPagination`
    // and `rowCount` would have nothing to act on.
    manualSorting: true,
    enablePagination: false,
    // Single column, single direction, and no "unsorted" third state.
    // `enableSortingRemoval` is passed through to TanStack core, where it
    // defaults to true — left alone, a third header click clears the sort, and
    // the page deliberately ignores an empty sort array, so the column would
    // just look stuck.
    enableMultiSort: false,
    enableSortingRemoval: false,
    // No chrome. Dropping the top toolbar also drops the global filter, density,
    // full-screen and column-visibility toggles, which only ever render inside
    // it — they need no flags of their own. Everything else omitted here (row
    // selection, row actions, column dragging/ordering/resizing) is already off
    // by default.
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableColumnActions: false,
    state: { sorting, columnVisibility: { cmc: !isMobile } },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      onSortingChange(next);
    },
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: () => handleRowClick(row.original),
      onMouseEnter: isMobile ? undefined : () => setPreviewImage(row.original.scryfallImage),
      onMouseLeave: isMobile ? undefined : () => setPreviewImage(null),
      style: { cursor: 'pointer' },
    }),
  });

  return <MantineReactTable table={table} />;
}
