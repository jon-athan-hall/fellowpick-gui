import { Alert, Container, Loader, Stack, Tabs, Text, Title } from '@mantine/core';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../features/auth';
import { usePickCountsQuery, useMyPicksQuery, useMakePickMutation, useRemovePickMutation } from '../features/picks';
import type { Card, PickType } from '../features/picks';
import { CardRow } from '../features/picks/components/card-row';
import { loadPrecon, loadUniverseSets, getAddCandidates } from '../features/picks/data/load-precon';

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
      <Container size="md" py="xl">
        <Text>Precon deck not found.</Text>
      </Container>
    );
  }

  const mainBoardCards = Object.values(precon.mainBoard);

  // Sort by pick count descending
  const sortedCuts = [...mainBoardCards].sort(
    (a, b) => (countMap[b.id]?.CUT ?? 0) - (countMap[a.id]?.CUT ?? 0)
  );

  const sortedAdds = [...addCandidates].sort(
    (a, b) => (countMap[b.id]?.ADD ?? 0) - (countMap[a.id]?.ADD ?? 0)
  );

  function handlePick(cardId: string, pickType: PickType) {
    if (!preconId) return;
    makePick.mutate({ preconId, cardId, pickType });
  }

  function handleUnpick(cardId: string, pickType: PickType) {
    const key = `${cardId}:${pickType}`;
    const pick = myPickMap[key];
    if (pick) removePick.mutate(pick.id);
  }

  function renderCardList(cards: Card[], pickType: PickType) {
    return cards.map((card) => (
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
    ));
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={2}>{precon.name}</Title>
          <Text size="sm" c="dimmed">
            Commander{precon.commanders.length > 1 ? 's' : ''}:{' '}
            {precon.commanders.map((c) => c.name).join(' & ')}
            {' · '}Color identity: {precon.colorIdentity.join('')}
          </Text>
        </div>

        {!isAuthenticated && (
          <Alert variant="light" color="blue">
            Sign in to make your picks. You can browse the community's picks as a guest.
          </Alert>
        )}

        {countsQuery.isLoading ? (
          <Loader />
        ) : (
          <Tabs defaultValue="cuts">
            <Tabs.List>
              <Tabs.Tab value="cuts">CUT ({mainBoardCards.length} cards)</Tabs.Tab>
              <Tabs.Tab value="adds">ADD ({addCandidates.length} candidates)</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="cuts" pt="md">
              <Stack gap={0}>{renderCardList(sortedCuts, 'CUT')}</Stack>
            </Tabs.Panel>

            <Tabs.Panel value="adds" pt="md">
              <Stack gap={0}>{renderCardList(sortedAdds, 'ADD')}</Stack>
            </Tabs.Panel>
          </Tabs>
        )}
      </Stack>
    </Container>
  );
}
