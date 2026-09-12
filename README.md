# AgArena

A local field-intelligence prototype: inspect a field, understand its weather evidence, and see when the answer is unknown.

## Run locally

Requires Node.js 22.13+ and npm. The capture backend uses built-in SQLite.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. The API binds to http://127.0.0.1:8787. Both ports are fixed; stop the existing process before starting another instance.

The main field workspace displays real Esri World Imagery satellite tiles (default) or OpenStreetMap street tiles beneath synthetic demo field boundaries and weather. Imagery is a basemap, not live weather or evidence for the replay date. Tiles require an internet connection; attribution is displayed on the map. No keys, paid feeds, database, or model calls are needed for the synthetic workspace. Demo tenant selection is a local testing control, not production authentication. Do not expose these servers or add private farm data.

## Try the first slice

1. Select North field and inspect its rainfall outlook.
2. Open “Inspect the evidence” to see source, support, and publication/availability/ingestion times.
3. Change decision time from 15:00 to 12:00 UTC. The delayed forecast is excluded.
4. Choose missing, stale, or withdrawn forecast. The outlook becomes unknown.
5. Switch demo tenant to Beta. Only Birch field is returned by the API.

## Verify

```sh
npm run verify
```

Runs domain/HTTP tests, TypeScript checks, and the Vite production build. This does not verify production authentication, live forecasts, or WebMCP invocation. The API fixture state is in memory and resets on restart. For the built application, run `npm start` after the build and open [localhost:8787](http://127.0.0.1:8787/). The same server serves the UI and both API workflows. Run either development mode or the built server, since both use port 8787. Also run `npm run test:e2e` to verify the capture/import workflow.

## Implementation and research

[RESEARCH_AJM.md](docs/RESEARCH_AJM.md) contains the consolidated v0.1 scope and maps decisions back to the team's research. [AGARENA_BUILD_BLUEPRINT.md](docs/AGARENA_BUILD_BLUEPRINT.md) remains a broader proposed system, not a claim that those services are implemented.

- `src/`: React map, field list, outlook and evidence inspector.
- `shared/`: TypeScript contracts and validated query schema.
- `server/`: tenant-scoped synthetic field API plus the existing persistent capture/provider API.
- `tests/`: deterministic domain and HTTP boundary tests.

The field workspace uses synthetic weather and local demo sessions. The separate [live capture workspace](http://127.0.0.1:8787/capture) retains browser-assisted collection, SQLite evidence, Open-Meteo guidance and prospective comparison scoring from main; see [the capture runbook](docs/CAPTURE_WORKFLOW.md). It does not start an unattended agent. Live captures and synthetic field fixtures remain separate.

## Real analyst example

Open http://127.0.0.1:5173/examples/monkton for a manually reviewed WxOntario post sharing Justin M's satellite analysis of the September 2, 2026 Monkton storm. A separate NTP survey supplies the coordinates for a derived, approximately 500 m padded location envelope. This polygon is not an official damage boundary or current warning.

This page loads the source image from X and basemap tiles from OpenStreetMap, with attribution. It is separate from the synthetic fields. It is one researched case, not an automated social feed or proof of forecast skill. The polygon can be downloaded as GeoJSON with source and method metadata.

### Analyst watch

The field page includes an [analyst watch](http://127.0.0.1:5173/#analyst-watch): five additional accounts alongside WxOntario, nine source notes, two forecast comparisons, and historical storm/satellite evidence. Use the case tabs, analyst filter and Forecasts only toggle; expand the shortlist for connection provenance. The Monkton case links to the satellite image and polygon.

This is a manually reviewed September 12, 2026 snapshot. Mutual follows are unverified (X required login); three direct public interactions and two adjacent indexed connections underpin the provisional shortlist. Source posts and articles were checked directly for the insights. Forecasts, observations and retrospective analysis remain distinct. No live X polling, automated synthesis, accuracy score or field-level inference is implemented. Public case studies are independent of synthetic replay controls.

### Official-agency comparison

Analyst cases and the Monkton map now show an Environment Canada baseline. September 12 has a directly captured Toronto forecast with downloadable provenance; September 9 and the September 2 outbreak use explicitly labeled indexed historical evidence. Monkton’s matched historical agency forecast/warning remains missing, separate from the NTP outcome reference. Official source URLs can change; this is a reviewed snapshot, not live alert delivery or forecast-skill scoring. The Met Office is identified as the UK counterpart for future UK cases.

### Leaderboard UI preview

Open [Forecast Arena](http://127.0.0.1:5173/leaderboard) from the main navigation. The leaderboard includes the six community sources and a distinct Environment Canada reference row, category tabs, region/window scope controls, search, source-type filters, metric column visibility, proposed metric definitions and source-detail dialogs. Mobile uses a horizontally scrollable table.

Simulated scoring is enabled by default: fictional category scorecards show ranks, score bars, point differences against a fictional Environment Canada baseline, calibration, lead time and synthetic case counts. Every score is a UI fixture, not analyst performance. Category tabs switch fixtures; region/window controls only preview scope. Hide demo scores returns to the unranked roster. No real forecast evaluation or scoring API has been added.

### Storm comparison

`/comparison` compares the September 2 outbreak, September 9 storms and Monkton evidence across severity, geography, publication and valid windows. Environment Canada remains visible as the official reference while analyst and forecast-only filters narrow the roster. Post-event evidence and missing records are explicit. Historical warning provenance remains provisional; no measured lead-time advantage or accuracy ranking is asserted. Fictional leaderboard scores are not used here.
