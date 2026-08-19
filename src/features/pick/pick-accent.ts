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

/**
 * The vote's *filled* surface, and the text that sits on top of it.
 *
 * Shade 6 in both ramps is the documented fill tone, and these are the two
 * pairings `autoContrast` would choose itself: white on crimson (4.8:1) and
 * black on gold (11.3:1). A component that hands Mantine a `color` prop gets
 * that for free — the vote unit paints its own ground in CSS, so it has to be
 * told.
 */
export const PICK_ACCENT_FILL: Record<PickType, string> = {
  CUT: 'var(--mantine-color-red-6)',
  ADD: 'var(--mantine-color-gold-6)',
};

export const PICK_ACCENT_ON_FILL: Record<PickType, string> = {
  CUT: 'var(--mantine-color-white)',
  ADD: 'var(--mantine-color-black)',
};
