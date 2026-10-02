# CLAUDE.md — Kindred Creatures (repo: kindred-wings)

Read this first, then only the files the task touches. Make targeted edits (str_replace), don't regenerate whole files.

## What it is
A personal naturalist + symbolism journal for Devon (GitHub: **InquiringOwl**), renamed **Kindred Creatures** in v3.0.0. Twelve sections in six tabs (Birds, Animals, Insects, Trees, Flowers, Greenery), each split Local (SF) / around the world: Local birds · Birds · Local animals · Animals · Local insects · Insects · Local trees · Trees · Local flowers · Flowers · Other greenery · Non-local bushes. Plus My sightings (map), Laws, Settings. Devon is a law student and believes in signs and a meaningful universe — treat both sincerely. The repo, Pages URL and localStorage key keep the old "kindred-wings" name on purpose (renaming breaks installs and links).

- Live app: https://inquiringowl.github.io/kindred-wings/ (GitHub Pages, public repo `InquiringOwl/kindred-wings`, branch `main`)
- Mac: **Ashley's MacBook Pro** (macOS user `ashleyhoffmann`, Apple Silicon). Repo folder: `/Users/ashleyhoffmann/Documents/kindred-wings` (`~/Documents/kindred-wings`). Devon pushes from Terminal (zsh) as InquiringOwl with a personal access token that has `repo` and `workflow` scopes.
- The journal lives in the browser of whichever Mac account opens the app; moving between accounts or Macs = Settings › Save / Load a backup file.
- Legacy: Claude artifact https://claude.ai/artifact/KrhY7qXoJs9CgPziDNvuLg (v1.x, frozen; only use it to export a backup). **The repo is the source of truth.**

## Giving Devon Terminal commands
- One command per code block line, and say "paste one line at a time, press Return after each".
- Keep long commands on a single line (e.g. `git remote add origin https://github.com/InquiringOwl/kindred-wings.git`); pasting has split them before. If a line might wrap, suggest typing the first part and pasting only the URL.
- Always start with `cd ~/Documents/kindred-wings` — a bare folder path gives `zsh: permission denied`.
- Explain what success looks like (e.g. `ls` shows `index.html`, `CLAUDE.md`, `js`, `scripts`) and the one or two likely errors.
- Token prompts: username `InquiringOwl`, password = the token (nothing shows while pasting).

## Before starting any job
1. Check GitHub for newer commits than the Mac folder (`curl -s https://api.github.com/repos/InquiringOwl/kindred-wings/commits/main`). If Devon's folder is behind, have him `git pull` first.
2. One feature per session; don't run two sessions on the same files.
3. If a device shell is connected, read/edit files there but **don't run git from it** (it leaves `.git/index.lock`). Devon runs git/release in Terminal.
4. The device shell can't run Playwright; tar the repo to the cloud container to run `tools/smoke.py`.

## Files
| File | Holds |
|---|---|
| `index.html` | Page shell: header emblem, vine, tabs (Birds, Animals, Insects, Trees, Flowers, Greenery · My sightings, Laws, Settings), dialog, toast. Script load order matters. |
| `css/style.css` | All styles and theme tokens (light + dark). |
| `js/version.js` | `APP_VERSION` — written by the release script only. |
| `js/laws.js` | `LAWS` (species-level rules by key: `lv` F/S/C, name, short, what, allows, penalty, note, cite; `info:true` = informational, no badge) and `OVERALL` (rules for whole groups, shown on the Laws tab). ✓ in a cite = checked against code text 10/02/26. |
| `js/creatures.js` | `NEW` — 165 entries for the 11 new sections (id, cat, name, sci, size, where, art params, sym, law [LAWS keys], ln {key: species note}, and for local plants uses/harvest/caution); `LAW_EXTRA` (laws for the original Beyond animals); `INAT_NEW` (checked photos, merged into `INAT`). **Most content jobs touch this file.** |
| `js/fauna.js` | `critterSVG` (parametric tiles: quad, seal, cetacean, otter, frog, snake, crab, octopus, bat, turtle, ape) and `insectSVG` (butterfly, moth, bee, beetle, dragonfly, ant, mantis, cicada, cricket, locust, stick). |
| `js/flora.js` | `plantFrame` (celestial garden window with a sun — never a moon), `treeSVG`, `flowerSVG`, `shrubSVG`, `plantArt`. |
| `js/data.js` | `BIRDS`, `YOUNG` (juvenile palettes+notes), `BEYOND`, `SIZES`, `COLORS`, `SRC` labels, `LEN` (cm, for size sort), `sortList`, `INAT` (hand-checked iNaturalist photo per built-in bird/animal) + `INAT_AS` (which species stands in for a Beyond animal). **Most content jobs only touch this file.** |
| `js/platform.js` | Storage (localStorage), photos (IndexedDB), backups (export/import merge), optional Anthropic API (`MODELS`), iNaturalist photo lookup. |
| `js/map.js` | `SFMAP` (simplified SF outline, Presidio, Golden Gate Park, neighborhood lines + labels), `MAP_EXTRA` (hand-placed lakes/hills), `sfMapSVG(pins)`, `mountMap` (pan/zoom/pinch, tap to drop a pin). Projection `mapXY(lat,lng)` / `mapLatLng(x,y)`. |
| `js/art.js` | `birdSVG` (parametric bird medallions), `tileFrame` + `ART` (hand-drawn tile animals), `cleanSVG`, `animalArt`, `drawAnimal` (Claude paints custom animals). |
| `js/app.js` | `GROUPS`/`CATS` (sections), `catOf`/`kindOf`, `artOf` (one entry point for every drawing), `lawsOf`/`lawBadges` (bird laws are computed by rule for the 57 SF birds), grid + filters (incl. MBTA / F / S / C), add form for any section, Laws tab, detail sheet (meaning confirm, plant uses, protections), log + map, settings, startup. |
| `js/updater.js` | Service worker registration + version.json polling + update banner. |
| `sw.js` | Network-first cache, `VERSION` written by release script. |
| `version.json`, `CHANGELOG.md` | Written by the release script. |
| `.github/workflows/pages.yml` | On push to main: syntax + version-match check, deploy to Pages. |
| `scripts/release.sh` | `scripts/release.sh patch|minor|major|X.Y.Z "notes"` |
| `tools/smoke.py` | Playwright smoke test (cloud container). |

