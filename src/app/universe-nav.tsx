import { Box, Group, Menu } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { ColorPips } from '../common/components/color-pips';
import { SetIcon } from '../common/components/set-icon';
import { cx } from '../common/utils/cx';
import universes from '../data/universes.json';
import classes from './universe-nav.module.css';

/**
 * The bar insets by the header's `lg` gutter minus the tab's own left padding,
 * so the first set symbol lands on the same vertical edge as the wizard in the
 * header above it. An optical alignment value rather than a design token, which
 * is why it is spelled out instead of using a scale step.
 */
const TIER_INSET = 'calc(var(--mantine-spacing-lg) - 0.875rem)';

interface UniverseNavProps {
  universeId?: string;
  preconId?: string;
}

/**
 * The desktop navigation: one row of universes, each opening a dropdown of its
 * decks with their colour identity.
 *
 * The tab is a button rather than a link because it owns the dropdown, which
 * lists decks and only decks. The universe's own overview page is reached from
 * the mobile drawer and the universes index instead — a desktop tab that both
 * navigated and opened a menu would fire one of the two by accident.
 * `click-hover` gives pointer users the speed of hover while keeping the menu
 * reachable by click, touch and keyboard, which a hover-only trigger would not.
 *
 * Only the tab and the active deck item carry a CSS class, because only they
 * need states or a `color-mix` gradient that no prop can express. Everything
 * else is Mantine props and Menu's own theming.
 */
export function UniverseNav({ universeId, preconId }: UniverseNavProps) {
  return (
    // Full-bleed: flush against the header above and both window edges, reading
    // as a continuation of the header chrome rather than a card floating on the
    // page. The negative margins cancel the `AppShell.Main` gutter, so they
    // must stay in step with the shell's `padding="md"`.
    //
    // `top` is the header offset, not 0: the AppShell header is fixed, so a bar
    // stuck to the viewport top would slide under it and disappear. z-index
    // stays below the header's own.
    <Box
      visibleFrom="sm"
      pos="sticky"
      top="var(--app-shell-header-offset)"
      mx="-md"
      mt="-md"
      mb="md"
      style={{ zIndex: 2 }}
    >
      {/* Same dark.6 as the header, so the two read as one block of chrome
          split by the header's own 4px rule, with no radius of its own. */}
      <Box component="nav" bg="dark.6" aria-label="Universes">
        <Group gap={2} wrap="nowrap" px={TIER_INSET} style={{ overflowX: 'auto' }}>
          {universes.map((u) => {
            const isActive = u.id === universeId;
            return (
              <Menu
                key={u.id}
                trigger="click-hover"
                position="bottom-start"
                offset={0}
                width={280}
                withinPortal
                closeOnItemClick
              >
                <Menu.Target>
                  <button
                    type="button"
                    className={cx(classes.tab, isActive && classes.tabActive)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {/* `sets` is ordered by printing preference — commander
                        decks first — so index 0 is the Commander set, whose
                        symbol is the one that belongs beside a universe. */}
                    <SetIcon code={u.sets[0]} size="1.15rem" box="1.3rem" />
                    <span>{u.name}</span>
                    <IconChevronDown size="1rem" stroke={1.5} aria-hidden="true" />
                  </button>
                </Menu.Target>

                <Menu.Dropdown>
                  {u.precons.map((p) => {
                    const isDeckActive = p.id === preconId;
                    return (
                      <Menu.Item
                        key={p.id}
                        component={Link}
                        to={`/universes/${u.id}/precons/${p.id}`}
                        className={cx(isDeckActive && classes.deckActive)}
                        aria-current={isDeckActive ? 'page' : undefined}
                        leftSection={<ColorPips colors={p.colorIdentity} />}
                      >
                        {p.name}
                      </Menu.Item>
                    );
                  })}
                </Menu.Dropdown>
              </Menu>
            );
          })}
        </Group>
      </Box>
    </Box>
  );
}
