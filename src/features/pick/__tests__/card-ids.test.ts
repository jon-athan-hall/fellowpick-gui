import { describe, expect, it } from 'vitest';
import type { Card, Precon } from '../types';

// Contract tests for the JSON that scripts/build-add-candidates.mjs emits.
//
// Card ids are the join key between this static data and the picks table in the
// API, which stores votes by cardId with no repair path. Nothing at runtime
// validates them, so a bad import — a changed id format, a name represented by
// a different printing, a card that should have been filtered out — would show
// up as silently missing votes rather than as an error. These tests run over the
// real committed data so a regenerated data set has to answer for itself.
//
// Loaded through the same import.meta.glob the runtime uses (see
// data/load-precon.ts), so a glob that stops matching fails here too.

const preconModules = import.meta.glob('../../../data/*/precons/*.json', { eager: true });
const addModules = import.meta.glob('../../../data/*/adds/*.json', { eager: true });

// setCode (3 chars) + collector number zero-padded to 4 — see makeCardId in
// scripts/import-mtgjson.mjs. A set code outside this shape is not a failure of
// the data so much as a signal that makeCardId needs revisiting.
const CARD_ID = /^[A-Z0-9]{3}\d{4}$/;

function unwrap<T>(mod: unknown): T {
  return (mod as { default?: T }).default ?? (mod as T);
}

// '../../../data/middle-earth/adds/elven-council.json' → 'middle-earth/elven-council'
function slug(path: string): string {
  const [, universe, , file] = path.split('/').slice(-4);
  return `${universe}/${file.replace('.json', '')}`;
}

const precons = Object.entries(preconModules).map(
  ([path, mod]) => [slug(path), unwrap<Precon>(mod)] as const
);
const adds = Object.entries(addModules).map(
  ([path, mod]) => [slug(path), unwrap<Card[]>(mod)] as const
);

const preconBySlug = new Map(precons);

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  return [...new Set(values.filter((v) => (seen.has(v) ? true : (seen.add(v), false))))];
}

describe('static card data', () => {
  it('finds precon and adds files to check', () => {
    expect(precons.length).toBeGreaterThan(0);
    expect(adds.length).toBe(precons.length);
  });

  describe.each(precons)('precon %s', (_slug, precon) => {
    it('gives every card a well-formed id', () => {
      const cards = [...Object.values(precon.mainBoard), ...precon.commanders];
      expect(cards.filter((c) => !CARD_ID.test(c.id)).map((c) => `${c.name} (${c.id})`)).toEqual([]);
    });

    it('keys mainBoard by each card\'s own id', () => {
      const mismatched = Object.entries(precon.mainBoard)
        .filter(([key, card]) => key !== card.id)
        .map(([key, card]) => `${key} → ${card.id}`);
      expect(mismatched).toEqual([]);
    });
  });

  describe.each(adds)('adds %s', (addSlug, candidates) => {
    const precon = preconBySlug.get(addSlug);

    it('has a matching precon', () => {
      expect(precon).toBeDefined();
    });

    it('gives every candidate a well-formed id', () => {
      expect(
        candidates.filter((c) => !CARD_ID.test(c.id)).map((c) => `${c.name} (${c.id})`)
      ).toEqual([]);
    });

    it('lists each id once', () => {
      expect(duplicates(candidates.map((c) => c.id))).toEqual([]);
    });

    // The dedupe contract: alt-art, showcase and borderless printings share a
    // name, and only one of them may represent the card.
    it('lists each name once', () => {
      expect(duplicates(candidates.map((c) => c.name))).toEqual([]);
    });

    it('excludes cards already in the deck', () => {
      const inDeck = new Set([
        ...Object.values(precon!.mainBoard).map((c) => c.name),
        ...precon!.commanders.map((c) => c.name),
      ]);
      expect(candidates.filter((c) => inDeck.has(c.name)).map((c) => c.name)).toEqual([]);
    });

    it('excludes cards outside the deck\'s color identity', () => {
      const legal = new Set(precon!.colorIdentity);
      expect(
        candidates
          .filter((c) => !c.colorIdentity.every((color) => legal.has(color)))
          .map((c) => `${c.name} [${c.colorIdentity.join('')}]`)
      ).toEqual([]);
    });

    it('excludes basic lands', () => {
      expect(candidates.filter((c) => c.type.includes('Basic Land')).map((c) => c.name)).toEqual([]);
    });
  });
});
