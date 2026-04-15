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
export function ManaCost({ cost, size = 14 }: { cost: string; size?: number }) {
  const symbols = parseManaCost(cost);

  return (
    <Group gap={1} wrap="nowrap" style={{ display: 'inline-flex' }}>
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
