/**
 * Imports MTGJSON data for a single universe and writes Fellowpick-shaped JSON.
 *
 * Usage:
 *   node scripts/import-mtgjson.mjs <universe-id>
 *
 * What it does:
 * 1. Downloads each precon deck JSON from MTGJSON
 * 2. Downloads each set JSON from MTGJSON
 * 3. Trims every card to the fields the UI actually reads
 * 4. Writes precons to src/data/<universe-id>/precons/<precon-id>.json
 * 5. Writes sets to src/data/<universe-id>/sets/<setCode>.json
 * 6. Upserts the universe entry in src/data/universes.json
 */

import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');
const UNIVERSES_FILE = join(DATA_DIR, 'universes.json');
const MTGJSON_BASE = 'https://mtgjson.com/api/v5';

// MTGJSON deck filenames are CamelCase + setCode (look them up in DeckList.json).
//
// `sets` is ordered by printing preference, not release order: Commander decks
// first, then the base set, then bonus sheets. build-add-candidates.mjs scans
// sets in this order and keeps the first printing of each card name, so this
// array is what decides which printing represents a card — and therefore which
// cardId the API stores votes against. Appending a bonus sheet is always safe;
// inserting ahead of an existing entry re-points cards and orphans their votes.
const UNIVERSES = {
  'middle-earth': {
    name: 'Middle-Earth',
    description: 'The Lord of the Rings and Middle-Earth',
    sets: ['LTC', 'LTR'],
    precons: [
      { filename: 'FoodAndFellowship_LTC', id: 'food-and-fellowship', name: 'Food and Fellowship' },
      { filename: 'RidersOfRohan_LTC', id: 'riders-of-rohan', name: 'Riders of Rohan' },
      { filename: 'ElvenCouncil_LTC', id: 'elven-council', name: 'Elven Council' },
      { filename: 'TheHostsOfMordor_LTC', id: 'the-hosts-of-mordor', name: 'The Hosts of Mordor' },
    ],
  },
  'final-fantasy': {
    name: 'Final Fantasy',
    description: 'The Final Fantasy video game series',
    sets: ['FIC', 'FIN'],
    precons: [
      { filename: 'RevivalTranceFinalFantasyVi_FIC', id: 'revival-trance', name: 'Revival Trance' },
      { filename: 'LimitBreakFinalFantasyVii_FIC', id: 'limit-break', name: 'Limit Break' },
      { filename: 'CounterBlitzFinalFantasyX_FIC', id: 'counter-blitz', name: 'Counter Blitz' },
      { filename: 'ScionsSpellcraftFinalFantasyXiv_FIC', id: 'scions-and-spellcraft', name: 'Scions & Spellcraft' },
    ],
  },
  'teenage-mutant-ninja-turtles': {
    name: 'Teenage Mutant Ninja Turtles',
    description: 'Heroes in a half-shell — TMNT',
    sets: ['TMC', 'TMT'],
    precons: [
      { filename: 'TurtlePower_TMC', id: 'turtle-power', name: 'Turtle Power' },
    ],
  },
};

function makeCardId(setCode, number) {
  const padded = number.replace(/\D/g, '').padStart(4, '0');
  return `${setCode}${padded}`;
}

// Keeps only cards that exist in paper.
//
// MTGJSON set files include MTG Arena rebalanced cards — digital-only versions
// of paper cards, named `A-The One Ring` and numbered `A-246`. You cannot own
// one, so they have no place in a deck-upgrade vote, and because the name
// differs from the paper card the ADD list's name-dedupe cannot collapse them:
// the same card gets offered twice and votes split between them.
//
// Filtering on `availability` rather than on `isRebalanced` or the `A-` name
// prefix states the actual rule — nothing digital-only — so MTGO-only cards and
// any future online-only printing are caught by the same check.
//
// A missing field is treated as paper: MTGJSON always ships `availability`, and
// if that ever changes we would rather import a stray card than silently write
// an empty set.
function isPaperCard(card) {
  return !Array.isArray(card.availability) || card.availability.includes('paper');
}

