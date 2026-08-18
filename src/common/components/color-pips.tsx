const COLOR_NAMES: Record<string, string> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green'
};

interface ColorPipsProps {
  /** WUBRG-ordered colour identity, e.g. `['W', 'U', 'R']`. */
  colors: string[];
  /** Diameter of each pip. */
  size?: string;
}

/**
 * A deck's colour identity as Scryfall's mana symbols.
 *
 * Deliberately the only place in the app that paints outside the silver /
 * sapphire / gold / crimson palette: these five symbols are recognised by
 * their canonical colours, and a green pip rendered in gold stops being
 * information. The group carries the accessible name so the identity is not
 * decoration a screen reader drops — the individual images are hidden.
 */
export function ColorPips({ colors, size = '1rem' }: ColorPipsProps) {
  if (colors.length === 0) return null;
  const label = colors.map((c) => COLOR_NAMES[c] ?? c).join(', ');
  return (
    <span
      role="img"
      aria-label={`Colour identity: ${label}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}
    >
      {colors.map((c) => (
        <img
          key={c}
          src={`https://svgs.scryfall.io/card-symbols/${c}.svg`}
          alt=""
          aria-hidden="true"
          style={{ width: size, height: size, display: 'block', borderRadius: '50%' }}
        />
      ))}
    </span>
  );
}
