import { ActionIcon, Badge, Group, Switch, Text, UnstyledButton } from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconArrowsSort } from '@tabler/icons-react';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_Column,
  type MRT_ColumnDef,
  type MRT_SortingState,
} from 'mantine-react-table';
import { useMemo } from 'react';
import { cardTypeLabel } from '../card-type';
import { useCardPreview } from '../hooks/use-card-preview';
import { PICK_ACCENT, PICK_ACCENT_NAME } from '../pick-accent';
import type { Card, PickType } from '../types';
import { ManaCost } from './mana-cost';

export type SortColumn = 'votes' | 'cmc' | 'type' | 'name';

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

const SORT_ICON_SIZE = '1.1rem';

/** Grid lines. Faint on purpose: they organise the rows without ruling them. */
const TABLE_LINE = 'var(--mantine-color-dark-5)';

/**
 * The rule under the heading, matching the app header's own bottom edge exactly
 * — `4px solid dark.3`, from app-layout.module.css. Same weight, same neutral,
 * so the table's heading and the page's header read as the same device.
 */
const HEAD_RULE = '4px solid var(--mantine-color-dark-3)';

/** How much of the vote's colour a hovered row takes. */
const HOVER_TINT_PERCENT = 12;

/**
 * The interior of one column heading, replacing MRT's own.
 *
 * MRT renders `tableCellProps.children ?? <its own layout>`, so supplying
 * `children` takes over the label, the sort control and the spacing between
 * them in one move. That is the only way to reach any of the three: MRT sets a
 * 2px gap between label and control, sizes the control as an `xs` ActionIcon at
 * 70% opacity, and paints it `--mantine-primary-color-filled` once sorted —
 * none of which are reachable from props.
 *
 * The whole heading is the button rather than just the icon, so the label is a
 * hit target too; the control is a `span` styled as an ActionIcon rather than a
 * real one, since a button inside a button is invalid.
 */
function ColumnHeading({ column, pickType }: { column: MRT_Column<Card>; pickType: PickType }) {
  const sorted = column.getIsSorted();
  const label = column.columnDef.header as string;

  return (
    <UnstyledButton
      className="mantine-focus-auto"
      aria-label={`Sort by ${label}`}
      onClick={column.getToggleSortingHandler()}
      w="100%"
      style={{ display: 'block', textAlign: 'left' }}
    >
      <Group gap="md" wrap="nowrap" align="center">
        <Text component="span" fz="lg" fw={600} tt="uppercase" lts="0.1em" lh={1.2}>
          {label}
        </Text>
        {/* The vote's own accent — crimson under CUT, gold under ADD — so the
            table agrees with the switcher above it. Coloured at every sort
            state, not only when active: a control that appears on sorting alone
            reads as absent the rest of the time. The glyph, not the colour, is
            what says which column is sorted. */}
        <ActionIcon
          component="span"
          variant="subtle"
          size="sm"
          aria-hidden="true"
          style={{ color: PICK_ACCENT[pickType] }}
        >
          {sorted === 'desc' ? (
            <IconArrowDown size={SORT_ICON_SIZE} />
          ) : sorted === 'asc' ? (
            <IconArrowUp size={SORT_ICON_SIZE} />
          ) : (
            <IconArrowsSort size={SORT_ICON_SIZE} />
          )}
        </ActionIcon>
      </Group>
    </UnstyledButton>
  );
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
  const accentColor = PICK_ACCENT_NAME[pickType];

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
        id: 'type',
        accessorFn: cardTypeLabel,
        header: 'Type',
        size: 160,
        Cell: ({ row }) => (
          <Text size="md" truncate>
            {cardTypeLabel(row.original)}
          </Text>
        ),
      },
      {
        // Last, and the only column that grows — so it absorbs the leftover
        // width rather than leaving a ragged gap at the table's right edge.
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
    // CMC and Type are both supporting detail; a phone has room for the vote
    // and the name, and little else.
    state: { sorting, columnVisibility: { cmc: !isMobile, type: !isMobile } },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      onSortingChange(next);
    },
    mantineTableProps: {
      // A full grid in a faint line, rather than row dividers alone: four
      // columns of quite different content (a badge, mana symbols, two strings)
      // track better across a row when the columns are ruled.
      withRowBorders: true,
      withColumnBorders: true,
      // No ring around the table. The panel it sits in is the container, and a
      // second edge a few pixels inside the first reads as a mistake.
      withTableBorder: false,
      borderColor: TABLE_LINE,
      verticalSpacing: 'sm',
      horizontalSpacing: 'md',
      highlightOnHover: true,
      highlightOnHoverColor: `color-mix(in srgb, ${PICK_ACCENT[pickType]} ${HOVER_TINT_PERCENT}%, transparent)`,
    },
    // MRT wraps the table in a Paper of its own — `shadow="xs" withBorder`,
    // which then picks up this project's Paper theme defaults. Since
    // pick-board.tsx already wraps this component in a Paper, that produced a
    // bordered panel inside a bordered panel. The border and shadow come off;
    // the padding stays, and reads as the panel's own inset.
    mantinePaperProps: {
      withBorder: false,
      shadow: undefined,
    },
    mantineTableHeadCellProps: ({ column }) => {
      const sorted = column.getIsSorted();
      return {
        // MRT does not set this itself, and the heading is now a button whose
        // pressed state is otherwise only legible from the arrow's direction.
        'aria-sort': sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none',
        style: { verticalAlign: 'middle', borderBottom: HEAD_RULE },
        children: <ColumnHeading column={column} pickType={pickType} />,
      };
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
