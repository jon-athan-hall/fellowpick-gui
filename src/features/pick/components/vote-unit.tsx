import { UnstyledButton, VisuallyHidden } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { cx } from '../../../common/utils/cx';
import { PICK_ACCENT, PICK_ACCENT_FILL, PICK_ACCENT_ON_FILL } from '../pick-accent';
import type { PickType } from '../types';
import classes from './vote-unit.module.css';

interface VoteUnitProps {
  /** The community's tally for this card on this side of the vote. */
  count: number;
  /** Whether this user's vote is one of them. */
  voted: boolean;
  /** Drops the vote half. A count nobody here can change is a readout. */
  canVote: boolean;
  pickType: PickType;
  /** `lg` fills its container, for the mobile preview sheet. */
  size?: 'sm' | 'lg';
  /**
   * Makes the unit the button. Omitted in the card table, where the row is the
   * button and the unit only shows what pressing it does — passing a handler
   * there would put a second click target inside the first.
   */
  onClick?: () => void;
}

/**
 * The community count and the user's own vote, joined into one control.
 *
 * They were a badge and a switch sitting side by side, which read as two
 * unrelated things — one a readout, one a control operated by proxy. Joined
 * into a single shell they read as what they are: a button carrying its own
 * tally.
 *
 * The vote half is dropped entirely when a vote isn't possible — a signed-out
 * visitor sees the count in its shell and nothing to press.
 */
export function VoteUnit({
  count,
  voted,
  canVote,
  pickType,
  size = 'sm',
  onClick,
}: VoteUnitProps) {
  const className = cx(
    classes.unit,
    voted && classes.voted,
    size === 'lg' && classes.lg,
    onClick && classes.interactive
  );

  const style = {
    '--vote-accent': PICK_ACCENT[pickType],
    '--vote-fill': PICK_ACCENT_FILL[pickType],
    '--vote-on-fill': PICK_ACCENT_ON_FILL[pickType],
  } as React.CSSProperties;

  const body = (
    <>
      <span className={classes.count}>{count}</span>
      {canVote && (
        <>
          <span className={classes.seam} aria-hidden="true" />
          <span className={classes.check}>
            <IconCheck size="1em" stroke={3} aria-hidden="true" />
          </span>
        </>
      )}
    </>
  );

  if (onClick) {
    return (
      <UnstyledButton
        className={cx(className, 'mantine-focus-auto')}
        style={style}
        onClick={onClick}
        // The label names the side being voted on; `aria-pressed` carries
        // whether this user's vote is already in, so the state is announced
        // without a second sentence of explanation.
        aria-label={`${pickType} — ${count} ${count === 1 ? 'vote' : 'votes'}`}
        aria-pressed={voted}
      >
        {body}
      </UnstyledButton>
    );
  }

  return (
    <span className={className} style={style}>
      {body}
      {voted && <VisuallyHidden>Your vote</VisuallyHidden>}
    </span>
  );
}
