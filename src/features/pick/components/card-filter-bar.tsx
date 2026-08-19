import { Box, CloseButton, Group, RangeSlider, Select, Text, TextInput } from '@mantine/core';
import { MAX_CMC, type CardFilters } from '../card-filter';

/** `8` reads as `8+`, since the top of the scale means "and up". */
function cmcLabel(value: number): string {
  return value === MAX_CMC ? `${MAX_CMC}+` : String(value);
}

const CMC_MARKS = Array.from({ length: MAX_CMC + 1 }, (_, value) => ({
  value,
  label: cmcLabel(value),
}));

interface CardFilterBarProps {
  filters: CardFilters;
  /** The types present on this board — see cardTypeOptions. */
  typeOptions: string[];
  onChange: (next: CardFilters) => void;
}

/**
 * The controls that narrow the card list, between the CUT/ADD switcher and the
 * table.
 *
 * Presentational: it holds no state of its own and reports whole `CardFilters`
 * objects upward, so the board stays the single owner of what is being shown
 * and can reset the page in the same handler that applies the filter.
 *
 * Ordered Cost → Type → Name, matching the table's own columns left to right.
 * The filter for a column sits over the column it acts on, so the eye travels
 * the same path in both rows rather than learning two orders for one screen.
 * (Picks has no filter, so the bar starts one column in.)
 */
export function CardFilterBar({ filters, typeOptions, onChange }: CardFilterBarProps) {
  return (
    <Group gap="sm" mb="md">
      {/* Labelled rather than left to its handles: a bare two-handled slider
          says nothing about what it ranges over, and "Cost" is the word the
          table's own column uses. `mb` clears the mark labels, which Mantine
          renders below the track and outside the element's own box. */}
      <Box w={260} mb="lg">
        <Text component="label" id="cmc-range-label" size="sm" display="block">
          Cost
        </Text>
        <RangeSlider
          aria-labelledby="cmc-range-label"
          min={0}
          max={MAX_CMC}
          step={1}
          marks={CMC_MARKS}
          label={cmcLabel}
          value={filters.cmc}
          onChange={(cmc) => onChange({ ...filters, cmc })}
          // Mantine keeps the handles 10 apart by default, which on a 0–8 scale
          // means they can never move. 0 lets them meet, so the reader can pin
          // the range to a single cost.
          minRange={0}
        />
      </Box>
      <Select
        aria-label="Filter by card type"
        placeholder="All types"
        data={typeOptions}
        value={filters.type}
        onChange={(type) => onChange({ ...filters, type })}
        // Clearing is how the reader gets back to the full list; without it the
        // only way out of a type is to pick a different one.
        clearable
        w={180}
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
        w={220}
      />
    </Group>
  );
}
