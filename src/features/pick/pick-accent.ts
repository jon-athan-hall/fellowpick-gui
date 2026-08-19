import type { PickType } from './types';

/**
 * The two votes' accent tones, in one place so the switcher, the table headings
 * and the vote badges cannot drift apart.
 *
 * CUT takes red.5 rather than red.4 or red.6: the lighter step reads salmon
 * beside gold, and the darker one is the destructive *fill* tone, too heavy for
 * text and icons. ADD takes gold.4, the ramp's documented text tone.
 */
export const PICK_ACCENT: Record<PickType, string> = {
  CUT: 'var(--mantine-color-red-5)',
  ADD: 'var(--mantine-color-gold-4)',
};

/**
 * The same two accents as Mantine colour *names*, for props that resolve their
 * own shade — `Badge`, `Switch`, `Pagination` — rather than taking a raw value.
 */
export const PICK_ACCENT_NAME: Record<PickType, string> = {
  CUT: 'red',
  ADD: 'gold',
};
