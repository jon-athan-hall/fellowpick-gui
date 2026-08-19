import { Box, CloseButton, Group, RangeSlider, Select, Text, TextInput } from '@mantine/core';
import type { CSSProperties } from 'react';
import { MAX_CMC, type CardFilters } from '../card-filter';
import { PICK_ACCENT_FILL, PICK_ACCENT_NAME } from '../pick-accent';
import type { PickType } from '../types';
import { TABLE_CONTENT_INSET } from './card-table';

/** `8` reads as `8+`, since the top of the scale means "and up". */
function cmcLabel(value: number): string {
  return value === MAX_CMC ? `${MAX_CMC}+` : String(value);
}

const CMC_MARKS = Array.from({ length: MAX_CMC + 1 }, (_, value) => ({
  value,
  label: cmcLabel(value),
}));

/**
 * The CMC control's panel — ours, drawn around the slider rather than on it.
 *
 * The gutter is shared: it sets the panel's own side padding *and* how far in
 * the legend sits, so the label lines up with the track's left edge. Two
 * numbers that have to agree, expressed once.
 */
const CMC_PANEL = { width: 340, gutter: 20, padTop: 16, padBottom: 32 };

/**
 * The type filter's "no filter" choice, and the only thing that names the
 * control — there is no separate label.
 *
 * It is a real option rather than a placeholder, which settles two things at
 * once. It renders in the ordinary option colour, so the resting state matches
 * the list instead of sitting in placeholder grey; and picking it *is* how the
 * filter is cleared, so the control needs no clear button beside its chevron.
 * `null` remains the value the filter itself speaks, so nothing downstream has
 * to know about this string.
 */
const ALL_TYPES = 'All types';

/**
 * The type field's dimensions, which the search field beside it is measured
 * against — same height, twice the width. Expressed once so the pair cannot
 * drift apart.
 */
const TYPE_FIELD = { width: 180, size: 'lg' } as const;

interface CardFilterBarProps {
  filters: CardFilters;
  /** The types present on this board — see cardTypeOptions. */
  typeOptions: string[];
  pickType: PickType;
  onChange: (next: CardFilters) => void;
}

/**
 * The mana-value range, as a two-handled slider inside a labelled panel.
 *
 * The slider is Mantine's, driven only by documented props — no `styles`
 * override, and `size`/`thumbSize` left alone. That is a correctness
 * requirement rather than restraint: the slider root carries
 * `padding-inline: var(--slider-size)`, and its mark labels are centred by
 * `translate(calc(-50% + var(--slider-size) / 2))`. At the default size that
 * correction is about half a digit wide and cancels; scale the track up and
 * every numeral drifts off its dot, worsening toward both ends. Anything this
 * component wants to say, it says from the outside.
 */
function CmcRange({
  value,
  pickType,
  onChange,
}: {
  value: [number, number];
  pickType: PickType;
  onChange: (next: [number, number]) => void;
}) {
  return (
    <Box w={CMC_PANEL.width}>
      <Box
        pos="relative"
        pl={CMC_PANEL.gutter}
        pr={CMC_PANEL.gutter}
        pt={CMC_PANEL.padTop}
        pb={CMC_PANEL.padBottom}
        style={{
          border: '1px solid var(--mantine-color-default-border)',
          borderRadius: 'var(--mantine-radius-md)',
        }}
      >
        {/* Sat on the border rather than above it, so the control reads as one
            object. The background is what breaks the line behind the word, and
            it has to match the Paper this bar lives in. */}
        <Text
          component="span"
          size="xs"
          fw={700}
          tt="uppercase"
          lts="0.14em"
          c="dimmed"
          pos="absolute"
          top={-8}
          left={CMC_PANEL.gutter}
          px={6}
          bg="var(--mantine-color-dark-6)"
        >
          CMC
        </Text>
        <RangeSlider
          min={0}
          max={MAX_CMC}
          step={1}
          // Mantine keeps the handles 10 apart by default, which on a 0–8 scale
          // means they can never move. 0 lets them meet, so the reader can pin
          // the range to a single cost.
          minRange={0}
          value={value}
          onChange={onChange}
          marks={CMC_MARKS}
          // The numerals under the bar already say where the handles are; a
          // bubble floating over them says it twice.
          label={null}
          // Crimson under CUT, gold under ADD — the same accent the switcher,
          // the column headings and the pagination already carry.
          color={PICK_ACCENT_NAME[pickType]}
          thumbFromLabel="Minimum mana value"
          thumbToLabel="Maximum mana value"
        />
      </Box>
    </Box>
  );
}

