import { Alert, Group, Loader, Pagination, Paper, Stack, Tabs, Text } from '@mantine/core';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../features/auth';
import classes from './precon-detail-page.module.css';
import {
  CardRow,
  DeckIdentity,
  getAddCandidates,
  loadPrecon,
  loadUniverseSets,
  useCardPreview,
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
  const { setPreviewImage } = useCardPreview();

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

  // Lock sort order so optimistic count mutations from picks don't reshuffle the
  // list mid-vote. Reorder only on: first successful load and tab switches.
  const [activeTab, setActiveTab] = useState<PickType>('CUT');
  const [sortKey, setSortKey] = useState(0);

  const sortedCuts = useMemo<Card[]>(() => {
    if (!precon) return [];
    const cards = Object.values(precon.mainBoard);
    if (!countsQuery.isSuccess) return cards;
    const anchor: Record<string, number> = {};
    for (const c of countsQuery.data ?? []) {
      if (c.pickType === 'CUT') anchor[c.cardId] = c.count;
    }
    return [...cards].sort((a, b) => (anchor[b.id] ?? 0) - (anchor[a.id] ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: re-snapshot only on sortKey
  }, [precon, countsQuery.isSuccess, sortKey]);

  const sortedAdds = useMemo<Card[]>(() => {
    if (!countsQuery.isSuccess) return addCandidates;
    const anchor: Record<string, number> = {};
    for (const c of countsQuery.data ?? []) {
      if (c.pickType === 'ADD') anchor[c.cardId] = c.count;
    }
    return [...addCandidates].sort((a, b) => (anchor[b.id] ?? 0) - (anchor[a.id] ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: re-snapshot only on sortKey
  }, [addCandidates, countsQuery.isSuccess, sortKey]);

  const [cutsPage, setCutsPage] = useState(1);
  const [addsPage, setAddsPage] = useState(1);

  const handleTabChange = useCallback((value: string | null) => {
    if (value !== 'CUT' && value !== 'ADD') return;
    setActiveTab((current) => {
      if (current === value) return current;
      setSortKey((k) => k + 1);
      return value;
    });
  }, []);

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

  // Commander artwork as a right-anchored decorative background on the header,
  // fading to the panel's dark.6 by 50% from the right edge. The image lives in
  // an absolutely-positioned overlay div rather than on the Paper's own
  // background, because Mantine's `bg` prop emits a `background:` shorthand
  // that overrides any inline `background-image` we'd put on the Paper itself.
  const commanderArt = precon.commanders[0]?.scryfallImage?.replace('/large/', '/art_crop/');
  const commanderFullCard = precon.commanders[0]?.scryfallImage ?? null;

  return (
    <Stack gap="lg">
      <Paper
        style={{ position: 'relative', overflow: 'hidden' }}
        onMouseEnter={() => setPreviewImage(commanderFullCard)}
        onMouseLeave={() => setPreviewImage(null)}
      >
        {commanderArt && (
          // Right-half overlay: the image fills its 50%-wide box via `cover`,
          // and a left-going gradient on top fades it from the right edge
          // (transparent) to the midpoint of the Paper (solid dark.6).
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '50%',
              backgroundImage: `linear-gradient(to left, transparent, var(--mantine-color-dark-6)), url(${commanderArt})`,
              // Heads on humanoid commanders typically sit ~20–30% from the
               // top of the art_crop frame, so anchor the visible band there.
               backgroundPosition: 'right 25%',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              pointerEvents: 'none',
              borderTopRightRadius: 'inherit',
              borderBottomRightRadius: 'inherit',
            }}
          />
        )}
        <div style={{ position: 'relative' }}>
          <DeckIdentity
            name={precon.name}
            commanders={precon.commanders}
            colorIdentity={precon.colorIdentity}
            titleOrder={1}
          />
        </div>
      </Paper>

      {!isAuthenticated && (
        <Alert variant="light" color="secondary">
          Sign in to make your picks. You can browse the community's picks as a guest.
        </Alert>
      )}

      {countsQuery.isLoading ? (
        <Loader />
      ) : (
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="default"
          classNames={{
            root: classes.root,
            list: classes.list,
            tab: classes.tab,
            panel: classes.panel,
          }}
          style={{
            '--tab-color':
              activeTab === 'CUT'
                ? 'var(--mantine-color-red-6)'
                : 'var(--mantine-color-secondary-6)',
          } as CSSProperties}
        >
          <Tabs.List grow>
            <Tabs.Tab value="CUT">
              <Text fw={700} size="lg" c="red">CUT</Text>
            </Tabs.Tab>
            <Tabs.Tab value="ADD">
              <Text fw={700} size="lg" c="secondary">ADD</Text>
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="CUT">
            <Stack gap={0}>
              {renderCardList(sortedCuts, 'CUT', cutsPage, setCutsPage)}
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value="ADD">
            <Stack gap={0}>
              {renderCardList(sortedAdds, 'ADD', addsPage, setAddsPage)}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      )}
    </Stack>
  );
}
