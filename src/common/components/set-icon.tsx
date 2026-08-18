interface SetIconProps {
  /** Scryfall set code. Omit to render an identically-shaped *empty* slot. */
  code?: string;
  /** Size of the glyph itself. */
  size?: string;
  /** Size of the square slot the glyph is centred in. */
  box?: string;
}

/**
 * Renders a Scryfall set icon recolorable to match the surrounding text via
 * CSS masking — `background: currentColor` through a mask means the symbol
 * inherits whatever colour its row is using, including hover and active
 * transitions, with no second asset.
 *
 * Passing no `code` renders the slot but no ink. Callers rely on that: the
 * mobile drawer's deck rows keep an empty slot so their labels stay in the
 * same column as the universe labels above them, and the ✦ active marker has
 * a fixed column to sit in.
 */
export function SetIcon({ code, size = '1.25rem', box = '1.5rem' }: SetIconProps) {
  const url = code ? `url(https://svgs.scryfall.io/sets/${code.toLowerCase()}.svg)` : 'none';
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: box,
        height: box,
        flexShrink: 0
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: size,
          height: size,
          backgroundColor: code ? 'currentColor' : 'transparent',
          maskImage: url,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: url,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center'
        }}
      />
    </span>
  );
}
