import { REFRESH_TOKEN_STORAGE_KEY } from './config';

/**
 * Access token lives in memory only — it's short-lived (15 min) and we
 * re-fetch it via the refresh endpoint on reload. Never persisted.
 */
let accessToken: string | null = null;
const listeners = new Set<(token: string | null) => void>();

export const tokenStore = {
  getAccessToken(): string | null {
    return accessToken;
  },

  setAccessToken(token: string | null): void {
    accessToken = token;
    listeners.forEach((fn) => fn(token));
  },

  subscribe(fn: (token: string | null) => void): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  },

  setRefreshToken(token: string | null): void {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    }
  },

  clear(): void {
    this.setAccessToken(null);
    this.setRefreshToken(null);
  }
};