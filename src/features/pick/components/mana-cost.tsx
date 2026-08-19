import { Group, Image } from '@mantine/core';

const SCRYFALL_SVG_BASE = 'https://svgs.scryfall.io/card-symbols';

// Maps mana symbol codes to their Scryfall SVG filenames.
function symbolToUrl(symbol: string): string {
  // Scryfall uses uppercase filenames, with "/" replaced by empty string for split costs.
  const normalized = symbol.toUpperCase().replace('/', '');
  return `${SCRYFALL_SVG_BASE}/${normalized}.svg`;
}

// Parses a mana cost string like "{2}{W}{U}" into individual symbols.
function parseManaCost(manaCost: string): string[] {
  const matches = manaCost.match(/\{([^}]+)\}/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(1, -1));
}

// Renders a mana cost string as inline Scryfall mana symbol SVGs.
//
// `wrap` exists for callers whose column has a fixed width: a seven-pip cost is
// wider than any sensible Cost column, and a second line is better than pips
// spilling into the neighbouring column. It stays `nowrap` by default, since a
// cost broken across lines is the worse reading anywhere it isn't forced.
export function ManaCost({
  cost,
  size = 14,
  wrap = 'nowrap',
}: {
  cost: string;
  size?: number;
  wrap?: 'wrap' | 'nowrap';
}) {
  const symbols = parseManaCost(cost);

  return (
    <Group gap={1} wrap={wrap} style={{ display: 'inline-flex' }}>
      {symbols.map((symbol, i) => (
        <Image
          key={i}
          src={symbolToUrl(symbol)}
          alt={`{${symbol}}`}
          w={size}
          h={size}
          style={{ flexShrink: 0 }}
        />
      ))}
    </Group>
  );
}
