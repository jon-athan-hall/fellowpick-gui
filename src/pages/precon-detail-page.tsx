import { Alert, Group, Loader, Pagination, Paper, Stack, Tabs, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import type { CSSProperties } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../features/auth';
import classes from './precon-detail-page.module.css';
import {
  CardPreviewDrawer,
  CardRow,
  DeckIdentity,
  loadAddCandidates,
  loadPrecon,
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
    () => (universeId && preconId ? loadAddCandidates(universeId, preconId) : []),
    [universeId, preconId]
  );

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

  // Mobile preview drawer: at narrow viewports, tapping a row opens the card
  // image in a bottom sheet where vote/unvote also lives. Desktop is
  // unchanged — sidebar hover preview + click-row-to-toggle. We key off
  // viewport width (Mantine `sm` = 48em) rather than `(hover: none)` because
  // the layout decision is really about screen size: a hover-capable touch
  // laptop or shrunken browser window also wants the mobile UX here.
  // `getInitialValueInEffect: false` reads the media query synchronously on
  // first render so a phone reload doesn't briefly show desktop behavior
  // before the effect runs.
  const isMobile = useMediaQuery('(max-width: 48em)', false, {
    getInitialValueInEffect: false,
  });
  const [previewCardId, setPreviewCardId] = useState<string | null>(null);

  const cardById = useMemo(() => {
    const m: Record<string, Card> = {};
    if (precon) for (const c of Object.values(precon.mainBoard)) m[c.id] = c;
    for (const c of addCandidates) m[c.id] = c;
    return m;
  }, [precon, addCandidates]);

  const previewCard = previewCardId ? cardById[previewCardId] ?? null : null;
  const previewPickId = previewCardId
    ? myPickMap[`${previewCardId}:${activeTab}`]
    : undefined;

  const handleCardTap = useCallback((cardId: string) => {
    setPreviewCardId(cardId);
  }, []);

  const handleClosePreview = useCallback(() => setPreviewCardId(null), []);

  const handleVoteFromPreview = useCallback(() => {
    if (!previewCardId || !preconId) return;
    if (previewPickId) {
      removePick.mutate(previewPickId);
    } else {
      makePick.mutate({ preconId, cardId: previewCardId, pickType: activeTab });
    }
    setPreviewCardId(null);
  }, [previewCardId, previewPickId, preconId, activeTab, makePick, removePick]);

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
            isMobile={isMobile}
            onCardTap={handleCardTap}
          />
        ))}
        {totalPages > 1 && (
          <Group justify="center" mt="md">
            <Pagination
              total={totalPages}
              value={page}
              onChange={setPage}
              color={pickType === 'CUT' ? 'red' : 'secondary'}
              size="md"
              siblings={isMobile ? 0 : 1}
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
          // Right-anchored overlay: the image fills its width box via `cover`,
          // and a left-going gradient on top fades it from the right edge
          // (transparent) to the panel's bg (dark.6). Width drops from 50%
          // to 30% under the sm breakpoint so the title isn't crowded on
          // narrow phones — see precon-detail-page.module.css.
          <div
            aria-hidden="true"
            className={classes.commanderArt}
            style={{
              backgroundImage: `linear-gradient(to left, transparent, var(--mantine-color-dark-6)), url(${commanderArt})`,
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

      <CardPreviewDrawer
        card={previewCard}
        pickType={activeTab}
        hasVoted={previewPickId !== undefined}
        canVote={isAuthenticated}
        onVote={handleVoteFromPreview}
        onClose={handleClosePreview}
      />
    </Stack>
  );
}
