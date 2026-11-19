[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/tuyulsembilandua-beep/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/tuyulsembilandua-beep/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA VI · PS5

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: the official list with its names, descriptions and grades, a checklist saved in the browser, a roadmap to the platinum, the missable trophies flagged, and a guide to every trophy that cites its sources.

## What it is

- **Tracker** — all 55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden) with their official name, description and grade. Tick trophies off; progress is saved in the browser (localStorage), and can be exported to a file and imported back.
- **Filters & spoilers** — filter by kind (story, missable, collectibles, activities, crime & money, side & exploration) and by grade, search by name or keyword, and turn on “Hide story spoilers” to keep hidden story trophies nameless until you earn them.
- **Roadmap to the platinum** — six stages in play order, built from the official descriptions: story, strangers, exploration, activities, crime & money, then the 100% cleanup.
- **Missables** — 22 trophies flagged from the official descriptions, with the reason beside each: named missions and hidden one-off moments where no replay is named.
- **Cited guides** — every trophy's guide is written in our own words from its official description, and names its sources (Exophase for the official list, PSNProfiles as the cross-check and for the counts PSN tracks).

## How honest it is

The game launched on 19 Nov 2026 and no complete verified guide exists yet. Where a description names a mission, a count or an activity, the guide says how to approach it. Where no location has been verified, the guide says so instead of inventing one. Trophy names, descriptions, grades and hidden flags are PlayStation's official list as published on Exophase and PSNProfiles on 18 Nov 2026.

## Run it

Static files, no build step — serve `app/` with any static server and open `index.html`:

```sh
node serve.ts   # serves app/ on http://localhost:8080
```

It works with the network off: every file it loads is one of its own.

## Layout

- `app/index.html` — the page shell: header and progress, tabs, toolbar
- `app/css/base.css` — the paper theme
- `app/js/main.js` — boot, tabs, toolbar wiring
- `app/js/data.js` — loading `app/data/trophies.json`
- `app/js/store.js` — saved progress, export and import
- `app/js/filters.js` — kind/grade/search filters and the spoiler rule
- `app/js/views.js` — the tracker list and the guide detail pane
- `app/js/roadmap.js` — the roadmap stages and the missables page
- `app/data/trophies.json` — the 55 trophies with their official data and our guides
- `main.ts` — the hand-in program (Node 22): copies `app/` and `screenshots/` to `/output` and writes `dossier.json`

## License

MIT — see [LICENSE](LICENSE). Unofficial and open source; not affiliated with Rockstar Games or Sony Interactive Entertainment. No Rockstar logo, artwork or game imagery is used.
