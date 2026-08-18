import { Box, Stack } from '@mantine/core';
import { Link } from 'react-router-dom';
import { ColorPips } from '../common/components/color-pips';
import { SetIcon } from '../common/components/set-icon';
import { cx } from '../common/utils/cx';
import universes from '../data/universes.json';
import classes from './universe-drawer-nav.module.css';

interface UniverseDrawerNavProps {
  universeId?: string;
  preconId?: string;
  /** Closes the drawer after a destination is chosen. */
  onNavigate: () => void;
}

/**
 * The mobile navigation: every universe with its decks nested beneath, behind
 * the burger. Deliberately a different component from the desktop bar rather
 * than the same one restyled — a phone row cannot hold four universe names, and
 * the drawer has the vertical space to show every deck at once instead of only
 * the active universe's.
 *
 * More of this component is CSS than the desktop bar, because more of it has
 * to be: the rail down the deck list and the ✦ active marker are both
 * pseudo-elements, and the rows need `:hover` and `:focus-visible`.
 */
export function UniverseDrawerNav({ universeId, preconId, onNavigate }: UniverseDrawerNavProps) {
  return (
    <Stack component="nav" gap="md" aria-label="Universes">
      {universes.map((u) => {
        // The universe row only highlights on the universe's own page; on a
        // deck page the deck owns the active state and the universe stays
        // neutral, so exactly one row in the drawer is ever lit.
        const universeActive = u.id === universeId && !preconId;
        return (
          <Stack key={u.id} gap={2}>
            <Link
              to={`/universes/${u.id}`}
              className={cx(classes.row, universeActive && classes.universeActive)}
              aria-current={universeActive ? 'page' : undefined}
              onClick={onNavigate}
            >
              <SetIcon code={u.sets[0]} />
              <Box component="span" flex={1} miw={0} ta="left" fw={600} className={classes.label}>
                {u.name}
              </Box>
            </Link>
            <div className={classes.decks}>
              {u.precons.map((p) => {
                const preconActive = p.id === preconId;
                return (
                  <Link
                    key={p.id}
                    to={`/universes/${u.id}/precons/${p.id}`}
                    className={cx(classes.row, classes.deck, preconActive && classes.deckActive)}
                    aria-current={preconActive ? 'page' : undefined}
                    onClick={onNavigate}
                  >
                    {/* Empty slot, not a symbol: it holds the labels in the
                        same column as the universe rows and gives the ✦ a
                        fixed place to appear. */}
                    <SetIcon />
                    <Box component="span" flex={1} miw={0} ta="left" className={classes.label}>
                      {p.name}
                    </Box>
                    {/* Trailing rather than leading: the ✦ marker owns the
                        column at the start of the row. */}
                    <ColorPips colors={p.colorIdentity} size="0.9rem" />
                  </Link>
                );
              })}
            </div>
          </Stack>
        );
      })}
    </Stack>
  );
}
