import type { AuthUser, JwtClaims } from './types';

/**
 * Decode a JWT payload without verifying its signature. Verification happens
 * server-side; the frontend only needs the claims for UI gating (roles, name).
 * Returns null if the token is malformed.
 */
export function decodeJwt(token: string): JwtClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const payload = parts[1];
    // Convert base64url → base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

// Checks whether a JWT's expiration time has passed, with an optional clock-skew buffer.
export function isExpired(claims: JwtClaims, skewSeconds = 30): boolean {
  const now = Math.floor(Date.now() / 1000);
  return claims.exp <= now + skewSeconds;
}

// Extracts an AuthUser object from decoded JWT claims.
export function userFromClaims(claims: JwtClaims): AuthUser {
  return {
    id: claims.sub,
    name: claims.name,
    email: claims.email,
    roles: claims.roles ?? [],
    // Defensive ?? false for the brief deployment window where the backend
    // may have already issued tokens without this claim. Once all tokens
    // pre-dating the backend change have expired, the fallback is dead code
    // but harmless.
    verified: claims.verified ?? false
  };
}
