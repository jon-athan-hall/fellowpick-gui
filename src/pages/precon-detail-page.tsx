import { Alert, Loader, Paper, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useCallback, useMemo, useState } from 'react';
import { Outlet, useMatch, useParams } from 'react-router-dom';
import { useAuth } from '../features/auth';
import classes from './precon-detail-page.module.css';
import {
  CardHoverPreview,
  CardPreviewDrawer,
  DeckIdentity,
  PickSwitcher,
  useAddCandidatesQuery,
  useCardPreview,
  usePreconQuery,
  useMakePickMutation,
  useMyPicksQuery,
  usePickCountsQuery,
  useRemovePickMutation,
} from '../features/pick';
import type { Card, PickType, PreconBoardContext } from '../features/pick';

// Stable identity for "no candidates yet". `?? []` would hand the boards a
// fresh array on every render and re-snapshot their locked order each time.
const EMPTY_CANDIDATES: Card[] = [];
const EMPTY_COUNTS: PreconBoardContext['counts'] = [];

/**
 * Floor for the header, so the commander art has room to show its subject.
 * The art band is `cover`-sized, so a header only as tall as its two lines of
 * text crops the piece to a letterbox slice and regularly cuts the commander's
 * face out of it.
 */
const HEADER_MIN_HEIGHT = '8rem';

// The deck layout: everything that stays put while you move between the two
// votes — the identity header, the switcher, the guest notice, and the card
// preview drawer. The CUT and ADD boards are child routes rendered through the
// outlet, and the shared data they both need is resolved once here.
//
// The route wraps this in a `key={preconId}` boundary, so per-precon state is
// reset by remount when navigating between precons rather than by cleanup here.
export function PreconDetailPage() {
  const { universeId, preconId } = useParams<{ universeId: string; preconId: string }>();
  const { isAuthenticated } = useAuth();
  const { setPreviewImage } = useCardPreview();

  // Which board is mounted, read from the route rather than from state. The
  // switcher and the drawer's vote button both need it, and matching the route
  // keeps this honest if someone deep-links straight to /add.
  const isAdd = useMatch('/universes/:universeId/precons/:preconId/add') !== null;
  const activePickType: PickType = isAdd ? 'ADD' : 'CUT';

  const preconQuery = usePreconQuery(universeId ?? '', preconId ?? '');
  const addCandidatesQuery = useAddCandidatesQuery(universeId ?? '', preconId ?? '');
  const precon = preconQuery.data ?? null;
  const countsQuery = usePickCountsQuery(preconId ?? '');
  const myPicksQuery = useMyPicksQuery(preconId ?? '', isAuthenticated);
  const makePick = useMakePickMutation(preconId ?? '');
  const removePick = useRemovePickMutation(preconId ?? '');

  const addCandidates = addCandidatesQuery.data ?? EMPTY_CANDIDATES;
  const counts = countsQuery.data ?? EMPTY_COUNTS;

  const countMap = useMemo(() => {
    const map: Record<string, Record<PickType, number>> = {};
    for (const c of counts) {
      if (!map[c.cardId]) map[c.cardId] = { CUT: 0, ADD: 0 };
      map[c.cardId][c.pickType] = c.count;
    }
    return map;
  }, [counts]);

  const myPickMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of myPicksQuery.data ?? []) {
      map[`${p.cardId}:${p.pickType}`] = p.id;
    }
    return map;
  }, [myPicksQuery.data]);

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
    ? myPickMap[`${previewCardId}:${activePickType}`]
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
      makePick.mutate({ preconId, cardId: previewCardId, pickType: activePickType });
    }
    setPreviewCardId(null);
  }, [previewCardId, previewPickId, preconId, activePickType, makePick, removePick]);

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

  const boardContext = useMemo<PreconBoardContext | null>(
    () =>
      precon
        ? {
            precon,
            addCandidates,
            counts,
            countsReady: countsQuery.isSuccess,
            countMap,
            myPickMap,
            canPick: isAuthenticated,
            isMobile,
            onCardTap: handleCardTap,
            onPick: handlePick,
            onUnpick: handleUnpick,
          }
        : null,
    [
      precon,
      addCandidates,
      counts,
      countsQuery.isSuccess,
      countMap,
      myPickMap,
      isAuthenticated,
      isMobile,
      handleCardTap,
      handlePick,
      handleUnpick,
    ]
  );

  // The deck's JSON is a lazily-imported chunk now, so "no precon" means either
  // still arriving or genuinely absent — tell those apart before saying so.
  if (preconQuery.isPending) {
    return <Loader />;
  }

  if (!precon || !boardContext) {
    return <Text>Precon deck not found.</Text>;
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
        mih={HEADER_MIN_HEIGHT}
        // Centred rather than top-aligned: once the panel is taller than its
        // text, the identity has to sit in the middle of the art or it reads as
        // having fallen to the top of the box.
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
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

      <PickSwitcher
        deckHref={`/universes/${universeId}/precons/${preconId}`}
        active={activePickType}
      />

      {!isAuthenticated && (
        <Alert variant="light" color="gold">
          Sign in to make your picks. You can browse the community's picks as a guest.
        </Alert>
      )}

      {countsQuery.isLoading ? <Loader /> : <Outlet context={boardContext} />}

      {/* The two halves of the same feature: hover follows the pointer on a
          desktop, and a tap opens the sheet on a phone. Both read the same
          preview state, so only one of them may be live at a time. */}
      <CardHoverPreview disabled={isMobile} />

      <CardPreviewDrawer
        card={previewCard}
        pickType={activePickType}
        hasVoted={previewPickId !== undefined}
        canVote={isAuthenticated}
        onVote={handleVoteFromPreview}
        onClose={handleClosePreview}
      />
    </Stack>
  );
}
