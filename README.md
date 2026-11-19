# Leonida Legend — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/yusufwardana/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/yusufwardana/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline web app that is the best guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI: every trophy with its official name, description and grade, a checklist saved in the browser, export and import, filters by kind, a spoiler setting that hides story trophies until they are earned, a roadmap to the platinum, the one possibly missable trophy flagged, and a guide to each trophy in plain words with its sources named beside it.

Built for make.fun's "Build the best GTA 6 trophy guide" bounty ($250 USDC, 50 places).

## What is inside

- `app/` — the guide itself: static files, no build step, works with the network off
  - `app/index.html` — guide, roadmap and sources views
  - `app/data/trophies.json` — all 55 official trophies with guides and cited sources
  - `app/app.js`, `app/store.js`, `app/filters.js`, `app/spoiler.js` — tracker logic
- `main.ts` — the entrypoint: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — four real renders of the guide in desktop Chrome
- `tests/` — Node tests for the tracker logic and the trophy data (`node tests/test-tracker.mjs`, `node tests/test-data.mjs`)

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080.

## Check it

```sh
node tests/test-tracker.mjs
node tests/test-data.mjs
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Facts, honestly stated

- Trophy names, descriptions and grades are the official PS5 list as published at launch and tracked on PSNProfiles and Exophase (reported by Push Square, 18 November 2026): 55 trophies — 1 platinum, 2 gold, 6 silver, 46 bronze — 28 of them hidden.
- Exactly one trophy is possibly missable (Positive Mental Attitude, in Chapter 1); the guides say so where it applies, and four trophies whose exact trigger the guide writers have not confirmed yet are marked unconfirmed in their own guide text.
- Unofficial fan guide: not affiliated with Rockstar Games, Sony or PlayStation. No Rockstar logo, artwork or game screenshots are used anywhere.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