All JS files are plain scripts sharing globals (no build step, no modules, no npm). Keep it that way.

## Release / auto-update
- Devon: `cd ~/Documents/kindred-wings && scripts/release.sh patch "What changed"` → bumps versions, CHANGELOG, commits, tags `vX.Y.Z`, pushes. Pages deploys in ~1 min.
- Open copies check `version.json` at launch, every 30 min and on focus; a banner offers "Update now" (clears caches, reloads).
- Pages must stay set to Settings › Pages › Source: **GitHub Actions**. Repo must stay public (free Pages).
- patch = fixes/content tweaks; minor = new features or new groups of animals.

## Data model (localStorage key `kindred-wings-v1`)
```
state = {
  sightings: [{id, animalId, date:"YYYY-MM-DD", sex:"m|f|y|a|?", place:"home|park|other|", placeText, how, note, t, lat?, lng?}],   // lat/lng = map pin
  meanings:  { animalId: [{keys:[..], text, month:"YYYY-MM", t, reset?:true, confirmed?:true}] },   // last non-reset entry wins; confirmed = "yes, the suggestion is mine"
  custom:    [{id:"c-…", cat?, name, size, colors?, months?, where?, uses?, harvest?, custom:true, emoji?, svg?, sym:{keys, why, src:"mine"}},
              {id:"c-…", kind:"bird", cat?, name, size, shape, colors:[..], months, where, both:{palette}, custom:true, sym}],  // no cat = old data: kind bird → "bird-local", else "animal"
  notes:     { id: { uses|harvest: {text, confirmed?, month, t} } },   // your versions of plant uses (v3)
  photos:    { animalId: { m|f|y|a|cover: photoId } }    // blobs in IndexedDB "kindred-wings"/"photos"; cover = added bird's cover photo
}
```
Stored ISO internally; **display MM/DD/YY (dates) and MM/YY (months)**; inputs accept MM/DD/YY and MM/YY. Log month headings read "September 2026". Backups are JSON with `photoData` (data URLs); import merges, never overwrites. Never change the storage key or field names without a migration.

## Content rules
- **Suggested vs. yours**: suggested meanings, uses and harvest notes show in *italics*; once Devon confirms ("Yes, this is what it means to me") or rewrites one it shows upright with a gold rule. No checkmarks.
- **Laws**: species-specific rules go in an entry's `law` (+ `ln` notes); rules that cover everyone (SF significant trees, park picking ban, nest rule…) go in `OVERALL`, not on every card. Keep summaries plain and cite the section; mark ✓ only after reading the current code text. Not legal advice — say so. Statuses change (monarch decision due by 6/6/2030; bumble bees are CESA candidates; Zone 0 adopted 8/19/26 but in flux) — re-check before editing.
- **Plants**: local plants carry `uses`, `harvest`, `caution`. Always include toxic look-alikes (poison hemlock!) and remind that picking in SF parks or on others' land is illegal (Park Code § 4.06, Penal Code § 384a). Plant `src` is `lore` (flower/tree lore; Andrews' *Nature-Speak* may cover it).
- **Symbolism**: 3 short keywords + a 2–3 sentence "why" in my own words. Draw on Ted Andrews (*Animal Speak*, *Animal Talk*, *Animal-Wise*) as much as possible but **never quote him** — paraphrase themes only. Tag each entry `src`: `andrews` (he covers the species), `family` (he covers its family; reading carried over), `folk` (not in Andrews as far as known — behavior + folklore). Be honest when unsure.
- **Birds**: accurate SF status (`months: "all"` or `"start-end"` wrapping, e.g. `"9-4"`), a `where` line naming real SF spots, sizes `tiny|small|medium|large|xlarge`, colors from `COLORS` ids, `LEN` entry in cm. Sexes: `both` if alike, else `m`/`f` + `mNote`/`fNote`. Add a `YOUNG` entry when juveniles look notably different; otherwise the app shows a muted female/adult.
- **Real photos** for built-ins are pinned in `INAT` (taxon id, photo id, attribution) — checked by eye 10/01/26 (right species, male/adult, CC-licensed only). Never look up a built-in by name: "Lion" once matched a dandelion. Added birds/animals are searched by name but only accept Aves (birds) / animal groups.
- **Photo uploads**: JPG, PNG, WebP, GIF (HEIC in Safari), max 15 MB (`PHOTO_MAX_MB`), shrunk to 1400 px JPG. Covers fill the 5×4 drawing frame.
- **Images**: no copyrighted photos or reproductions of artworks/characters. Real photos only from the person's own uploads or iNaturalist (credited via its attribution string). Male/female/young figures only show iNaturalist on the male/adult figure (default photo sex is unknown).
- Copy: plain, warm, sentence case, active verbs; no all-caps labels.

