// Materializes ADD candidate lists per precon into JSON files at build time.
//
// Why a build step:
//   The previous runtime version scanned every card in every set inside the
//   page render (memoized, but still). Doing it once at build time and saving
//   the result trades a bit of repo size for zero work at request time.
//
// Two-step filter, per precon:
//   1. Exclude any candidate whose *name* matches a card already in the deck
//      (mainBoard + commanders). Catches all printings of the deck's
//      commander, all reprints, etc., even when they have different
//      Scryfall ids.
//   2. Among survivors, keep only the first occurrence of each name —
//      collapses alt-art/full-art/showcase variants into one canonical row.
//      Sets are scanned in the order declared by universes.json (commander
//      decks, then the base set, then bonus sheets), so "first" is a stated
//      preference rather than a coincidence of alphabetical set codes.
//
// Also applied: color identity must be a subset of the precon's colors, and
// basic lands are skipped. Commander-banned cards are already absent — the set
// files never contain them, since import-mtgjson.mjs filters them on the way in
// (see commanderLegalOnly there for why that filter lives at import rather than
// here).
//
// Output: one file per precon in a sibling `adds/` directory:
//   src/data/<universe>/adds/<precon-id>.json
// Runtime reads this file directly via import.meta.glob; the loop in this
// script is the only place that scans the set JSONs anymore.
//
// Run: `npm run build-data` (or automatically via `prebuild` before `vite build`).

import { readFile, writeFile, readdir, stat, mkdir } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');

async function loadJson(path) {
  return JSON.parse(await readFile(path, 'utf-8'));
}

async function findUniverses() {
  const entries = await readdir(DATA_DIR, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

async function pathExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

// Orders a universe's set files by the `sets` array in universes.json, which is
// maintained in printing-preference order: commander decks, then the base set,
// then bonus sheets.
//
// This matters because ADD candidates are deduped by card *name*, so when a
// name appears in more than one set something has to pick the winning printing
// — and that choice decides both the art shown and the `cardId` the API stores
// votes against. Falling back to readdir order (alphabetical) left that
// decision to a coincidence of set codes, so dropping a new set file into the
// directory could silently re-point a card and orphan every vote on it.
//
// Codes missing from the manifest sort last, alphabetically among themselves,
// so an un-manifested set file can never outrank a declared one.
function orderSetFiles(setFiles, universeEntry) {
  const priority = universeEntry?.sets ?? [];
  const rank = (file) => {
    const index = priority.indexOf(basename(file, '.json'));
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  return [...setFiles].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

// Logs names that appear in more than one set, with the printing that won.
// Console only, deliberately not a committed artifact: it is a review aid for
// the handful of cards where the ordering above actually decides something.
function reportNameCollisions(universe, sets) {
  const setsByName = new Map();
  for (const set of sets) {
    for (const card of Object.values(set.cards)) {
      if (!setsByName.has(card.name)) setsByName.set(card.name, []);
      const codes = setsByName.get(card.name);
      if (!codes.includes(set.setCode)) codes.push(set.setCode);
    }
  }

  const collisions = [...setsByName.entries()].filter(([, codes]) => codes.length > 1);
  if (collisions.length === 0) return;

  console.log(`  ${universe}: ${collisions.length} name(s) in multiple sets — winner listed first`);
  for (const [name, codes] of collisions.slice(0, 10)) {
    console.log(`    ${name} — ${codes.join(' > ')}`);
  }
  if (collisions.length > 10) console.log(`    …and ${collisions.length - 10} more`);
}

function computeAddCandidates(precon, sets) {
  const preconCardNames = new Set([
    ...Object.values(precon.mainBoard).map((c) => c.name),
    ...precon.commanders.map((c) => c.name),
  ]);

  const commanderColors = new Set(precon.colorIdentity);
  const byName = new Map();

  for (const set of sets) {
    for (const card of Object.values(set.cards)) {
      if (preconCardNames.has(card.name)) continue;
      if (byName.has(card.name)) continue;
      if (!card.colorIdentity.every((c) => commanderColors.has(c))) continue;
      if (card.type.includes('Basic Land')) continue;
      byName.set(card.name, card);
    }
  }

  return Array.from(byName.values());
}

async function buildForUniverse(universe, universeEntry) {
  const setsDir = join(DATA_DIR, universe, 'sets');
  const preconsDir = join(DATA_DIR, universe, 'precons');
  const addsDir = join(DATA_DIR, universe, 'adds');

  if (!(await pathExists(setsDir)) || !(await pathExists(preconsDir))) {
    console.log(`  ${universe}: no sets/ or precons/, skipping`);
    return;
  }

  // Make sure the output directory exists; safe to call repeatedly.
  await mkdir(addsDir, { recursive: true });

  const setFiles = orderSetFiles(
    (await readdir(setsDir)).filter((f) => f.endsWith('.json')),
    universeEntry
  );
  const sets = await Promise.all(
    setFiles.map((f) => loadJson(join(setsDir, f)))
  );
  reportNameCollisions(universe, sets);

  const preconFiles = (await readdir(preconsDir)).filter((f) => f.endsWith('.json'));

  for (const file of preconFiles) {
    const id = basename(file, '.json');
    const precon = await loadJson(join(preconsDir, file));
    const candidates = computeAddCandidates(precon, sets);
    const outPath = join(addsDir, `${id}.json`);
    await writeFile(outPath, JSON.stringify(candidates, null, 2) + '\n');
    console.log(`  ${universe}/${id}  →  ${candidates.length} candidates`);
  }
}

const manifest = await loadJson(join(DATA_DIR, 'universes.json'));
const universes = await findUniverses();
console.log(`Building ADD candidates for ${universes.length} universe(s)…`);
for (const u of universes) {
  await buildForUniverse(u, manifest.find((entry) => entry.id === u));
}
console.log('Done.');