// Drops non-paper cards and says so, since the count belongs in the build log
// rather than being discovered later in the data.
function paperOnly(cards, label) {
  const paper = cards.filter(isPaperCard);
  const dropped = cards.length - paper.length;
  if (dropped > 0) {
    const names = cards.filter((c) => !isPaperCard(c)).map((c) => c.name);
    console.log(`  Skipped ${dropped} non-paper card(s) in ${label}: ${names.join(', ')}`);
  }
  return paper;
}

// Groups raw MTGJSON cards by the id makeCardId generates for them.
//
// Ids are lossy on purpose — the collector number is stripped to digits, so a
// card's alternate printings collapse onto one id, which is what lets the ADD
// list offer a card once. But MTGJSON also emits each face of a double-faced
// card as its own entry sharing one collector number, and meld results carry the
// front card's number with a `b` suffix, so a group can hold several faces of
// one card as well as several printings of it. Left to last-write-wins, a back
// face overwrote the real card:
//
//   FIN0013  Crystal Fragments ({W} Equipment)  lost to its own back face
//   FIN0099  Fang, Fearless l'Cie              lost to a meld result
//
// Grouping rather than overwriting lets pickFront choose what to display and
// combinedText keep what the other faces say.
function groupById(cards) {
  const byId = new Map();
  for (const card of cards) {
    const id = makeCardId(card.setCode, card.number);
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(card);
  }
  return byId;
}

// The entry that represents the group: the front face, or failing that the
// first printing seen — the lowest collector number, which is the base printing
// rather than a showcase variant.
function pickFront(group) {
  return group.find((card) => card.side !== 'b') ?? group[0];
}

// Rules text for every face of the card, not just the one we display.
//
// MTGJSON stores `text` per face, so keeping only the front would drop the back
// of every Saga and transform card — and the back is usually where the
// interesting ability lives. Card search would quietly never match it.
//
// Faces are identified by `faceName`, which distinguishes the two halves of one
// card while staying identical across alternate printings, so a variant
// collision contributes its text once rather than twice.
function combinedText(group) {
  const seen = new Set();
  const parts = [];
  for (const card of [...group].sort((a, b) => (a.side ?? 'a').localeCompare(b.side ?? 'a'))) {
    const face = card.faceName ?? card.name;
    if (seen.has(face)) continue;
    seen.add(face);
    if (card.text) parts.push(card.text);
  }
  return parts.length > 0 ? parts.join('\n—\n') : null;
}

// Turns one id's group of raw MTGJSON entries into the single card we store.
function toCard(group) {
  return transformCard(pickFront(group), group);
}

function buildScryfallImageUrl(scryfallId) {
  if (!scryfallId) return null;
  const c1 = scryfallId[0];
  const c2 = scryfallId[1];
  return `https://cards.scryfall.io/large/front/${c1}/${c2}/${scryfallId}.jpg`;
}

// Trims each MTGJSON card to the fields the UI reads. See Card in src/features/pick/types.ts.
//
// `manaValue` is the whole card's value rather than the front face's, which is
// the number people mean by CMC. It agrees with the hand-rolled parser it
// replaces on every card checked — the point is not that the parser was wrong
// but that it was two copies of a rules engine deriving something the source
// already states, and it silently returned 0 whenever manaCost was missing,
// which is exactly what the back-face bug caused.
//
// `flavorName` is the in-universe name a bonus sheet gives a reprint: FCA prints
// Adeline, Resplendent Cathar as "Hero of Light". The UI leads with that name,
// since the whole point of these sets is the reskin.
//
// `keywords` is already the union across faces in MTGJSON, so the front face
// carries the whole card's keywords.
function transformCard(card, group = [card]) {
  return {
    id: makeCardId(card.setCode, card.number),
    name: card.name,
    flavorName: card.flavorName ?? null,
    manaCost: card.manaCost || null,
    manaValue: card.manaValue ?? 0,
    type: card.type,
    types: card.types ?? [],
    rarity: card.rarity ?? null,
    colorIdentity: card.colorIdentity || [],
    keywords: card.keywords ?? [],
    oracleText: combinedText(group),
    scryfallImage: buildScryfallImageUrl(card.identifiers?.scryfallId),
  };
}

