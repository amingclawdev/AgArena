# AgArena

A local field intelligence demo based on the research in the repository’s root `docs/`. Inspect synthetic fields, forecast timing and provenance, and missing evidence in a responsive map/list workspace.

## Run

Requires Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. The server binds to loopback only. All fields, geography, observations and weather are synthetic. The map is an offline schematic, not a geographic basemap or navigation tool.

```sh
npm run verify
```

Runs TypeScript checking, domain tests and the Vite production client build. `npm run dev` serves the application and API together; the generated `dist/` is the client only, not a standalone backend deployment.

## Try the workflow

1. Select North field on the map or in the keyboard-accessible field list.
2. Open “Explore the evidence” to inspect initialization, issue, availability, ingestion, valid times and native resolution.
3. Change the forecast horizon to compare six-hour rain intervals.
4. Use the replay lab to select 13:00 UTC: the delayed noon cycle is excluded. Select the next day to see stale data.
5. Choose missing, withdrawn or unsupported evidence and see an explicit unknown state.
6. Switch to Beta farms: Alpha's fields and derived endpoints are inaccessible from that session.
7. Export a JSON snapshot with the same authorization and replay rules.

The temperature unit button switches Celsius/Fahrenheit. Search filters the authorized field list. Zoom and reset operate the schematic map.

## Architecture and limits

React/TypeScript client and Node HTTP API. This uses the small TypeScript-service option in `../../docs/RESEARCH_AJM.md`; it deviates from the later blueprint's Rust/Python/PostGIS target because the local Rust toolchain is unavailable. See `docs/decisions.md`.

Sessions are random HttpOnly, SameSite cookies, with server-side tenant checks and no-store API responses. The local session picker deliberately lets anyone at this machine choose either **synthetic** tenant. It is not production authentication. Restart clears sessions. No private responses are cached, and no user data is persisted.

This implements a bounded R0 prototype, not all WP-01–04 deliverables: field creation, spatial validation, persistent storage, ingestion workers, schema registry, live providers and production identity remain unimplemented. There are no agronomic risk models, notifications or Arena settlement. The optional @WxOntario connector is described below and is disabled until configured. Source withdrawal is a fixture scenario, not a persistent administrative operation. Demo freshness limit is 18 hours, not a validated provider policy.

## Layout

- `apps/web/src/`: responsive client and styles
- `server/domain.mjs`: synthetic evidence, tenant policy, temporal replay
- `server/index.mjs`: loopback API and Vite server
- `tests/`: domain and HTTP boundary checks
- `docs/`: original research, scope decisions and verification report

Rollback: remove the new app/server/test/manifests and restore README from git. Original research is unchanged. No infrastructure or external resources are created.

## @WxOntario X source

The Ontario weather reports panel now has an official X API adapter for exactly `@WxOntario`. It is **not yet connected** until your developer token and read authorization are configured. The account identity is checked through X's username lookup on the first fetch; public profile retrieval was unavailable during development, so account existence and live access have not been verified.

1. Copy `.env.example` to `.env` and set `X_BEARER_TOKEN` locally. Do not put the token in chat or a `VITE_` variable.
2. Review your X app's endpoint access, pricing and permission for this local display/analysis. Set `X_READS_ENABLED=true` only after approving the bounded request.
3. Restart `npm run dev`, then select “Fetch up to 5 posts”. Each server start allows **one attempt**, comprising one username lookup and one timeline request for at most five posts. Failures consume the attempt. Restarting resets this allowance; it is not a persistent billing cap.

No automatic upstream polling, pagination, retries, scraping, image analysis or LLM processing. The panel only assigns transparent weather-keyword tags and preserves source links/publication times. Quoted material is not independent corroboration; geography and observation time are not inferred. Reports never change synthetic field forecasts or settle questions.

Post snapshots remain in server memory for at most 15 minutes of serving; the panel checks local status each minute and hides expired content. Restart clears them. No archive, export or long-term derived dataset is created. Before enabling continuous or production use, implement a reviewed retention/deletion workflow and persistent usage budget. The source is public regional context shared across the two synthetic demo organizations, with session authentication required.

Official endpoint documentation: [X user timeline](https://docs.x.com/x-api/users/get-posts) and [username lookup tutorial](https://docs.x.com/tutorials/explore-a-users-posts). Source requirements are in the original blueprint §§6 and 8.

This prototype is intentionally isolated from the main application. All commands above run from `prototypes/fady-mvp`. The repository root’s Vite configuration, dependencies and app remain unchanged.
