/**
 * Mirrors the trailhead-api auth DTOs.
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  /** JWT access token, ~15 min expiry. */
  accessToken: string;
  /** Null when the backend is in `cookie` refresh-token mode. */
  refreshToken: string | null;
  /** Access token lifetime in milliseconds. */
  expiresIn: number;
}

export interface MessageResponse {
  message: string;
}

/** Decoded JWT claims set by the backend. */
export interface JwtClaims {
  sub: string;
  email: string;
  name: string;
  roles: string[];
  verified: boolean;
  iss: string;
  iat: number;
  exp: number;
}

/** The user shape we expose to React, derived from JwtClaims. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  verified: boolean;
}