async function fetchJson(url) {
  console.log(`  Fetching ${url}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function importPrecons(universeId, config) {
  const preconsDir = join(DATA_DIR, universeId, 'precons');
  mkdirSync(preconsDir, { recursive: true });

  for (const precon of config.precons) {
    const url = `${MTGJSON_BASE}/decks/${precon.filename}.json`;
    const json = await fetchJson(url);
    const data = json.data;

    const commanders = [
      ...groupById(paperOnly(data.commander || [], `${precon.id} commanders`)).values(),
    ].map(toCard);
    const mainBoard = Object.fromEntries(
      [...groupById(paperOnly(data.mainBoard || [], precon.id))].map(([id, group]) => [
        id,
        toCard(group),
      ])
    );

    // Commander color identity is the union of all commander color identities.
    const colorIdentity = [...new Set(commanders.flatMap(c => c.colorIdentity))];

    const output = {
      id: precon.id,
      name: precon.name,
      universe: universeId,
      setCode: data.code,
      colorIdentity,
      commanders,
      mainBoard,
    };

    const outPath = join(preconsDir, `${precon.id}.json`);
    writeFileSync(outPath, JSON.stringify(output, null, 2));
    console.log(
      `  Wrote ${outPath} (${commanders.length} commanders, ${Object.keys(mainBoard).length} main board cards)`
    );
  }
}

async function importSets(universeId, config) {
  const setsDir = join(DATA_DIR, universeId, 'sets');
  mkdirSync(setsDir, { recursive: true });

  for (const setCode of config.sets) {
    const url = `${MTGJSON_BASE}/${setCode}.json`;
    const json = await fetchJson(url);
    const data = json.data;

    const grouped = groupById(paperOnly(data.cards || [], setCode));
    const cards = Object.fromEntries([...grouped].map(([id, group]) => [id, toCard(group)]));

    const output = {
      setCode: data.code,
      name: data.name,
      releaseDate: data.releaseDate,
      // Cards written, not cards MTGJSON listed — alternate printings share an
      // id, so the raw count overstated this by 106 for FIN.
      totalCards: grouped.size,
      cards,
    };

    const outPath = join(setsDir, `${setCode}.json`);
    writeFileSync(outPath, JSON.stringify(output, null, 2));
    console.log(`  Wrote ${outPath} (${grouped.size} cards)`);
  }
}

function upsertUniverseEntry(universeId, config) {
  const universes = JSON.parse(readFileSync(UNIVERSES_FILE, 'utf-8'));
  const entry = {
    id: universeId,
    name: config.name,
    description: config.description,
    sets: config.sets,
    precons: config.precons.map(p => ({ id: p.id, name: p.name })),
  };
  const idx = universes.findIndex(u => u.id === universeId);
  if (idx >= 0) universes[idx] = entry;
  else universes.push(entry);
  writeFileSync(UNIVERSES_FILE, JSON.stringify(universes, null, 2) + '\n');
  console.log(`  ${idx >= 0 ? 'Updated' : 'Added'} ${universeId} in universes.json`);
}

async function main() {
  const targetUniverse = process.argv[2];
  if (!targetUniverse) {
    console.error('Usage: node scripts/import-mtgjson.mjs <universe-id>');
    console.error('Available:', Object.keys(UNIVERSES).join(', '));
    process.exit(1);
  }
  const config = UNIVERSES[targetUniverse];
  if (!config) {
    console.error(`Unknown universe: ${targetUniverse}`);
    console.error('Available:', Object.keys(UNIVERSES).join(', '));
    process.exit(1);
  }

  console.log(`Importing ${config.name} (${targetUniverse})...\n`);

  console.log('Downloading precon decks...');
  await importPrecons(targetUniverse, config);

  console.log('\nDownloading sets...');
  await importSets(targetUniverse, config);

  console.log('\nUpdating universes.json...');
  upsertUniverseEntry(targetUniverse, config);

  console.log(`\nDone! Data written to src/data/${targetUniverse}/`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
