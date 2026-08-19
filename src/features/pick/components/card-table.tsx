import { ActionIcon, Group, Text, UnstyledButton } from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconArrowsSort } from '@tabler/icons-react';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_Column,
  type MRT_ColumnDef,
  type MRT_SortingState,
} from 'mantine-react-table';
import { useMemo } from 'react';
import { cardDisplayName, cardOracleName } from '../card-name';
import { cardTypeLabel } from '../card-type';
import { useCardPreview } from '../hooks/use-card-preview';
import { PICK_ACCENT } from '../pick-accent';
import type { Card, PickType } from '../types';
import { ManaCost } from './mana-cost';
import { VoteUnit } from './vote-unit';

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
      <Group gap="xs" wrap="nowrap" align="center">
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
  // A tap on mobile opens the preview drawer rather than voting, so the vote
  // half of the unit and the row's press both hang off this one condition.
  const canVote = !isMobile && canPick;

  const columns = useMemo<MRT_ColumnDef<Card>[]>(() => {
    return [
      {
        id: 'votes',
        accessorFn: (row) => countMap[row.id]?.[pickType] ?? 0,
        header: 'Picks',
        // Under `layout: 'fixed'` these sizes are the whole story — the browser
        // no longer measures the cells, so each one has to clear whichever is
        // wider, the heading or its content. Here it is the heading: VOTES plus
        // its sort control comes to ~125px against the unit's ~103px.
        size: 128,
        Cell: ({ row }) => (
          <VoteUnit
            count={countMap[row.original.id]?.[pickType] ?? 0}
            voted={myPickMap[`${row.original.id}:${pickType}`] !== undefined}
            canVote={canVote}
            pickType={pickType}
          />
        ),
      },
      {
        id: 'cmc',
        accessorFn: (row) => row.manaValue,
        // "CMC" is the rules term; "COST" is what the column shows — the pips
        // themselves, not the converted number. The id stays `cmc` because it
        // is the sort key `pick-board` switches on, and that does sort by the
        // converted value.
        header: 'Cost',
        // Sized for a five-pip cost (128px of pips), which covers all but five
        // cards in the shipped data. Those five run to seven pips and wrap to a
        // second line rather than spill into Type — a fixed column cannot grow
        // to meet them, and 170px of permanent width for five cards is the
        // worse trade.
        size: 132,
        // Larger than the body text beside them on purpose: these are read as
        // symbols, not glyphs, and the colour pie has to be legible at a glance
        // down the column.
        Cell: ({ row }) =>
          row.original.manaCost ? (
            <ManaCost cost={row.original.manaCost} size={20} wrap="wrap" />
          ) : null,
      },
      {
        id: 'type',
        accessorFn: cardTypeLabel,
        header: 'Type',
        // Truncates rather than sets the width: "Legendary Artifact Creature"
        // would take 260px and no column of supporting detail earns that.
        size: 140,
        Cell: ({ row }) => (
          <Text size="md" truncate>
            {cardTypeLabel(row.original)}
          </Text>
        ),
      },
      {
        // Last, and the only column that grows — so it absorbs the leftover
        // width rather than leaving a ragged gap at the table's right edge.
        // Under a fixed layout it takes no width of its own at all (see
        // `mantineTableHeadCellProps`), which is what lets the table fit any
        // container: the other three are the only fixed cost, and everything
        // left over is Name's. This `size` is only the fallback MRT needs.
        id: 'name',
        accessorFn: cardDisplayName,
        header: 'Name',
        size: 300,
        grow: true,
        // The printed name leads; the Oracle name trails it in parentheses,
        // dimmed and a size down, and only on the cards that have one. Kept on
        // one line rather than stacked: a second line would set the row height
        // for every row in the table while only a minority of cards — none at
        // all in HOB, FIN or MSH — would ever use it. `truncate` on the wrapper
        // covers both, so a long pair ellipses at the column edge.
        Cell: ({ row }) => {
          const oracleName = cardOracleName(row.original);
          return (
            <Text size="md" truncate>
              {cardDisplayName(row.original)}
              {oracleName && (
                <Text span c="dimmed" size="sm">
                  {` (${oracleName})`}
                </Text>
              )}
            </Text>
          );
        },
      },
    ];
  }, [canVote, countMap, myPickMap, pickType]);

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
    // Cost and Type are both supporting detail; a phone has room for the vote
    // and the name, and little else.
    state: { sorting, columnVisibility: { cmc: !isMobile, type: !isMobile } },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      onSortingChange(next);
    },
    mantineTableProps: {
      // Rows only. The column rules were there to help four kinds of content
      // track across a row, but the vote unit now draws its own edges and the
      // ruled cells fought it — two boxes inside one box. Alignment carries the
      // columns on its own.
      withRowBorders: true,
      withColumnBorders: false,
      // No ring around the table. The panel it sits in is the container, and a
      // second edge a few pixels inside the first reads as a mistake.
      withTableBorder: false,
      // Column widths come from the column definitions rather than from the
      // cells. Semantic layout re-measures every column against its widest
      // visible cell, so changing the sort — which changes which 25 cards are
      // on the page, and with them the longest name and the widest cost — made
      // the columns jump. Fixed layout means the sort only reorders rows.
      layout: 'fixed',
      borderColor: TABLE_LINE,
      verticalSpacing: 'sm',
      // 12px rather than 16. With the column rules gone the gutters are all
      // that separate the columns, but they only have to read as a gap — the
      // extra 4px each side was buying width, not clarity.
      horizontalSpacing: 'sm',
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
    // Mantine centres table cells already. The catch is that the vote unit and
    // the mana pips are inline-level boxes: they sit on the cell's text
    // baseline, and the strut below it — the descender of a line of text that
    // isn't there — is part of what gets centred. The box ends up riding a few
    // pixels high. Zeroing the line box in the two columns that hold no text
    // collapses the strut, so what gets centred is the box itself.
    mantineTableBodyCellProps: ({ column }) => {
      if (column.id === 'votes' || column.id === 'cmc') return { style: { lineHeight: 0 } };
      // A fixed layout reads its widths from the header row alone, so this is
      // belt and braces — but MRT puts the same 300px floor on every Name cell,
      // and nothing about the column's flexibility should depend on that being
      // ignored.
      if (column.id === 'name') return { style: { width: 'auto', minWidth: 0 } };
      return {};
    },
    mantineTableHeadCellProps: ({ column }) => {
      const sorted = column.getIsSorted();
      return {
        // MRT does not set this itself, and the heading is now a button whose
        // pressed state is otherwise only legible from the arrow's direction.
        'aria-sort': sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none',
        style: {
          verticalAlign: 'middle',
          borderBottom: HEAD_RULE,
          // A fixed layout takes its column widths from this row and does not
          // shrink them, so a Name column with a width of its own makes the
          // table as wide as the sum — and the rules then run off the panel's
          // rounded edge, which is what a phone showed with only two columns
          // visible. Auto width plus no floor makes Name purely the remainder,
          // so the table fits its container at any width.
          //
          // Spread rather than a ternary per key: MRT sizes its columns with a
          // `min-width` of its own on these cells, and this style merges over
          // its style shallowly — so a key set to `undefined` for the other
          // three would delete their sizing rather than leave it alone.
          ...(column.id === 'name' ? { width: 'auto', minWidth: 0 } : {}),
        },
        children: <ColumnHeading column={column} pickType={pickType} />,
      };
    },
    mantineTableBodyRowProps: ({ row }) => ({
      // The row is the button: the vote unit's press is `:active` on this
      // element, so the marker only goes on rows where a click actually votes.
      // Spread rather than written inline — React's prop types have no slot for
      // a data attribute on an object literal.
      ...(canVote ? { 'data-vote-row': true } : {}),
      onClick: () => handleRowClick(row.original),
      // Only the opening half lives here. Clearing on the row's own leave would
      // blink the art off between every pair of rows, because leaving one row
      // fires before entering the next — the table below owns the close.
      onMouseEnter: isMobile ? undefined : () => setPreviewImage(row.original.scryfallImage),
      // Without this, a quick second vote on the same row selects the card name
      // instead of registering as a press.
      style: { cursor: 'pointer', userSelect: 'none' },
    }),
  });

  return (
    // The preview closes when the pointer leaves the whole table rather than
    // when it leaves a row, so moving down the list is one continuous preview
    // instead of one that blinks off at every row boundary.
    <div onMouseLeave={isMobile ? undefined : () => setPreviewImage(null)}>
      <MantineReactTable table={table} />
    </div>
  );
}
