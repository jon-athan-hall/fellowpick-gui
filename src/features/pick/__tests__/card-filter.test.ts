import { describe, expect, it } from 'vitest';
import { cardTypeOptions, filterCards, MAX_CMC, NO_FILTERS } from '../card-filter';
import type { Card } from '../types';

// Only the fields the filters read; the rest of Card never enters into it.
function card(
  name: string,
  types: string[],
  flavorName: string | null = null,
  manaValue = 0
): Card {
  return {
    id: name.replace(/\W/g, '').toUpperCase().slice(0, 3) + '0001',
    name,
    flavorName,
    manaCost: null,
    manaValue,
    type: types.join(' '),
    types,
    rarity: 'common',
    colorIdentity: [],
    keywords: [],
    oracleText: null,
    scryfallImage: null,
  };
}

const CARDS = [
  card('Llanowar Elves', ['Creature']),
  card('Sol Ring', ['Artifact']),
  card('Solemn Simulacrum', ['Artifact', 'Creature']),
  card('Command Tower', ['Land']),
  card('Counterspell', ['Instant']),
  card('Éowyn, Lady of Rohan', ['Creature']),
  card('The Great Henge', ['Artifact'], 'The Party Tree'),
];

const names = (cards: Card[]) => cards.map((c) => c.name);

describe('cardTypeOptions', () => {
  it('lists every type present, once, A→Z', () => {
    expect(cardTypeOptions(CARDS)).toEqual(['Artifact', 'Creature', 'Instant', 'Land']);
  });

  it('lists a type once however many cards carry it', () => {
    expect(cardTypeOptions([card('A', ['Creature']), card('B', ['Creature'])])).toEqual([
      'Creature',
    ]);
  });

  it('is empty for an empty list', () => {
    expect(cardTypeOptions([])).toEqual([]);
  });
});

describe('filterCards', () => {
  it('keeps everything when no filter is set', () => {
    expect(filterCards(CARDS, NO_FILTERS)).toEqual(CARDS);
  });

  // The reason type matches against `types` and not the type line: a player
  // asking for creatures means everything they can attack with.
  it('matches a type anywhere in the type line', () => {
    expect(names(filterCards(CARDS, { ...NO_FILTERS, type: 'Creature' }))).toEqual([
      'Llanowar Elves',
      'Solemn Simulacrum',
      'Éowyn, Lady of Rohan',
    ]);
    expect(names(filterCards(CARDS, { ...NO_FILTERS, type: 'Artifact' }))).toEqual([
      'Sol Ring',
      'Solemn Simulacrum',
      'The Great Henge',
    ]);
  });

  it('returns nothing for a type no card carries', () => {
    expect(filterCards(CARDS, { ...NO_FILTERS, type: 'Planeswalker' })).toEqual([]);
  });
});

describe('filterCards by search', () => {
  const search = (text: string) => names(filterCards(CARDS, { ...NO_FILTERS, search: text }));

  it('ignores an empty or whitespace-only search', () => {
    expect(filterCards(CARDS, { ...NO_FILTERS, search: '' })).toEqual(CARDS);
    expect(filterCards(CARDS, { ...NO_FILTERS, search: '   ' })).toEqual(CARDS);
  });

  it('matches anywhere in the name, not just the start', () => {
    expect(search('tower')).toEqual(['Command Tower']);
    expect(search('sol')).toEqual(['Sol Ring', 'Solemn Simulacrum']);
  });

  it('ignores case', () => {
    expect(search('LLANOWAR')).toEqual(['Llanowar Elves']);
  });

  // The reason fold() exists: these are the cards people search for by name.
  it('matches an accented name typed without the accent', () => {
    expect(search('eowyn')).toEqual(['Éowyn, Lady of Rohan']);
    expect(search('Éowyn')).toEqual(['Éowyn, Lady of Rohan']);
  });

  // A reskin's row shows both names, so both have to be searchable.
  it('matches a reskin by its printed name or its Oracle name', () => {
    expect(search('party tree')).toEqual(['The Great Henge']);
    expect(search('great henge')).toEqual(['The Great Henge']);
  });

  it('returns nothing when no name matches', () => {
    expect(search('jodah')).toEqual([]);
  });
});

describe('filterCards by cmc', () => {
  // One card at each cost from 0 to 11, so the open top has a tail to include.
  const COSTS = Array.from({ length: 12 }, (_, mv) => card(`Cost ${mv}`, ['Creature'], null, mv));
  const between = (min: number, max: number) =>
    filterCards(COSTS, { ...NO_FILTERS, cmc: [min, max] }).map((c) => c.manaValue);

  it('keeps everything at the full range', () => {
    expect(filterCards(COSTS, NO_FILTERS)).toEqual(COSTS);
  });

  it('bounds both ends inclusively', () => {
    expect(between(2, 4)).toEqual([2, 3, 4]);
  });

  it('pins to a single cost when the handles meet', () => {
    expect(between(3, 3)).toEqual([3]);
  });

  // The point of MAX_CMC: the top of the scale means "and up", so 9, 10 and 11
  // are in range even though the slider cannot point at them.
  it('treats the top of the scale as open-ended', () => {
    expect(between(MAX_CMC, MAX_CMC)).toEqual([8, 9, 10, 11]);
    expect(between(6, MAX_CMC)).toEqual([6, 7, 8, 9, 10, 11]);
  });

  it('closes the top as soon as the handle comes down off it', () => {
    expect(between(6, MAX_CMC - 1)).toEqual([6, 7]);
  });

  it('includes zero-cost cards at the bottom of the range', () => {
    expect(between(0, 1)).toEqual([0, 1]);
    expect(between(1, 2)).toEqual([1, 2]);
  });
});

describe('filterCards with several filters', () => {
  it('requires a card to satisfy every active filter', () => {
    expect(names(filterCards(CARDS, { ...NO_FILTERS, type: 'Creature', search: 'sol' }))).toEqual([
      'Solemn Simulacrum',
    ]);
    expect(names(filterCards(CARDS, { ...NO_FILTERS, type: 'Artifact', search: 'sol' }))).toEqual([
      'Sol Ring',
      'Solemn Simulacrum',
    ]);
    expect(filterCards(CARDS, { ...NO_FILTERS, type: 'Land', search: 'sol' })).toEqual([]);
  });
});
