/**
 * Downloads MTGJSON data and transforms it into the Fellowpick frontend format.
 *
 * Usage:
 *   node scripts/import-mtgjson.mjs
 *
 * This script:
 * 1. Downloads the 4 Tolkien precon deck JSONs from MTGJSON
 * 2. Downloads the LTR and LTC set JSONs from MTGJSON
 * 3. Transforms the data into our format with {setCode}{paddedNumber} card IDs
 * 4. Writes the output to src/data/tolkien/
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');

const MTGJSON_BASE = 'https://mtgjson.com/api/v5';

const TOLKIEN_PRECONS = [
  { filename: 'FoodAndFellowship_LTC', id: 'food-and-fellowship', name: 'Food and Fellowship' },
  { filename: 'RidersOfRohan_LTC', id: 'riders-of-rohan', name: 'Riders of Rohan' },
  { filename: 'ElvenCouncil_LTC', id: 'elven-council', name: 'Elven Council' },
  { filename: 'TheHostsOfMordor_LTC', id: 'hosts-of-mordor', name: 'The Hosts of Mordor' },
];

const TOLKIEN_SETS = ['LTR', 'LTC'];

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

function transformCard(card) {
  const setCode = card.setCode;
  const number = card.number;
  return {
    id: makeCardId(setCode, number),
    name: card.name,
    setCode,
    number,
    manaCost: card.manaCost || null,
    manaValue: card.manaValue ?? card.convertedManaCost ?? 0,
    type: card.type,
    text: card.text || null,
    colorIdentity: card.colorIdentity || [],
    colors: card.colors || [],
    rarity: card.rarity,
    power: card.power || null,
    toughness: card.toughness || null,
    keywords: card.keywords || [],
    scryfallImage: buildScryfallImageUrl(card.identifiers?.scryfallId),
  };
}

async function fetchJson(url) {
  console.log(`  Fetching ${url}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function importPrecons() {
  const preconsDir = join(DATA_DIR, 'tolkien', 'precons');
  mkdirSync(preconsDir, { recursive: true });

  for (const precon of TOLKIEN_PRECONS) {
    const url = `${MTGJSON_BASE}/decks/${precon.filename}.json`;
    const json = await fetchJson(url);
    const data = json.data;

    const commanders = (data.commander || []).map(transformCard);
    const mainBoardCards = (data.mainBoard || []).map(transformCard);
    const mainBoard = Object.fromEntries(mainBoardCards.map(c => [c.id, c]));

    // Commander color identity is the union of all commander color identities
    const colorIdentity = [...new Set(commanders.flatMap(c => c.colorIdentity))];

    const output = {
      id: precon.id,
      name: precon.name,
      universe: 'tolkien',
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

async function importSets() {
  const setsDir = join(DATA_DIR, 'tolkien', 'sets');
  mkdirSync(setsDir, { recursive: true });

  for (const setCode of TOLKIEN_SETS) {
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

async function main() {
  console.log('Importing MTGJSON data for Tolkien universe...\n');

  console.log('Downloading precon decks...');
  await importPrecons();

  console.log('\nDownloading sets...');
  await importSets();

  console.log('\nDone! Data written to src/data/tolkien/');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
