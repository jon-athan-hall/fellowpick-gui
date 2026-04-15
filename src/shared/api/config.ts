export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

/**
 * The backend supports two refresh-token delivery modes:
 *   - `cookie` (prod): HTTP-only cookie, JS cannot read it. We just send
 *     `credentials: 'include'` and the browser handles it.
 *   - `body` (dev): refresh token comes back in the JSON response and we
 *     stash it in localStorage. Dev-only — prod should use cookie mode.
 *
 * The auth client below handles both modes transparently: it always sends
 * `credentials: 'include'`, and only persists a refresh token when one is
 * actually returned in the response body.
 */
export const REFRESH_TOKEN_STORAGE_KEY = 'fellowpick.refreshToken';
