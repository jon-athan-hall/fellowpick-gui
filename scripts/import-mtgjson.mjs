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
const UNIVERSES = {
  'middle-earth': {
    name: 'Middle-Earth',
    description: 'The Lord of the Rings and Middle-Earth',
    sets: ['LTR', 'LTC'],
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
    sets: ['FIN', 'FIC'],
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
    sets: ['TMT', 'TMC'],
    precons: [
      { filename: 'TurtlePower_TMC', id: 'turtle-power', name: 'Turtle Power' },
    ],
  },
};

function makeCardId(setCode, number) {
  const padded = number.replace(/\D/g, '').padStart(4, '0');
  return `${setCode}${padded}`;
}

function buildScryfallImageUrl(scryfallId) {
  if (!scryfallId) return null;
  const c1 = scryfallId[0];
  const c2 = scryfallId[1];
  return `https://cards.scryfall.io/large/front/${c1}/${c2}/${scryfallId}.jpg`;
}

// Trims each MTGJSON card to the fields the UI reads. See Card in src/features/pick/types.ts.
function transformCard(card) {
  return {
    id: makeCardId(card.setCode, card.number),
    name: card.name,
    manaCost: card.manaCost || null,
    type: card.type,
    colorIdentity: card.colorIdentity || [],
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

    const commanders = (data.commander || []).map(transformCard);
    const mainBoardCards = (data.mainBoard || []).map(transformCard);
    const mainBoard = Object.fromEntries(mainBoardCards.map(c => [c.id, c]));

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
    console.log(`  Wrote ${outPath} (${commanders.length} commanders, ${mainBoardCards.length} main board cards)`);
  }
}

async function importSets(universeId, config) {
  const setsDir = join(DATA_DIR, universeId, 'sets');
  mkdirSync(setsDir, { recursive: true });

  for (const setCode of config.sets) {
    const url = `${MTGJSON_BASE}/${setCode}.json`;
    const json = await fetchJson(url);
    const data = json.data;

    const cardsArray = (data.cards || []).map(transformCard);
    const cards = Object.fromEntries(cardsArray.map(c => [c.id, c]));

    const output = {
      setCode: data.code,
      name: data.name,
      releaseDate: data.releaseDate,
      totalCards: cardsArray.length,
      cards,
    };

    const outPath = join(setsDir, `${setCode}.json`);
    writeFileSync(outPath, JSON.stringify(output, null, 2));
    console.log(`  Wrote ${outPath} (${cardsArray.length} cards)`);
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
