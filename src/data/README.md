# Card data

Everything under `src/data/` is generated. Nothing here is edited by hand.

```
universes.json                  the manifest: universes, their set codes, their precons
<universe>/precons/<id>.json    one precon deck (commanders + main board)
<universe>/sets/<CODE>.json     one set's card pool
<universe>/adds/<id>.json       the ADD candidate list for one precon
```

Regenerate with:

```bash
node scripts/import-mtgjson.mjs <universe-id>   # precons/, sets/, universes.json
npm run build-data                              # adds/ (also runs on prebuild)
```

Source is [MTGJSON v5](https://mtgjson.com/api/v5). Last verified against
`5.3.0+20260819` (2026-08-19).

## Universes

A universe is one Universes Beyond property. Its **precons** come from the
Commander product; its **card pool** is every playable set in that property,
because a card printed elsewhere in the same universe is a legal upgrade for
these decks — Elven Council (GU) can take any green or blue card from The
Hobbit, not just from LTC.

Only playable set codes are listed. Art series, front cards, scene-box art,
promos and token sets (`ALTR`, `ALTC`, `PLTR`, `PLTC`, `AFIN`, `AFIC`, `PFIN`,
`RFIN`, `ASPM`, `PSPM`, `LMAR`, `AMSH`, `FMSC`, `ATMT`, `FTMC`) are excluded —
none of them is a card you can put in a deck.

### Middle-Earth — 4 precons from LTC

| Code | Set | Released | Kind |
|---|---|---|---|
| `LTC` | Tales of Middle-earth Commander | 2023-06-23 | commander |
| `LTR` | The Lord of the Rings: Tales of Middle-earth | 2023-06-23 | draft innovation |
| `HOB` | The Hobbit | 2026-08-14 | expansion |
| `HOC` | The Hobbit Eternal | 2026-08-14 | eternal |

The Hobbit shipped **no Commander precons** — that product slot went to two
Scene Boxes (*Crack the Plates*, *Treasures of Smaug*), whose eternal-legal
cards make up `HOC`. So HOB/HOC add to all four LTC decks' pools without adding
a precon. The Battle of Five Armies Co-Op Kit is a 2027 product and not yet
represented.

### Final Fantasy — 4 precons from FIC

| Code | Set | Released | Kind |
|---|---|---|---|
| `FIC` | Final Fantasy Commander | 2025-06-13 | commander |
| `FIN` | Final Fantasy | 2025-06-13 | expansion |
| `FCA` | Final Fantasy: Through the Ages | 2025-06-13 | masterpiece |

### Teenage Mutant Ninja Turtles — 1 precon from TMC

| Code | Set | Released | Kind |
|---|---|---|---|
| `TMC` | Teenage Mutant Ninja Turtles Eternal | 2026-03-06 | eternal |
| `TMT` | Teenage Mutant Ninja Turtles | 2026-03-06 | expansion |
| `PZA` | Teenage Mutant Ninja Turtles Source Material | 2026-03-06 | masterpiece |

### Marvel — 4 precons from MSC

| Code | Set | Released | Kind |
|---|---|---|---|
| `MSC` | Marvel Super Heroes Commander | 2026-06-26 | commander |
| `MSH` | Marvel Super Heroes | 2026-06-26 | expansion |
| `SPM` | Marvel's Spider-Man | 2025-09-26 | expansion |
| `SPE` | Marvel's Spider-Man Eternal | 2025-09-26 | eternal |
| `MAR` | Marvel Universe | 2025-09-26 | masterpiece |

Spider-Man shipped no Commander decks, so SPM/SPE contribute cards only.

### Set order is load-bearing

The `sets` array in `universes.json` is in **printing-preference order**, not
release order: Commander decks, then the base set, then bonus sheets. ADD
candidates are deduped by card *name*, so when a name appears in more than one
set that order decides which printing wins — and therefore which `cardId` the
API stores votes against.

Appending a new set code is always safe. Inserting one ahead of an existing
entry re-points cards and orphans every vote on them.

## Card counts

**Printings** are what the set files hold: one entry per collector number after
alternate printings collapse onto a shared id. **Names** is the distinct-name
count across the whole universe, which is the real size of the pool a precon
draws from, since the ADD build keeps one row per name.

| Universe | Sets | Printings | Names |
|---|---|---|---|
| Middle-Earth | LTC 556 · LTR 834 · HOB 321 · HOC 158 | 1,869 | **841** |
| Final Fantasy | FIC 486 · FIN 585 · FCA 63 | 1,134 | **707** |
| TMNT | TMC 132 · TMT 320 · PZA 20 | 472 | **332** |
| Marvel | MSC 866 · MSH 453 · SPM 286 · SPE 26 · MAR 100 | 1,731 | **1,140** |
| | | **5,206** | **3,020** |

### Per precon

`Deck` is main board + commanders. `ADD` is the candidate list after every
filter: names already in the deck removed, colour identity a subset of the
commanders', no basic lands, nothing banned in Commander.

| Universe | Precon | Colours | Deck | ADD |
|---|---|---|---|---|
| Middle-Earth | Food and Fellowship | WBG | 88 + 2 | 400 |
| Middle-Earth | Riders of Rohan | WUR | 86 + 1 | 398 |
| Middle-Earth | Elven Council | UG | 77 + 1 | 277 |
| Middle-Earth | The Hosts of Mordor | UBR | 86 + 1 | 379 |
| Final Fantasy | Revival Trance | WBR | 98 + 1 | 338 |
| Final Fantasy | Limit Break | WRG | 99 + 1 | 319 |
| Final Fantasy | Counter Blitz | WUG | 99 + 1 | 318 |
| Final Fantasy | Scions & Spellcraft | WUB | 97 + 1 | 334 |
| TMNT | Turtle Power | WUBRG | 92 + 1 | 239 |
| Marvel | Avengers Assemble | WUR | 89 + 1 | 606 |
| Marvel | The Fantastic Four | WURG | 90 + 1 | 834 |
| Marvel | Wakanda Forever | WG | 79 + 1 | 393 |
| Marvel | Doom Prevails | UBR | 90 + 1 | 562 |
| | | | | **5,397** |

## What the import drops

**Digital-only cards.** MTG Arena rebalanced cards (`A-The One Ring`) can't be
owned in paper, and their differing name defeats the name-dedupe, so the same
card would be offered twice and votes would split. Filtered on `availability`,
so MTGO-only printings go too.

**Commander-banned cards.** Karakas (LTC) and Primeval Titan (FCA) today.
Filtered out of the **set** files only — LTC ships Karakas inside Elven Council
and The Hosts of Mordor, where it stays a legitimate CUT target. The banlist
moves on its own schedule, so a re-import is what applies an RC update.

## Dual names

Masterpiece and bonus sheets reskin existing cards: the card is printed with an
in-universe name while its Oracle name stays the original. Both are kept —
`name` is the Oracle name, `flavorName` the printed one.

| Set | Reskinned | Example (`flavorName` ← `name`) |
|---|---|---|
| `LTC` | 66 | The Party Tree ← The Great Henge |
| `FCA` | 63 | Hero of Light ← Adeline, Resplendent Cathar |
| `MSC` | 26 | Loki's Double ← Spark Double |
| `MAR` | 14 | Venom, King in Black ← Skithiryx, the Blight Dragon |
| `TMC` | 5 | Heralds of the Shredder ← Vigor |
| `PZA` | 5 | Leo's Katana ← Sword of Sinew and Steel |
| `LTR` | 2 | |

HOB, HOC, FIN, MSH, SPM and SPE have no reskins.
