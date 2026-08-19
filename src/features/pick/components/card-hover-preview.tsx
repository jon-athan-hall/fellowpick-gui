import { Box, Image, Portal } from '@mantine/core';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useCardPreview } from '../hooks/use-card-preview';

/**
 * The preview's width, and the aspect every Scryfall "normal" image holds
 * (488×680). The height is derived rather than measured, so the placeholder can
 * occupy the full card's footprint before the image itself has loaded.
 */
const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = Math.round(PREVIEW_WIDTH * (680 / 488));

/** The gap between the pointer and the art's corner. */
const CURSOR_GAP = 12;

/** How close to the viewport edge the art may come before it flips sides. */
const EDGE_MARGIN = 8;

/**
 * The desktop card preview: full card art following the pointer, its top-left
 * corner at the cursor.
 *
 * It renders whatever `useCardPreview` currently holds rather than owning a
 * hover target of its own, so the deck header and every table row feed one
 * floating panel by calling `setPreviewImage` — rather than each hover target
 * carrying a tooltip of its own.
 *
 * It is inert by construction: `pointer-events: none` means the art can sit
 * directly under the cursor without stealing the click the row underneath is
 * waiting for, and without its own arrival firing a mouseleave on the row that
 * opened it.
 *
 * Position is written straight to the node instead of held in state. A pointer
 * crossing a table fires mousemove upwards of a hundred times a second, and
 * none of those are React's business — the only thing that re-renders this
 * component is the card changing.
 *
 * The mobile counterpart is `CardPreviewDrawer`, a tap-opened sheet, since
 * there is no hover to follow. Pass `disabled` there so both never run at once.
 */
export function CardHoverPreview({ disabled = false }: { disabled?: boolean }) {
  const { imageUrl } = useCardPreview();
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const place = useCallback(() => {
    const node = nodeRef.current;
    const pos = lastPos.current;
    if (!node || !pos) return;

    // Flipped across the pointer rather than clamped to the edge: art pinned to
    // the bottom of the window while the pointer sits halfway up it reads as
    // belonging to nothing.
    const flipX = pos.x + CURSOR_GAP + PREVIEW_WIDTH + EDGE_MARGIN > window.innerWidth;
    const flipY = pos.y + CURSOR_GAP + PREVIEW_HEIGHT + EDGE_MARGIN > window.innerHeight;
    const left = flipX ? pos.x - CURSOR_GAP - PREVIEW_WIDTH : pos.x + CURSOR_GAP;
    const top = flipY ? pos.y - CURSOR_GAP - PREVIEW_HEIGHT : pos.y + CURSOR_GAP;

    node.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    node.style.visibility = 'visible';
  }, []);

  // Tracked whether or not a preview is open, so one that opens without a
  // pointer move still lands in the right place — a row scrolling up under a
  // stationary cursor opens a preview and has no mousemove of its own.
  useEffect(() => {
    if (disabled) return;
    const onMove = (event: MouseEvent) => {
      lastPos.current = { x: event.clientX, y: event.clientY };
      place();
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [disabled, place]);

  // Before paint, so the art never shows for a frame at the previous card's
  // position. It starts hidden and `place` is what reveals it.
  useLayoutEffect(() => {
    if (imageUrl) place();
  }, [imageUrl, place]);

  if (disabled || !imageUrl) return null;

  return (
    <Portal>
      <Box
        ref={nodeRef}
        aria-hidden="true"
        w={PREVIEW_WIDTH}
        h={PREVIEW_HEIGHT}
        bg="dark.7"
        bdrs="md"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          visibility: 'hidden',
          zIndex: 'var(--mantine-z-index-popover)',
          pointerEvents: 'none',
          boxShadow: 'var(--mantine-shadow-xl)',
          overflow: 'hidden',
        }}
      >
        {/* Keyed on the url so a new card never renders as the previous card's
            art while its own image is still in flight. The box behind it holds
            the card's footprint meanwhile, so the gap reads as loading rather
            than as the wrong card. */}
        <Image key={imageUrl} src={imageUrl} alt="" w={PREVIEW_WIDTH} h={PREVIEW_HEIGHT} />
      </Box>
    </Portal>
  );
}
