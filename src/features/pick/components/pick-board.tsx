import { Group, Pagination, Paper } from '@mantine/core';
import { useMemo, useState } from 'react';
import { cardTypeLabel } from '../card-type';
import { usePreconBoard } from '../hooks/use-precon-board';
import { PICK_ACCENT_NAME } from '../pick-accent';
import type { Card, PickType } from '../types';
import { CardTable, type SortColumn } from './card-table';

const PAGE_SIZE = 25;

type SortDirection = 'asc' | 'desc';
interface SortState {
  column: SortColumn;
  direction: SortDirection;
}

// Sorts a list of cards according to the active sort and a snapshot of
// vote counts. Stable: ties resolve by name A→Z so order doesn't waver
// across renders.
function sortCards(cards: Card[], sort: SortState, voteAnchor: Record<string, number>): Card[] {
  const sign = sort.direction === 'asc' ? 1 : -1;
  return [...cards].sort((a, b) => {
    let cmp = 0;
    if (sort.column === 'votes') {
      cmp = (voteAnchor[a.id] ?? 0) - (voteAnchor[b.id] ?? 0);
    } else if (sort.column === 'cmc') {
      cmp = a.manaValue - b.manaValue;
    } else if (sort.column === 'type') {
      // Compare what the column actually shows, so a card reading "Artifact
      // Creature" sorts under A rather than under its first type alone.
      cmp = cardTypeLabel(a).localeCompare(cardTypeLabel(b));
    } else {
      cmp = a.name.localeCompare(b.name);
    }
    if (cmp === 0 && sort.column !== 'name') {
      cmp = a.name.localeCompare(b.name);
    }
    return sign * cmp;
  });
}

interface PickBoardProps {
  pickType: PickType;
}

/**
 * One side of the vote: the deck's own cards under CUT, the candidate pool
 * under ADD. Mounted by the `cut` and `add` routes beneath the deck layout,
 * which owns the deck itself, the counts and the vote handlers.
 *
 * Because the two are separate routes, switching sides unmounts this component
 * and mounts the other. That is what resets the sort snapshot and the page —
 * behaviour the old tab switch had to reproduce by hand.
 */
export function PickBoard({ pickType }: PickBoardProps) {
  const {
    precon,
    addCandidates,
    counts,
    countsReady,
    countMap,
    myPickMap,
    canPick,
    isMobile,
    onCardTap,
    onPick,
    onUnpick,
  } = usePreconBoard();

  // Lock sort order so optimistic count mutations from picks don't reshuffle
  // the list mid-vote — the card you just voted on shouldn't "disappear" by
  // jumping into its new slot. Reorder only on: first successful load, and a
  // sort-column-or-direction change. Both bump `sortKey`, which the memo
  // depends on; vote events do not.
  const [sortKey, setSortKey] = useState(0);
  const [sort, setSort] = useState<SortState>({ column: 'votes', direction: 'desc' });
  const [page, setPage] = useState(1);

  const source = useMemo<Card[]>(
    () => (pickType === 'CUT' ? Object.values(precon.mainBoard) : addCandidates),
    [pickType, precon, addCandidates]
  );

  const sorted = useMemo<Card[]>(() => {
    if (!countsReady) return source;
    const anchor: Record<string, number> = {};
    for (const c of counts) {
      if (c.pickType === pickType) anchor[c.cardId] = c.count;
    }
    return sortCards(source, sort, anchor);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: re-snapshot only on sortKey
  }, [source, countsReady, sortKey]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const pageCards = sorted.slice(start, start + PAGE_SIZE);

  // MRT uses its own sorting-state shape; convert from our SortState.
  const mrtSorting = [{ id: sort.column, desc: sort.direction === 'desc' }];

  return (
    <Paper>
      <CardTable
        cards={pageCards}
        countMap={countMap}
        myPickMap={myPickMap}
        pickType={pickType}
        canPick={canPick}
        isMobile={isMobile}
        sorting={mrtSorting}
        onSortingChange={(next) => {
          if (next.length === 0) return;
          const column = next[0].id as SortColumn;
          const direction: SortDirection = next[0].desc ? 'desc' : 'asc';
          setSort({ column, direction });
          setSortKey((k) => k + 1);
        }}
        onCardTap={onCardTap}
        onPick={onPick}
        onUnpick={onUnpick}
      />
      {totalPages > 1 && (
        <Group justify="center" mt="md">
          <Pagination
            total={totalPages}
            value={page}
            onChange={setPage}
            color={PICK_ACCENT_NAME[pickType]}
            siblings={isMobile ? 0 : 1}
          />
        </Group>
      )}
    </Paper>
  );
}