/**
 * The card type filter. Bare — no panel and no label of its own, since
 * `ALL_TYPES` names it, and the bar centres it against the taller CMC panel.
 */
function TypeFilter({
  value,
  options,
  style,
  onChange,
}: {
  value: string | null;
  options: string[];
  style?: CSSProperties;
  onChange: (next: string | null) => void;
}) {
  return (
    <Select
      aria-label="Filter by card type"
      style={style}
      data={[ALL_TYPES, ...options]}
      value={value ?? ALL_TYPES}
      onChange={(next) => onChange(next === ALL_TYPES ? null : next)}
      // There is always a selection — ALL_TYPES is one — so clearing the field
      // to nothing would only produce a state the filter cannot express.
      allowDeselect={false}
      size={TYPE_FIELD.size}
      w={TYPE_FIELD.width}
    />
  );
}

/**
 * The controls that narrow the card list, between the CUT/ADD switcher and the
 * table.
 *
 * Presentational: it holds no state of its own and reports whole `CardFilters`
 * objects upward, so the board stays the single owner of what is being shown
 * and can reset the page in the same handler that applies the filter.
 *
 * Ordered CMC → Type → Name, matching the table's own columns left to right.
 * The filter for a column sits over the column it acts on, so the eye travels
 * the same path in both rows rather than learning two orders for one screen.
 * (Picks has no filter, so the bar starts one column in.)
 *
 * Centred rather than top-aligned: the CMC panel is roughly twice the height of
 * the two fields beside it, and hanging them from its top edge leaves them
 * looking dropped rather than placed.
 *
 * Inset to `TABLE_CONTENT_INSET` so the CMC panel's left edge lands on the same
 * vertical line as the Picks heading below it. Both are children of the same
 * Paper, but the table carries two insets of its own that the bar does not, so
 * matching them takes an explicit padding rather than none.
 */
export function CardFilterBar({ filters, typeOptions, pickType, onChange }: CardFilterBarProps) {
  // Mantine paints a focused input's border with `--input-bd-focus`, which
  // defaults to the app primary. Pointing it at the vote's fill tone puts the
  // two fields in the same voice as the slider bar beside them, which already
  // takes shade 6 of the same ramp. Cast because a CSS custom property is not
  // in React's CSSProperties.
  const accentFocus = {
    '--input-bd-focus': PICK_ACCENT_FILL[pickType],
  } as CSSProperties;

  return (
    <Group gap="xl" align="center" px={TABLE_CONTENT_INSET} py="md">
      <CmcRange
        value={filters.cmc}
        pickType={pickType}
        onChange={(cmc) => onChange({ ...filters, cmc })}
      />
      <TypeFilter
        value={filters.type}
        options={typeOptions}
        style={accentFocus}
        onChange={(type) => onChange({ ...filters, type })}
      />
      <TextInput
        aria-label="Search by card name"
        placeholder="Search cards"
        value={filters.search}
        onChange={(event) => onChange({ ...filters, search: event.currentTarget.value })}
        // TextInput has no `clearable` of its own; a CloseButton in the right
        // section is Mantine's own pattern for it. Rendered only when there is
        // something to clear, so the field isn't permanently carrying a control
        // that would do nothing.
        rightSection={
          filters.search !== '' ? (
            <CloseButton
              aria-label="Clear search"
              onClick={() => onChange({ ...filters, search: '' })}
            />
          ) : null
        }
        // Same height as the type field beside it, and twice its width: a name
        // is the longest thing anyone types into this bar, and it is the only
        // field whose content has no fixed vocabulary.
        size={TYPE_FIELD.size}
        w={TYPE_FIELD.width * 2}
        style={accentFocus}
      />
    </Group>
  );
}
