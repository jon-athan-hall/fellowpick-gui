import { fireEvent, screen } from '@testing-library/react';
import { useRoutes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import addCandidates from '../../../data/middle-earth/adds/elven-council.json';
import precon from '../../../data/middle-earth/precons/elven-council.json';
import { renderWithProviders } from '../../../test/render';
import { MAX_CMC } from '../card-filter';
import { cardDisplayName, cardOracleName } from '../card-name';
import { pickRoutes } from '../routes';

// Characterisation tests for the precon board — the CUT/ADD voting pages.
//
// CUT and ADD are separate routes under a shared deck layout, with a filter bar
// between the switcher and the table. These tests pin the behaviour of that
// pipeline — filter, then sort, then paginate — and they go in through
// `pickRoutes` rather than by rendering a page component, so the bare deck
// URL's redirect to /cut is exercised too.
//
// The load-bearing one is "keeps the row order stable" at the bottom. That
// behaviour is held up by two `eslint-disable react-hooks/exhaustive-deps`
// memos and nothing else; break them and rows jump out from under the cursor
// mid-vote, which no other test would catch.

const mocks = vi.hoisted(() => ({
  counts: [] as { cardId: string; pickType: string; count: number }[],
  myPicks: [] as { id: string; preconId: string; cardId: string; pickType: string }[],
  makePick: vi.fn(),
  removePick: vi.fn(),
}));

vi.mock('../api/use-pick-counts', () => ({
  usePickCountsQuery: () => ({ data: mocks.counts, isLoading: false, isSuccess: true }),
}));
vi.mock('../api/use-my-picks', () => ({
  useMyPicksQuery: () => ({ data: mocks.myPicks }),
}));
vi.mock('../api/use-make-pick', () => ({
  useMakePickMutation: () => ({ mutate: mocks.makePick }),
}));
vi.mock('../api/use-remove-pick', () => ({
  useRemovePickMutation: () => ({ mutate: mocks.removePick }),
}));

const PAGE_SIZE = 25;
const DECK_URL = '/universes/middle-earth/precons/elven-council';

const deckCards = Object.values(precon.mainBoard);

type NamedCard = { name: string; flavorName: string | null };

// The default sort is votes descending, and `sortCards` applies the direction
// to the name tie-break too — so with no votes cast yet the list comes out
// Z→A, not A→Z. Surprising, but it is what ships; pin it rather than assume.
//
// Ordered by the *printed* name, which is what the board sorts on. On a reskin
// that is not the Oracle name, and Elven Council's candidate pool holds enough
// of them for the two orderings to disagree about which card comes first.
const byNameDescending = <T extends NamedCard>(cards: T[]) =>
  [...cards].sort((a, b) => -cardDisplayName(a).localeCompare(cardDisplayName(b)));

// What the Name cell reads end to end: the printed name, followed by the Oracle
// name in parentheses on the cards that carry one.
function cardLabel(card: NamedCard): string {
  const oracleName = cardOracleName(card);
  return oracleName ? `${cardDisplayName(card)} (${oracleName})` : cardDisplayName(card);
}

// Expectations are derived from the committed data rather than hard-coded, so
// re-importing a set changes the fixtures without falsifying the behaviour
// these tests describe.
const cutOrder = byNameDescending(deckCards);
const firstCutCard = cutOrder[0];
const alsoOnFirstPage = cutOrder[1];
const buriedCard = cutOrder[cutOrder.length - 1];
const firstAddCard = byNameDescending(addCandidates)[0];

function PickApp() {
  return useRoutes(pickRoutes);
}

// The deck's JSON is a lazily-imported chunk, so nothing is on screen until it
// resolves. Every test waits for the first row rather than for the deck name:
// the name renders from the precon alone, while a row proves the card list is
// there too.
async function renderBoard() {
  const result = renderRoutes();
  await screen.findAllByRole('row');
  return result;
}

function renderRoutes() {
  return renderWithProviders(<PickApp />, {
    routes: [DECK_URL],
    auth: {
      isAuthenticated: true,
      user: {
        id: 'u-1',
        name: 'Test User',
        email: 'test@example.com',
        roles: ['ROLE_USER'],
        verified: true,
      },
    },
  });
}

// Going through the accessibility tree rather than a bare `tbody tr` query
// keeps this honest about what is actually on screen.
function bodyRows(): HTMLElement[] {
  return screen.getAllByRole('row').filter((row) => row.closest('tbody') !== null);
}

// Name is the last column; the mana-cost column sits before it.
function rowName(row: HTMLElement): string {
  const cells = row.querySelectorAll('td');
  return cells[cells.length - 1].textContent ?? '';
}

// Steps a slider thumb with the keyboard. The focus is the point: Mantine's
// RangeSlider keeps one handler on the root and moves whichever thumb is
// focused, so a keydown aimed at a thumb that isn't focused moves the other one.
function press(thumb: HTMLElement, key: string, times: number): void {
  fireEvent.focus(thumb);
  for (let i = 0; i < times; i += 1) {
    fireEvent.keyDown(thumb, { key });
  }
}

describe('precon board', () => {
  beforeEach(() => {
    mocks.counts = [];
    mocks.myPicks = [];
    vi.clearAllMocks();
  });

  it('renders the deck identity', async () => {
    await renderBoard();
    expect(screen.getByText('Elven Council')).toBeInTheDocument();
  });

  it('shows one page of cards at a time', async () => {
    await renderBoard();
    expect(bodyRows()).toHaveLength(PAGE_SIZE);

    const pages = Math.ceil(deckCards.length / PAGE_SIZE);
    expect(screen.getByRole('button', { name: String(pages) })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: String(pages + 1) })).not.toBeInTheDocument();
  });

  it('orders by vote count, breaking ties by name', async () => {
    await renderBoard();
    expect(rowName(bodyRows()[0])).toBe(cardLabel(firstCutCard));
  });

  it('puts the most-voted card first, wherever it sat before', async () => {
    mocks.counts = [{ cardId: buriedCard.id, pickType: 'CUT', count: 12 }];
    await renderBoard();
    expect(rowName(bodyRows()[0])).toBe(cardLabel(buriedCard));
  });

  it('lands on CUT from the bare deck URL', async () => {
    await renderBoard();
    // The redirect fired: the deck's own cards are showing, not the candidates.
    expect(rowName(bodyRows()[0])).toBe(cardLabel(firstCutCard));
    expect(screen.getByRole('link', { name: 'CUT' })).toHaveAttribute('aria-current', 'page');
  });

  it('shows a different list of cards under ADD', async () => {
    await renderBoard();
    fireEvent.click(screen.getByRole('link', { name: 'ADD' }));

    // A route change, not a tab switch — the CUT board unmounts and the ADD
    // board mounts, so wait for the new list rather than reading straight away.
    await screen.findByText(cardDisplayName(firstAddCard), { exact: false });
    expect(rowName(bodyRows()[0])).toBe(cardLabel(firstAddCard));
    expect(deckCards.some((c) => c.name === firstAddCard.name)).toBe(false);
  });

  // Switching sides has to start over at page one. The candidate pool is
  // several times longer than the deck, so a page number carried across from
  // ADD lands past the end of CUT and the table comes up empty — no rows, no
  // way back except the browser's back button.
  it('starts at the first page again when the side changes', async () => {
    const addPages = Math.ceil(addCandidates.length / PAGE_SIZE);
    expect(addPages).toBeGreaterThan(Math.ceil(deckCards.length / PAGE_SIZE));

    await renderBoard();
    fireEvent.click(screen.getByRole('link', { name: 'ADD' }));
    await screen.findByText(cardDisplayName(firstAddCard), { exact: false });
    fireEvent.click(screen.getByRole('button', { name: String(addPages) }));

    fireEvent.click(screen.getByRole('link', { name: 'CUT' }));
    expect(bodyRows()).toHaveLength(PAGE_SIZE);
    expect(rowName(bodyRows()[0])).toBe(cardLabel(firstCutCard));
  });

  // The type filter narrows the list and, like the side switch above it, has to
  // put the reader back on page one — a filtered list is shorter than the one
  // whose page number is still in state.
  it('filters the list by card type', async () => {
    const lands = deckCards.filter((c) => c.types.includes('Land'));
    expect(lands.length).toBeGreaterThan(0);
    expect(lands.length).toBeLessThan(deckCards.length);

    await renderBoard();
    const cutPages = Math.ceil(deckCards.length / PAGE_SIZE);
    fireEvent.click(screen.getByRole('button', { name: String(cutPages) }));

    fireEvent.click(screen.getByRole('textbox', { name: 'Filter by card type' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Land' }));

    const rows = bodyRows();
    expect(rows).toHaveLength(Math.min(lands.length, PAGE_SIZE));
    const landNames = new Set(lands.map(cardLabel));
    expect(rows.map(rowName).filter((n) => !landNames.has(n))).toEqual([]);
  });

  // Typing narrows to matching names and, like every other filter, returns to
  // page one.
  it('filters the list by a typed card name', async () => {
    await renderBoard();
    const cutPages = Math.ceil(deckCards.length / PAGE_SIZE);
    fireEvent.click(screen.getByRole('button', { name: String(cutPages) }));

    fireEvent.change(screen.getByRole('textbox', { name: 'Search by card name' }), {
      target: { value: 'elf' },
    });

    const matches = deckCards.filter((c) => c.name.toLowerCase().includes('elf'));
    expect(matches.length).toBeGreaterThan(0);
    expect(bodyRows()).toHaveLength(matches.length);

    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(bodyRows()).toHaveLength(PAGE_SIZE);
  });

  // The slider's two handles are the only filter the reader drives by keyboard
  // as readily as by pointer, so the test drives them that way: focus a thumb,
  // press an arrow key, and the range moves one step.
  it('filters the list by a cost range', async () => {
    await renderBoard();
    const [minThumb, maxThumb] = screen.getAllByRole('slider');
    expect(minThumb).toHaveAttribute('aria-valuenow', '0');
    expect(maxThumb).toHaveAttribute('aria-valuenow', String(MAX_CMC));

    // Both handles onto 1, so the range is exactly one cost. Mantine routes
    // arrow keys by focus rather than by event target, so each thumb has to be
    // focused before it will move — a keydown on an unfocused thumb moves
    // whichever one focus is on.
    press(maxThumb, 'ArrowLeft', MAX_CMC - 1);
    press(minThumb, 'ArrowRight', 1);
    expect(minThumb).toHaveAttribute('aria-valuenow', '1');
    expect(maxThumb).toHaveAttribute('aria-valuenow', '1');

    const oneDrops = deckCards.filter((c) => c.manaValue === 1);
    expect(oneDrops.length).toBeGreaterThan(0);
    expect(bodyRows()).toHaveLength(oneDrops.length);
    expect(new Set(bodyRows().map(rowName))).toEqual(new Set(oneDrops.map(cardLabel)));
  });

  // A reskin's row shows the printed name and the Oracle name, so searching
  // either has to find it. Elven Council's candidates include LTC's The Great
  // Henge, printed as The Party Tree.
  it('finds a reskinned card under either of its names', async () => {
    await renderBoard();
    fireEvent.click(screen.getByRole('link', { name: 'ADD' }));
    await screen.findByText(cardDisplayName(firstAddCard), { exact: false });

    const searchBox = screen.getByRole('textbox', { name: 'Search by card name' });
    for (const term of ['party tree', 'great henge']) {
      fireEvent.change(searchBox, { target: { value: term } });
      expect(bodyRows().map(rowName)).toContain('The Party Tree (The Great Henge)');
    }
  });

  // 25 of Elven Council's candidates are LTC reskins, printed under a name that
  // is not their Oracle name. The cell has to carry both: the printed one is
  // what the player is holding, the Oracle one is what every other Magic tool
  // calls it. Voted to the top rather than paged to, since which page a given
  // reskin lands on is not what this pins.
  it('shows both names on a reskinned card', async () => {
    const reskin = addCandidates.find((c) => c.flavorName);
    if (!reskin?.flavorName) throw new Error('fixture: no reskin among the candidates');
    mocks.counts = [{ cardId: reskin.id, pickType: 'ADD', count: 42 }];

    await renderBoard();
    fireEvent.click(screen.getByRole('link', { name: 'ADD' }));

    await screen.findByText(reskin.flavorName, { exact: false });
    expect(rowName(bodyRows()[0])).toBe(`${reskin.flavorName} (${reskin.name})`);
  });

  it('votes on a card when its row is clicked', async () => {
    await renderBoard();
    fireEvent.click(bodyRows()[0]);

    expect(mocks.makePick).toHaveBeenCalledWith({
      preconId: 'elven-council',
      cardId: firstCutCard.id,
      pickType: 'CUT',
    });
  });

  it('withdraws an existing vote when the row is clicked again', async () => {
    mocks.myPicks = [
      { id: 'pick-1', preconId: 'elven-council', cardId: firstCutCard.id, pickType: 'CUT' },
    ];
    await renderBoard();
    fireEvent.click(bodyRows()[0]);

    expect(mocks.removePick).toHaveBeenCalledWith('pick-1');
    expect(mocks.makePick).not.toHaveBeenCalled();
  });

  // The order lock. Vote counts changing must update what a row *says* without
  // moving it — otherwise the card you just voted on jumps to its new slot and
  // vanishes from under the pointer.
  it('keeps the row order stable when vote counts change', async () => {
    const { rerender } = await renderBoard();
    const orderBefore = bodyRows().map(rowName);

    // A card already on the first page, so its vote unit is on screen to prove
    // the count really did update while the row stayed put.
    mocks.counts = [{ cardId: alsoOnFirstPage.id, pickType: 'CUT', count: 99 }];
    rerender(<PickApp />);

    expect(bodyRows().map(rowName)).toEqual(orderBefore);
    expect(screen.getByText('99')).toBeInTheDocument();
  });
});
