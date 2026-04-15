import { Alert, Grid, Group, Loader, Pagination, Stack, Text, Title } from '@mantine/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../features/auth';
import { usePickCountsQuery, useMyPicksQuery, useMakePickMutation, useRemovePickMutation } from '../features/picks';
import type { Card, PickType } from '../features/picks';
import { CardRow } from '../features/picks/components/card-row';
import { ManaCost } from '../features/picks/components/mana-cost';
import { loadPrecon, loadUniverseSets, getAddCandidates } from '../features/picks/data/load-precon';

// Displays a precon deck's cards with CUT/ADD pick voting and community pick counts.
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

  // Build lookup maps from API data
  const countMap = useMemo(() => {
    const map: Record<string, Record<PickType, number>> = {};
    for (const c of countsQuery.data ?? []) {
      if (!map[c.cardId]) map[c.cardId] = { CUT: 0, ADD: 0 };
      map[c.cardId][c.pickType] = c.count;
    }
    return map;
  }, [countsQuery.data]);

  const myPickMap = useMemo(() => {
    const map: Record<string, { id: string; pickType: PickType }> = {};
    for (const p of myPicksQuery.data ?? []) {
      map[`${p.cardId}:${p.pickType}`] = { id: p.id, pickType: p.pickType };
    }
    return map;
  }, [myPicksQuery.data]);

  if (!precon) {
    return (
      <Text>Precon deck not found.</Text>
    );
  }

  const mainBoardCards = Object.values(precon.mainBoard);

  // Sort by pick count on initial load, then lock the order so cards don't
  // jump around as the user toggles picks.
  const cutsOrderRef = useRef<Card[] | null>(null);
  const addsOrderRef = useRef<Card[] | null>(null);

  if (!cutsOrderRef.current && countsQuery.data) {
    cutsOrderRef.current = [...mainBoardCards].sort(
      (a, b) => (countMap[b.id]?.CUT ?? 0) - (countMap[a.id]?.CUT ?? 0)
    );
  }
  if (!addsOrderRef.current && countsQuery.data) {
    addsOrderRef.current = [...addCandidates].sort(
      (a, b) => (countMap[b.id]?.ADD ?? 0) - (countMap[a.id]?.ADD ?? 0)
    );
  }

  const sortedCuts = cutsOrderRef.current ?? mainBoardCards;
  const sortedAdds = addsOrderRef.current ?? addCandidates;

  const PAGE_SIZE = 25;
  const [cutsPage, setCutsPage] = useState(1);
  const [addsPage, setAddsPage] = useState(1);

  function handlePick(cardId: string, pickType: PickType) {
    if (!preconId) return;
    makePick.mutate({ preconId, cardId, pickType });
  }

  function handleUnpick(cardId: string, pickType: PickType) {
    const key = `${cardId}:${pickType}`;
    const pick = myPickMap[key];
    if (pick) removePick.mutate(pick.id);
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
            userPicked={!!myPickMap[`${card.id}:${pickType}`]}
            onPick={() => handlePick(card.id, pickType)}
            onUnpick={() => handleUnpick(card.id, pickType)}
            canPick={isAuthenticated}
          />
        ))}
        {totalPages > 1 && (
          <Group justify="center" mt="md">
            <Pagination total={totalPages} value={page} onChange={setPage} color="yellow" />
          </Group>
        )}
      </>
    );
  }

  return (
    <Stack gap="lg">
      <Stack align="center" gap={4}>
        <Title order={2}>{precon.name}</Title>
        <Group gap={6} align="center">
          <Text size="sm" c="dimmed">
            Commander{precon.commanders.length > 1 ? 's' : ''}:{' '}
            {precon.commanders.map((c) => c.name).join(' & ')} ·
          </Text>
          <ManaCost cost={precon.colorIdentity.map((c) => `{${c}}`).join('')} size={16} />
        </Group>
      </Stack>

      {!isAuthenticated && (
        <Alert variant="light" color="blue">
          Sign in to make your picks. You can browse the community's picks as a guest.
        </Alert>
      )}

      {countsQuery.isLoading ? (
        <Loader />
      ) : (
        <Grid>
          <Grid.Col span={6}>
            <Title order={3} ta="center" size="h1">CUT</Title>
            <Stack gap={0} mt="md">
              {renderCardList(sortedCuts, 'CUT', cutsPage, setCutsPage)}
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Title order={3} ta="center" size="h1">ADD</Title>
            <Stack gap={0} mt="md">
              {renderCardList(sortedAdds, 'ADD', addsPage, setAddsPage)}
            </Stack>
          </Grid.Col>
        </Grid>
      )}
    </Stack>
  );
}
