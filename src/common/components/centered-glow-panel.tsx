import { Box, Flex, Paper } from '@mantine/core';
import type { ReactNode } from 'react';

/**
 * Everything stacked above the routed page inside the shell: the fixed header,
 * then Main's own top padding. Read from the shell's variables rather than
 * restated as numbers, so it survives a change to `padding` or `header.height`
 * in app-layout.
 */
const CHROME_ABOVE = 'var(--app-shell-header-offset, 0rem) + var(--app-shell-padding, 1rem)';

/**
 * From `sm` up, `UniverseNav` is stacked above the page too. It costs exactly
 * its own height — its `mt="-md"` and `mb="md"` cancel — which is the tab's
 * `sm` padding top and bottom either side of one line of text.
 */
const NAV_HEIGHT = '3rem';

/**
 * The card is centred on the **viewport**, not on the space left under the
 * chrome, so it sits where the eye expects rather than pushed down by the
 * header. The frame starts `T` below the viewport top, so a frame `100dvh - 2T`
 * tall has its middle at exactly `50dvh`.
 *
 * That also makes overflow impossible for a short card: the frame's bottom edge
 * lands at `100dvh - T`, always short of the fold.
 */
const CENTRED_ON_VIEWPORT = `calc(100dvh - 2 * (${CHROME_ABOVE}))`;
const CENTRED_ON_VIEWPORT_BELOW_NAV = `calc(100dvh - 2 * (${CHROME_ABOVE} + ${NAV_HEIGHT}))`;

/**
 * Half the main column, but never narrower than 20rem and never wider than the
 * space available — one expression instead of a breakpoint, and it cannot
 * overflow the way a bare `min-width` would (min-width beats max-width, so the
 * card would win the argument and push the page).
 *
 * The redundant-looking `calc()` wrapper is load-bearing: Mantine's rem
 * converter returns anything starting with `calc(` verbatim, and would
 * otherwise take this string apart at its commas.
 */
export const PANEL_HALF_COLUMN = 'calc(min(100%, max(20rem, 50%)))';

/** The same shape, widened for pages whose card holds prose rather than a form. */
export const PANEL_PROSE_COLUMN = 'calc(min(100%, max(20rem, 68%)))';

interface CenteredGlowPanelProps {
  children: ReactNode;
  /** Card width. One of the `PANEL_*` expressions, or any CSS length. */
  w?: string;
}

/**
 * A bordered card centred on the viewport and floating on a sapphire radial
 * glow rather than a shadow — the same trick the header's wizard uses, which is
 * what ties a page using it to the chrome above.
 *
 * Taller-than-viewport children are fine: the centring is a `mih`, so the frame
 * grows past it and the page scrolls normally.
 */
export function CenteredGlowPanel({ children, w = PANEL_HALF_COLUMN }: CenteredGlowPanelProps) {
  return (
    // Centring frame. `py` gives the glow's two rem of vertical bleed somewhere
    // to go, and `overflow: hidden` catches the horizontal bleed — without
    // either, the glow is what puts scrollbars on the page. Nothing visible is
    // lost to the clip: the gradient reaches full transparency at 70% of its
    // radius, well inside the element's own edge.
    <Flex
      align="center"
      py="xl"
      mih={{ base: CENTRED_ON_VIEWPORT, sm: CENTRED_ON_VIEWPORT_BELOW_NAV }}
      style={{ overflow: 'hidden' }}
    >
      {/* The glow's frame, and the reason it is a separate element from the
          card: it spans the full column while standing only as tall as the
          card, so the wash is wide and shallow. Sized to the card instead, the
          ellipse collapses to the card's own width and disappears behind it. */}
      <Flex pos="relative" w="100%" justify="center">
        {/* Decorative: a soft sapphire wash bleeding out past the card on every
            side. It is a sibling rather than a box-shadow so it can be wider and
            softer than the card itself, which is what makes it read as a glow
            instead of an edge. */}
        <Box
          aria-hidden="true"
          pos="absolute"
          style={{
            inset: '-2rem',
            background:
              'radial-gradient(50% 55% at 50% 40%, color-mix(in srgb, var(--mantine-color-sapphire-6) 40%, transparent), transparent 70%)',
            filter: 'blur(24px)',
            pointerEvents: 'none'
          }}
        />

        <Paper withBorder p="xl" pos="relative" w={w}>
          {children}
        </Paper>
      </Flex>
    </Flex>
  );
}
