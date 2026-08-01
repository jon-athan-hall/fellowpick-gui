import { createTheme, type MantineColorsTuple } from '@mantine/core';

/**
 * Palette drawn from the wizard favicon: the blue of the cloak, the silver of
 * the wand, and a gold spark for the accent.
 *
 * Two of these deliberately override Mantine's own colours rather than adding
 * new names, because the dark-scheme CSS resolver derives the entire surface
 * system from the `dark` tuple:
 *
 *   --mantine-color-body            dark.7    page background
 *   --mantine-color-default         dark.6    Paper, Card, Menu, Modal, Input
 *   --mantine-color-default-hover   dark.5
 *   --mantine-color-default-border  dark.4
 *   --mantine-color-text            dark.0
 *   --mantine-color-dimmed          dark.2
 *
 * So replacing `dark` re-skins Mantine, mantine-react-table and every existing
 * `var(--mantine-color-dark-*)` in the CSS modules at once, with no call-site
 * edits. Replacing `red` likewise recolours the existing destructive/CUT sites,
 * which lets them keep saying `color="red"` — the name still means what it says.
 */

// The wand: a cool blue-grey neutral, standing in for Mantine's `dark`. Every
// surface and every piece of body text comes from this ramp.
const silver: MantineColorsTuple = [
  '#dfe4ee', // 0 — body text
  '#c5ccdb',
  '#9aa4bb', // 2 — dimmed text
  '#6c7794', // 3 — placeholders and borders only, never content (3.9:1)
  '#3a445c', // 4 — default border
  '#1c2333', // 5 — hover / raised
  '#141926', // 6 — panels
  '#0d1018', // 7 — page background
  '#080b12',
  '#04060a',
];

// The cloak: primary identity — links, active navigation, focus rings.
const sapphire: MantineColorsTuple = [
  '#eef2ff',
  '#dae2fd',
  '#b3c3f9',
  '#8aa1f3',
  '#6a86ee', // 4 — links and active nav on dark (5.2:1 on panels)
  '#4a6be7',
  '#2a54e0', // 6 — filled buttons (white on this is 6.1:1)
  '#2145bd',
  '#1a3798',
  '#142a74',
];

// The spark: warm accent, and the ADD vote.
const gold: MantineColorsTuple = [
  '#fff9e8',
  '#fdefc6',
  '#fadf94',
  '#f7cf63',
  '#f5c445', // 4 — gold text on dark (10.8:1 on panels)
  '#f2ba33',
  '#f0b429', // 6 — filled (autoContrast puts black on it, 11.3:1)
  '#cf9718',
  '#a87811',
  '#7f5a0c',
];

// Destructive actions and the CUT vote, standing in for Mantine's `red`.
// Note index 5 is the accent tone and 6 is the fill: white on #e5484d is only
// 3.9:1 and fails AA, while #d13a40 reaches 4.8:1.
const crimson: MantineColorsTuple = [
  '#ffeced',
  '#ffd7d9',
  '#f9adb0',
  '#f38086',
  '#ee5f66', // 4 — red text on dark (5.4:1 on panels)
  '#e5484d', // 5 — borders, tab edges, accents
  '#d13a40', // 6 — filled
  '#b02f34',
  '#8c2528',
  '#671b1e',
];

export const theme = createTheme({
  primaryColor: 'sapphire',
  // Required, not cosmetic: the dark-scheme default is shade 8, which turns
  // gold into a mud brown wherever a filled variant is used.
  primaryShade: { light: 6, dark: 6 },
  autoContrast: true,
  luminanceThreshold: 0.3,
  defaultRadius: 'md',
  colors: {
    dark: silver,
    sapphire,
    gold,
    red: crimson,

    // Temporary aliases so the existing `color="rust"` / `color="secondary"`
    // call sites keep working. Both are swept and deleted in step 3.4, when
    // precon-detail-page is rewritten anyway.
    rust: sapphire,
    secondary: gold,
  },
  headings: {
    fontFamily: 'MedievalSharp, cursive'
  },
  components: {
    Title: {
      // `c: 'rust'` used to sit here, colouring every heading in the accent —
      // the main reason headings were hard to read. Titles now inherit
      // --mantine-color-text (14.9:1 on the page background) and accent colour
      // becomes a deliberate per-instance choice.
      styles: {
        root: { letterSpacing: '0.05em' }
      }
    },
    // Standard panel: lighter dark.6 background, md padding, md radius. Pages
    // wrap sections in a bare <Paper> to get the card look. Override per-use
    // with style/props as needed (e.g. a colored borderTop on CUT/ADD panels).
    Paper: {
      defaultProps: {
        bg: 'dark.6',
        p: 'md',
        radius: 'md'
      }
    },
    // Standard list card (universes, precons). Card does not inherit Paper's
    // defaultProps, so it needs its own background or it sits flush with the
    // page instead of reading as raised.
    Card: {
      defaultProps: {
        bg: 'dark.6',
        shadow: 'md',
        padding: 'md',
        radius: 'md',
        withBorder: true
      }
    }
  }
});