## Look and feel (Devon's preferences)
- Soft medium green page (`--bg #93b08a`), mellow, sweet, slightly psychedelic art nouveau / fairy / celestial / hippie, Laurel Burch–inspired (inspiration only — never copy her works). Keep it fairly simple.
- Palette: night `#1e2a4f`, gold `#e9bd4c` / soft gold `#f3d98a`, rose `#df8a7c`, teal `#3f9c9a`, lavender `#b7a3db`, paper `#e9f0dc`, ink `#1f3324`.
- Fonts: Macondo for titles, tabs, headings and card names; Nunito (clear sans-serif) for everything else (v3 — Devon asked for serif-free body text). Google Fonts.
- **Birds**: starry indigo medallion; everything outlined in gold `#f3d98a` 1.3px; dotted/scalloped wings, spiral ornament. **Crescent moon only on year-round birds**; seasonal birds get stars only. Grid cards are arch-topped; inside the detail sheet figures are plain rounded squares.
- **Beyond animals**: New Mexico / Southwestern painted-tile style via `tileFrame(bg, motif)` — deep ground (`#1d6a6c`, `#a8492f`, `#24345e`, `#3a5a40`, `#1d5a5c`), double gold border, zigzag trim, coral corner diamonds, motif `mesa|pines|waves|comb|flowers|steps`; flat animal shapes with gold outlines and dot/spiral/zigzag details; no moons. New hand-drawn animals go in `ART` with the same conventions.
- Male / Female / Young toggle on the grid; sort by guide order, size (both directions) or most seen.

## Added in v3.0.0
Renamed Kindred Creatures; 12 sections (165 new entries with drawings, checked iNaturalist photos, meanings, legal tags; herbal uses/harvest/caution for local plants); F/S/C protection badges with hover/tap summaries; "Protected" filter incl. Migratory Bird Treaty Act; Laws tab (species index + group rules); confirm-a-suggestion for meanings and plant uses; add form in every section; leaf pins for plants on the map; Nunito body font.

## Added in v2.1.0
Verified iNaturalist photos; Macondo body text; "Add a bird" on Birds of SF (name, size, shape, up to 3 colors → medallion, when in SF, where, keywords, meaning, cover photo, real hover photo; size/format rules shown); My sightings map of SF with bird pins (star pins for Beyond), Drop/Move/Remove pin, "Then drop a pin" option when adding a sighting.

## Features (v2.0.0)
Size + color (AND) filters, "Here in <month>", search; sort; M/F/Y toggle; detail sheet with M/F/Y figures + notes, presence ("Here all year" pill or 12-month strip), keywords → "why" pop-up with source, "Actually, to me this means…" editor (text, keywords, MM/YY, optional "Pull keywords" via Claude), meaning history + reset; add sighting (MM/DD/YY, which one, Home/Park/Other, note); Beyond birds with 12 tile animals + "Add an animal" (Claude paints a tile if a key is set; Redraw); own photos per figure, shown on hover/tap; iNaturalist photos on hover (toggle in Settings); My sightings log grouped by month with filters; Settings: version + check for updates, backup save/load, real-photo toggle, Anthropic API key (stored only in browser). Installable (manifest + icons), works offline.

## Testing
`python3 -m http.server 8765 &` then `python3 tools/smoke.py` (KW_FONT / KW_FONT_SANS / KW_FONT_SANS_I = local Macondo / Nunito ttfs if Google Fonts is blocked; KW_OFFLINE=1 skips iNaturalist images; run with a long timeout — it opens all 222 entries at two widths) (both widths, every bird/animal, sighting + meaning, screenshots in `tools/shots/`). Also `node --check` each JS file. Fix any JS error before handing back.

## Ideas / next
more local trees/plants, fish and mushrooms sections, per-species nesting seasons, more Beyond animals in `ART`, dreams/sign journal prompts, monthly "who's in town" view, SF bird calls (would need licensed audio).
