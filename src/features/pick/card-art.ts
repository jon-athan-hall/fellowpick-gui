/**
 * A Magic card's corner radius, as a fraction of the card's own size.
 *
 * Scryfall serves its card images as JPEG, which has no alpha channel — so the
 * rounded corners of the card arrive as four white wedges against whatever is
 * behind them. Clipping the image to the card's real geometry is what removes
 * them.
 *
 * It has to be a percentage rather than a pixel value: the same artwork is
 * shown at two sizes (the pointer-following desktop preview and the full-width
 * mobile sheet), and a fixed radius would be the wrong arc at all but one of
 * them. A card is 63 × 88 mm with a 3 mm corner, which is where these come
 * from — 3/63 and 3/88.
 */
export const CARD_CORNER_RADIUS = '4.75% / 3.5%';
