import { describe, expect, it } from 'vitest';
import { decodeJwt, isExpired, userFromClaims } from '../jwt';
import type { JwtClaims } from '../types';

// A JWT we control: header.payload.signature where payload is a known claim set.
function makeToken(claims: JwtClaims): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(claims));
  return `${header}.${payload}.signature`;
}

const baseClaims: JwtClaims = {
  sub: 'user-1',
  email: 'jane@example.com',
  name: 'Jane Doe',
  roles: ['ROLE_USER'],
  verified: true,
  iss: 'fellowpick-api',
  iat: 0,
  exp: Math.floor(Date.now() / 1000) + 3600
};

describe('decodeJwt', () => {
  it('returns null for malformed tokens', () => {
    expect(decodeJwt('not-a-jwt')).toBeNull();
  });

  it('decodes a well-formed token', () => {
    const token = makeToken(baseClaims);
    const decoded = decodeJwt(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.email).toBe('jane@example.com');
    expect(decoded?.roles).toEqual(['ROLE_USER']);
  });
});

describe('isExpired', () => {
  it('reports a future token as not expired', () => {
    expect(isExpired(baseClaims)).toBe(false);
  });

  it('reports a past token as expired', () => {
    expect(isExpired({ ...baseClaims, exp: 1 })).toBe(true);
  });
});

describe('userFromClaims', () => {
  it('maps JWT claims to an AuthUser', () => {
    const user = userFromClaims(baseClaims);
    expect(user).toEqual({
      id: 'user-1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      roles: ['ROLE_USER'],
      verified: true
    });
  });

  it('reflects an unverified user', () => {
    const user = userFromClaims({ ...baseClaims, verified: false });
    expect(user.verified).toBe(false);
  });

  it('falls back to false when the verified claim is missing (legacy tokens)', () => {
    const { verified: _verified, ...claimsWithoutVerified } = baseClaims;
    const user = userFromClaims(claimsWithoutVerified as JwtClaims);
    expect(user.verified).toBe(false);
  });
});