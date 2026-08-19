import { Box, Group, Text } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PICK_ACCENT } from '../pick-accent';
import type { PickType } from '../types';

/** Milliseconds for the spark's turn, and for both words' colour change. */
const TURN_MS = 250;

/** Set once: the words and the spark are the same size by definition. */
const FONT_SIZE = '2.5rem';

// Shared by the visible word and the invisible copy that reserves its width —
// they have to be typographically identical or the reservation is wrong.
const WORD_TYPE = {
  fontFamily: 'var(--mantine-font-family-headings)',
  fontSize: FONT_SIZE,
  lineHeight: 1.1,
} as const;

const SIDES: { type: PickType; color: string; path: string }[] = [
  { type: 'CUT', color: PICK_ACCENT.CUT, path: 'cut' },
  { type: 'ADD', color: PICK_ACCENT.ADD, path: 'add' },
];

interface PickSwitcherProps {
  /** The deck's base URL; `/cut` and `/add` hang off it. */
  deckHref: string;
  active: PickType;
}

/**
 * Moves between a deck's two votes. Not a control but a pair of links — the two
 * sides are separate routes, so this has to survive middle-click, the back
 * button and a deep link, none of which a stateful toggle would.
 *
 * The ✦ between the words belongs to whichever side is active: it turns a
 * quarter-turn into an X and takes the crimson under CUT, then settles back
 * upright and gold under ADD. It is the same gold spark the app header sets
 * between its descriptors, which is what makes this read as chrome rather than
 * as a widget dropped onto the page.
 */
export function PickSwitcher({ deckHref, active }: PickSwitcherProps) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState<PickType | null>(null);

  const ms = reduceMotion ? 0 : TURN_MS;
  const activeColor = SIDES.find((s) => s.type === active)!.color;

  return (
    <Group gap="md" justify="center" align="center" wrap="nowrap">
      {SIDES.map((side, i) => {
        const isActive = side.type === active;
        return (
          <Group key={side.type} gap="md" align="center" wrap="nowrap">
            {i > 0 && (
              <Text
                component="span"
                aria-hidden="true"
                fz={FONT_SIZE}
                lh={1}
                ta="center"
                style={{
                  // A fixed square slot. The rotation alone cannot move anything
                  // — transforms do not affect layout — but pinning the box
                  // keeps both words an equal distance from the spark whatever
                  // glyph or size it is given later.
                  display: 'inline-block',
                  width: '1em',
                  color: activeColor,
                  transform: `rotate(${active === 'CUT' ? 45 : 0}deg)`,
                  transition: ms ? `transform ${ms}ms ease, color ${ms}ms ease` : undefined,
                }}
              >
                ✦
              </Text>
            )}
            {/* Two layers in one grid cell: an invisible bold copy holds the
                width, and the visible word sits on top of it. Without it the
                words reflow every time the active side changes, because bold
                and regular Almendra are not the same width — which reads as the
                words shuffling whenever the spark turns. */}
            <Box display="inline-grid">
              <Box
                component="span"
                aria-hidden="true"
                fw={700}
                style={{ gridArea: '1 / 1', visibility: 'hidden', ...WORD_TYPE }}
              >
                {side.type}
              </Box>
              <Box
                component={Link}
                to={`${deckHref}/${side.path}`}
                aria-current={isActive ? 'page' : undefined}
                className="mantine-focus-auto"
                fw={isActive ? 700 : 500}
                onMouseEnter={() => setHovered(side.type)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  gridArea: '1 / 1',
                  justifySelf: 'center',
                  textDecoration: 'none',
                  color: isActive
                    ? side.color
                    : hovered === side.type
                      ? 'var(--mantine-color-text)'
                      : 'var(--mantine-color-dimmed)',
                  transition: ms ? `color ${ms}ms ease` : undefined,
                  ...WORD_TYPE,
                }}
              >
                {side.type}
              </Box>
            </Box>
          </Group>
        );
      })}
    </Group>
  );
}
