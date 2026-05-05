import { Alert, Grid, Group, Loader, Pagination, Paper, Stack, Text, Title } from '@mantine/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../features/auth';
import {
  CardRow,
  DeckIdentity,
  getAddCandidates,
  loadPrecon,
  loadUniverseSets,
  useMakePickMutation,
  useMyPicksQuery,
  usePickCountsQuery,
  useRemovePickMutation,
} from '../features/pick';
import type { Card, PickType } from '../features/pick';

const PAGE_SIZE = 25;

// Displays a precon deck's cards with CUT/ADD pick voting and community pick counts.
// The route wraps this in a `key={preconId}` boundary, so per-precon state
// (locked sort order, pagination) is reset by remount when navigating between
// precons rather than by manual cleanup here.
export function PreconDetailPage() {
  const { universeId, preconId } = useParams<{ universeId: string; preconId: string }>();
  const { isAuthenticated } = useAuth();

  const precon = universeId && preconId ? loadPrecon(universeId, preconId) : null;
  const countsQuery = usePickCountsQuery(preconId ?? '');
  const myPicksQuery = useMyPicksQuery(preconId ?? '', isAuthenticated);
  const makePick = useMakePickMutation(preconId ?? '');
  const removePick = useRemovePickMutation(preconId ?? '');

  const addCandidates = useMemo(
    () => {
      const sets = universeId ? loadUniverseSets(universeId) : [];
      return precon ? getAddCandidates(precon, sets) : [];
    },
    [precon, universeId]
  );

  // Preload all card images in the background so hover previews are instant.
  useEffect(() => {
    if (!precon) return;
    const allCards = [...Object.values(precon.mainBoard), ...addCandidates];
    for (const card of allCards) {
      if (card.scryfallImage) {
        const img = new Image();
        img.src = card.scryfallImage;
      }
    }
  }, [precon, addCandidates]);

  const countMap = useMemo(() => {
    const map: Record<string, Record<PickType, number>> = {};
    for (const c of countsQuery.data ?? []) {
      if (!map[c.cardId]) map[c.cardId] = { CUT: 0, ADD: 0 };
      map[c.cardId][c.pickType] = c.count;
    }
    return map;
  }, [countsQuery.data]);

  const myPickMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of myPicksQuery.data ?? []) {
      map[`${p.cardId}:${p.pickType}`] = p.id;
    }
    return map;
  }, [myPicksQuery.data]);

  // Lock sort order on the FIRST successful counts load, so subsequent toggles
  // (which optimistically mutate counts) don't reshuffle the list. Depending on
  // `countsQuery.isSuccess` rather than `countsQuery.data` means the memo only
  // recomputes when the query first succeeds; further `data` updates are
  // ignored. Remount via the route's `key={preconId}` resets the lock per precon.
  const sortedCuts = useMemo<Card[]>(() => {
    if (!precon) return [];
    const cards = Object.values(precon.mainBoard);
    if (!countsQuery.isSuccess) return cards;
    const anchor: Record<string, number> = {};
    for (const c of countsQuery.data ?? []) {
      if (c.pickType === 'CUT') anchor[c.cardId] = c.count;
    }
    return [...cards].sort((a, b) => (anchor[b.id] ?? 0) - (anchor[a.id] ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: lock on first success
  }, [precon, countsQuery.isSuccess]);

  const sortedAdds = useMemo<Card[]>(() => {
    if (!countsQuery.isSuccess) return addCandidates;
    const anchor: Record<string, number> = {};
    for (const c of countsQuery.data ?? []) {
      if (c.pickType === 'ADD') anchor[c.cardId] = c.count;
    }
    return [...addCandidates].sort((a, b) => (anchor[b.id] ?? 0) - (anchor[a.id] ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: lock on first success
  }, [addCandidates, countsQuery.isSuccess]);

  const [cutsPage, setCutsPage] = useState(1);
  const [addsPage, setAddsPage] = useState(1);

  const handlePick = useCallback(
    (cardId: string, pickType: PickType) => {
      if (!preconId) return;
      makePick.mutate({ preconId, cardId, pickType });
    },
    [preconId, makePick]
  );

  const handleUnpick = useCallback(
    (pickId: string) => {
      removePick.mutate(pickId);
    },
    [removePick]
  );

  if (!precon) {
    return <Text>Precon deck not found.</Text>;
  }

  function renderCardList(cards: Card[], pickType: PickType, page: number, setPage: (p: number) => void) {
    const totalPages = Math.ceil(cards.length / PAGE_SIZE);
    const start = (page - 1) * PAGE_SIZE;
    const pageCards = cards.slice(start, start + PAGE_SIZE);

    return (
      <>
        {pageCards.map((card) => (
          <CardRow
            key={card.id}
            card={card}
            count={countMap[card.id]?.[pickType] ?? 0}
            pickType={pickType}
            pickId={myPickMap[`${card.id}:${pickType}`]}
            onPick={handlePick}
            onUnpick={handleUnpick}
            canPick={isAuthenticated}
          />
        ))}
        {totalPages > 1 && (
          <Group justify="center" mt="md">
            <Pagination
              total={totalPages}
              value={page}
              onChange={setPage}
              color={pickType === 'CUT' ? 'red' : 'secondary'}
            />
          </Group>
        )}
      </>
    );
  }

  return (
    <Stack gap="lg">
      <Paper>
        <DeckIdentity
          name={precon.name}
          commanders={precon.commanders}
          colorIdentity={precon.colorIdentity}
          titleOrder={2}
        />
      </Paper>

      {!isAuthenticated && (
        <Alert variant="light" color="secondary">
          Sign in to make your picks. You can browse the community's picks as a guest.
        </Alert>
      )}

      {countsQuery.isLoading ? (
        <Loader />
      ) : (
        <Grid gutter="xl">
          <Grid.Col span={6}>
            <Paper style={{ borderTop: '3px solid var(--mantine-color-red-6)' }}>
              <Title order={3} ta="center" size="h1" c="red">CUT</Title>
              <Stack gap={0} mt="md">
                {renderCardList(sortedCuts, 'CUT', cutsPage, setCutsPage)}
              </Stack>
            </Paper>
          </Grid.Col>
          <Grid.Col span={6}>
            <Paper style={{ borderTop: '3px solid var(--mantine-color-secondary-6)' }}>
              <Title order={3} ta="center" size="h1" c="secondary">ADD</Title>
              <Stack gap={0} mt="md">
                {renderCardList(sortedAdds, 'ADD', addsPage, setAddsPage)}
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      )}
    </Stack>
  );
}
