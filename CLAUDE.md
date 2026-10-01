# CLAUDE.md — Kindred Wings

Read this first, then only the files the task touches. Make targeted edits (str_replace), don't regenerate whole files.

## What it is
A personal naturalist + symbolism journal for Devon (GitHub: **InquiringOwl**). San Francisco birds first, then "Beyond birds" (animals met as signs: art, dreams, words), trees later. Devon believes in signs and a meaningful universe — treat that sincerely, never skeptically.

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
| `index.html` | Page shell: header emblem, vine, tabs (Birds of SF / Beyond birds / My sightings / Settings), dialog, toast. Script load order matters. |
| `css/style.css` | All styles and theme tokens (light + dark). |
| `js/version.js` | `APP_VERSION` — written by the release script only. |
| `js/data.js` | `BIRDS`, `YOUNG` (juvenile palettes+notes), `BEYOND`, `SIZES`, `COLORS`, `SRC` labels, `LEN` (cm, for size sort), `sortList`. **Most content jobs only touch this file.** |
| `js/platform.js` | Storage (localStorage), photos (IndexedDB), backups (export/import merge), optional Anthropic API (`MODELS`), iNaturalist photo lookup. |
| `js/art.js` | `birdSVG` (parametric bird medallions), `tileFrame` + `ART` (hand-drawn tile animals), `cleanSVG`, `animalArt`, `drawAnimal` (Claude paints custom animals). |
| `js/app.js` | Helpers, filters/grid, Beyond tab, log, settings, detail sheet, startup. |
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
  sightings: [{id, animalId, date:"YYYY-MM-DD", sex:"m|f|y|a|?", place:"home|park|other|", placeText, how, note, t}],
  meanings:  { animalId: [{keys:[..], text, month:"YYYY-MM", t, reset?:true}] },   // last non-reset entry wins
  custom:    [{id:"c-…", name, size, custom:true, emoji?, svg?, sym:{keys, why, src:"mine"}}],
  photos:    { animalId: { m|f|y|a: photoId } }    // blobs live in IndexedDB "kindred-wings"/"photos"
}
```
Stored ISO internally; **display MM/DD/YY (dates) and MM/YY (months)**; inputs accept MM/DD/YY and MM/YY. Log month headings read "September 2026". Backups are JSON with `photoData` (data URLs); import merges, never overwrites. Never change the storage key or field names without a migration.

## Content rules
- **Symbolism**: 3 short keywords + a 2–3 sentence "why" in my own words. Draw on Ted Andrews (*Animal Speak*, *Animal Talk*, *Animal-Wise*) as much as possible but **never quote him** — paraphrase themes only. Tag each entry `src`: `andrews` (he covers the species), `family` (he covers its family; reading carried over), `folk` (not in Andrews as far as known — behavior + folklore). Be honest when unsure.
- **Birds**: accurate SF status (`months: "all"` or `"start-end"` wrapping, e.g. `"9-4"`), a `where` line naming real SF spots, sizes `tiny|small|medium|large|xlarge`, colors from `COLORS` ids, `LEN` entry in cm. Sexes: `both` if alike, else `m`/`f` + `mNote`/`fNote`. Add a `YOUNG` entry when juveniles look notably different; otherwise the app shows a muted female/adult.
- **Images**: no copyrighted photos or reproductions of artworks/characters. Real photos only from the person's own uploads or iNaturalist (credited via its attribution string). Male/female/young figures only show iNaturalist on the male/adult figure (default photo sex is unknown).
- Copy: plain, warm, sentence case, active verbs; no all-caps labels.

## Look and feel (Devon's preferences)
- Soft medium green page (`--bg #93b08a`), mellow, sweet, slightly psychedelic art nouveau / fairy / celestial / hippie, Laurel Burch–inspired (inspiration only — never copy her works). Keep it fairly simple.
- Palette: night `#1e2a4f`, gold `#e9bd4c` / soft gold `#f3d98a`, rose `#df8a7c`, teal `#3f9c9a`, lavender `#b7a3db`, paper `#e9f0dc`, ink `#1f3324`.
- Fonts: Macondo (display), Alegreya (body), Google Fonts with Georgia fallback.
- **Birds**: starry indigo medallion; everything outlined in gold `#f3d98a` 1.3px; dotted/scalloped wings, spiral ornament. **Crescent moon only on year-round birds**; seasonal birds get stars only. Grid cards are arch-topped; inside the detail sheet figures are plain rounded squares.
- **Beyond animals**: New Mexico / Southwestern painted-tile style via `tileFrame(bg, motif)` — deep ground (`#1d6a6c`, `#a8492f`, `#24345e`, `#3a5a40`, `#1d5a5c`), double gold border, zigzag trim, coral corner diamonds, motif `mesa|pines|waves|comb|flowers|steps`; flat animal shapes with gold outlines and dot/spiral/zigzag details; no moons. New hand-drawn animals go in `ART` with the same conventions.
- Male / Female / Young toggle on the grid; sort by guide order, size (both directions) or most seen.

## Features (v2.0.0)
Size + color (AND) filters, "Here in <month>", search; sort; M/F/Y toggle; detail sheet with M/F/Y figures + notes, presence ("Here all year" pill or 12-month strip), keywords → "why" pop-up with source, "Actually, to me this means…" editor (text, keywords, MM/YY, optional "Pull keywords" via Claude), meaning history + reset; add sighting (MM/DD/YY, which one, Home/Park/Other, note); Beyond birds with 12 tile animals + "Add an animal" (Claude paints a tile if a key is set; Redraw); own photos per figure, shown on hover/tap; iNaturalist photos on hover (toggle in Settings); My sightings log grouped by month with filters; Settings: version + check for updates, backup save/load, real-photo toggle, Anthropic API key (stored only in browser). Installable (manifest + icons), works offline.

## Testing
`python3 -m http.server 8765 &` then `python3 tools/smoke.py` (both widths, every bird/animal, sighting + meaning, screenshots in `tools/shots/`). Also `node --check` each JS file. Fix any JS error before handing back.

## Ideas / next
Trees of SF (new tab + data file), map of sighting spots, more Beyond animals in `ART`, dreams/sign journal prompts, monthly "who's in town" view, SF bird calls (would need licensed audio).
