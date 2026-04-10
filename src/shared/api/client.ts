import { API_BASE_URL } from './config';
import { ApiError, type ApiErrorBody } from './errors';
import { tokenStore } from './token-store';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Skip the Authorization header (for /api/auth/* endpoints). */
  skipAuth?: boolean;
  /** Skip the 401 → refresh → retry handshake (used by the refresh call itself). */
  skipRefresh?: boolean;
}

/**
 * Hook injected by the auth feature so the client can call the refresh
 * endpoint without importing it directly (avoids a cycle). The auth module
 * registers this once at startup.
 */
let refreshHandler: (() => Promise<boolean>) | null = null;

export function registerRefreshHandler(fn: () => Promise<boolean>) {
  refreshHandler = fn;
}

async function parseErrorBody(res: Response): Promise<ApiErrorBody | null> {
  try {
    return (await res.json()) as ApiErrorBody;
  } catch {
    return null;
  }
}

async function doFetch(path: string, options: RequestOptions): Promise<Response> {
  const { body, skipAuth, headers, ...rest } = options;
  const finalHeaders = new Headers(headers);

  if (body !== undefined && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = tokenStore.getAccessToken();
    if (token) finalHeaders.set('Authorization', `Bearer ${token}`);
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let res = await doFetch(path, options);

  // Try to refresh once on 401 (unless we were told not to, e.g. the refresh
  // call itself, or an unauthenticated endpoint).
  if (res.status === 401 && !options.skipAuth && !options.skipRefresh && refreshHandler) {
    const refreshed = await refreshHandler();
    if (refreshed) {
      res = await doFetch(path, options);
    }
  }

  if (!res.ok) {
    const errorBody = await parseErrorBody(res);
    throw new ApiError(
      res.status,
      errorBody?.message ?? res.statusText ?? 'Request failed',
      errorBody
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}
