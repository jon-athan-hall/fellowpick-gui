import {
  createTheme,
  type CSSVariablesResolver,
  type MantineColorsTuple
} from '@mantine/core';

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
  fontFamily: 'Caudex, serif',
  headings: {
    fontFamily: 'Almendra, serif',
    fontWeight: '400',
    sizes: {
      // Mantine's 2.125rem h1 is louder than any page title here needs, and at
      // Almendra's proportions it crowds the header above it. 1.75rem is the
      // size the login form was designed at and it carries every page title.
      h1: { fontSize: '1.75rem', lineHeight: '1.3' }
    }
  },
  components: {
    // One lever for every input-based component. TextInput, PasswordInput,
    // Select and friends all resolve their props through `InputBase`, whose own
    // built-in default is `sm` — so this is the only place a global input size
    // can be set. Anything that wants to be smaller (table filters, toolbars)
    // still pins its own `size`.
    InputBase: {
      defaultProps: {
        size: 'md'
      }
    },
    // The one place the error tone splits in two. `--mantine-color-error`
    // (red.6) tints the input's border, which is a UI boundary and clears the
    // 3:1 floor at 3.7:1 — but the message underneath is small body text held to
    // 4.5:1, and red.6 does not reach it. red.4 is the ramp's text tone at
    // 5.4:1, so the border keeps the weight it was chosen for and the sentence
    // explaining the error stays readable.
    InputError: {
      styles: {
        error: { color: 'var(--mantine-color-red-4)' }
      }
    },
    Button: {
      defaultProps: {
        size: 'md'
      }
    },
    Title: {
      // `c: 'rust'` used to sit here, colouring every heading in the accent —
      // the main reason headings were hard to read. Titles now inherit
      // --mantine-color-text (14.9:1 on the page background) and accent colour
      // becomes a deliberate per-instance choice.
      styles: {
        root: { letterSpacing: '0.05em' }
      }
    },
    Paper: {
      defaultProps: {
        bg: 'dark.6',
        p: 'md',
        radius: 'md'
      }
    },
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

/**
 * `--mantine-color-error` is the one palette decision `createTheme` cannot
 * express — it is emitted by the CSS variables resolver, not by `colors`.
 *
 * Mantine's dark-scheme default is `red.8` (#8c2528), dark enough that an
 * errored input reads as a dimmed field rather than a rejected one. `red.6`
 * (#d13a40) is the same tone the filled destructive buttons already use, so a
 * failed field and a Delete button now speak with one voice. It drives the
 * input border, the placeholder and the required asterisk — the error message
 * itself is lifted to red.4 by the `InputError` styles above, which is the only
 * part of the field held to the 4.5:1 text floor.
 */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {},
  dark: {
    '--mantine-color-error': 'var(--mantine-color-red-6)'
  }
});
