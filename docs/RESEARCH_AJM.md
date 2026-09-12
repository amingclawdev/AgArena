# AgArena Research

## Local v0.1 consolidation — September 12, 2026

This section is the implementation scope for the local scaffold. Earlier architecture options below and the team's blueprint remain research proposals where they exceed this scope. The user authorized consolidation and local scaffolding; this does not approve a live pilot or every blueprint ADR.

### Decisions for this slice

| Research input  | Carried into v0.1                                                                                                             | Deferred                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| AJM / CoMapper  | React + Vite + MapLibre; shared selection and evidence state; list equivalent to map                                          | Live WebMCP registration and server-side agent runs                                                |
| FH              | Ontario-area context; explicit source availability; weather before pest/social inference                                      | CHU, species thresholds, GLMPMN and X ingestion until verified                                     |
| AC              | Field intelligence before participation; distinguish forecast from observation; transparent provenance                        | Multi-region ontology, scientific workers, forecast league                                         |
| Build blueprint | Synthetic tenants/fields; separate publication and ingestion; replay cutoff; stale/missing/withdrawn states; API access tests | Full Rust/Python/PostGIS stack, durable identity, source rights machinery, production G1-G7 claims |

The blueprint proposes Rust/Python and GitLab without having inspected this repository. For the authorized local scaffold, one TypeScript application reduces setup work and preserves the CoMapper-compatible frontend. Keep this GitHub repository. No port of CoMapper code or data was made; the shared-state architecture informed the new implementation.

### Implemented shape

- `shared/contracts.ts`: typed evidence, field, and brief contracts; validated replay query.
- `server/domain.ts`: synthetic field store and deterministic, tenant-filtered evidence replay.
- `server/app.ts`: read-only field/brief API plus explicitly local demo-session setup. No cache, tile, export, or write API is exposed.
- `src/App.tsx`: field list, outlook, rainfall interval chart, evidence drawer, replay and demo-tenant controls.
- `src/FieldMap.tsx`: MapLibre with satellite/street basemaps; field boundaries remain synthetic, not real farm geometry.
- `tests/`: domain and HTTP cases covering access, replay, unknown states, and malformed queries.

First workflow: select North field, inspect its 3 km model forecast, open the evidence, compare 12:00 with 15:00 UTC, then simulate source failure. Switch to Beta to see a different authorized field set. The old local report remains stale and cannot verify present field conditions.

### Explicit limitations

This is a read-only fixture prototype, not completion of the blueprint's entire first-slice checklist. There is no database, field creation, real authentication, live data, LLM execution, WebMCP invocation, scientific calibration, forecast submission, settlement, or deployment. Demo tenant selection intentionally lets the local operator choose either synthetic identity; API tests prove filtering of an assigned session, not production identity assurance. The server requires `AGARENA_DEMO=1` and binds to loopback. Fixtures and dates are fixed, not current forecasts.

The missing/stale/withdrawn controls simulate source states, not an implemented source-registry lifecycle. Withdrawal excludes forecast evidence in that scenario; durable correction and historical withdrawal policies remain future work. No private real data belongs in this scaffold.

Next integration should prove a live weather adapter and a bounded evidence-grounded agent action against these contracts. Add durable identity/storage before real reports or a league. Live WebMCP needs direct host-tool verification, separately from browser UI tests.

### Local verification evidence

- `npm run verify`: 12 tests covering domain/HTTP boundaries, source comparisons, geometry and official evidence, plus strict TypeScript checking and a production frontend build.
- Desktop browser at 1440×1050: field map renders, evidence drawer shows forecast cycle and source times; replay changed accumulation from 9.8 to 2.5 mm.
- Withdrawn source: unknown state and no rainfall total.
- Beta session: only Birch field returned; Alpha field IDs rejected by API tests.
- Phone browser at 390×844: document width remains 390 pixels; field selection and controls remain available.
- MapLibre 6 worker is explicitly bundled with Vite's worker URL import; the original relative worker URL failed under dependency optimization. Production build now emits the worker asset.
- Build reports a large MapLibre-containing JavaScript chunk (~1.26 MB uncompressed); map code splitting remains an optimization for the next slice.
- These checks do not prove real-world forecasting skill, production tenant security, or an agent/WebMCP integration.

Research sources retained: [FH](research_fh.md), [AC](research_ac.txt), and [proposed blueprint](AGARENA_BUILD_BLUEPRINT.md). Earlier source inspection notes below retain their original scope and date.

Status: discovery and interview notes, with a source-backed architecture pass added on 2026-09-12. Proposed ideas below are not agreed requirements.

## Confirmed direction

- Agricultural prediction markets app for a hackathon, called AgArena.
- Hyper-local weather forecasting is the initial focus.
- Explore OpenAI agents and Codex; their product and development roles remain to be defined.

## Problem hypothesis

A farmer may observe conditions that differ from a forecast for the surrounding area. AgArena could make those disagreements visible, gather local evidence, and compare explicit predictions against observed outcomes.

We have not yet established whether this improves forecast accuracy or farmer decisions.

## Ideas from the audio notes

- Bring together weather forecasts, farmer observations, and competing predictions.
- Visualize locations and affected areas on a map.
- Explore reputation, forecast rankings, or a prediction market.
- Use agents to gather evidence and explain disagreements.
- Consider pest reports and wind as a possible later direction.

## Research questions

| Area              | Questions to resolve                                                               | Evidence needed                                                   |
| ----------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| User and decision | Who is the farmer, where are they, and what action depends on the forecast?        | Concrete user scenario or interview                               |
| Locality          | Does hyper-local mean a field, farm, or village?                                   | Target geography and available observation coverage               |
| Weather event     | Rain timing, rainfall amount, frost, wind, or another event? Over what horizon?    | One measurable prediction question                                |
| Forecast sources  | Which sources cover the target location at useful spatial and temporal resolution? | Provider documentation, sample responses, access and usage terms  |
| Ground truth      | How do we establish what happened at the predicted place and time?                 | Independent observations and a resolution rule                    |
| Market design     | Play-money trading, reputation stakes, or forecast comparison? Who participates?   | Agreed interaction and scoring rules                              |
| Agent role        | Researcher, contestant, explanation assistant, or another role?                    | One visible agent action that serves the user journey             |
| Evaluation        | Does combining evidence improve on a baseline forecast?                            | Timestamped forecasts, observed outcomes, and a comparison method |
| Hackathon         | What are the deadline, judging criteria, team roles, and available integrations?   | Event requirements and team agreement                             |

## Candidate demo to discuss

A farmer selects a location and a weather question. AgArena displays the source forecast alongside local reports and agent predictions, explains any disagreement, and later compares predictions with an independently observed outcome.

This is a proposed journey, not an implementation commitment. Any replay or simulated outcome must be clearly labeled.

## Evidence boundaries

- Keep provider forecasts, farmer reports, agent interpretations, and market probabilities separate.
- Record source, issue time, valid time, location, and geographic coverage where applicable.
- A map pin does not establish field-level forecast accuracy.
- An agent explanation is not an observed measurement.
- Define settlement evidence before accepting predictions; account for missing or disputed observations.

## Decisions and sources

No technology stack, weather provider, market mechanism, or demo scope selected yet.

Inputs: the user's interview responses and supplied audio transcript. This is the sole planning and research document.

## Architecture pass: borrowing from CoMapper (2026-09-12)

Recommendation for discussion: reuse CoMapper's React/Vite/MapLibre workspace and shared action pattern, then add a small TypeScript backend for weather evidence and agent runs. Keep WebMCP as a page interaction adapter. Persistent forecasts, submissions, outcomes, and scheduled work belong on the server.

### What the repository actually contains

Inspected public CoMapper main at commit `fbd4a4b1462d1b7e073d86b4ef486858c98190b1`. This was source inspection, not a build or live WebMCP test.

- React, TypeScript, Vite, MapLibre GL, Tailwind, and Zod are present in [package.json](https://github.com/mgd1984/comapper-webmcp/blob/fbd4a4b/package.json).
- The challenge path is browser-local: shared React state, an imported GeoJSON dataset, map controls, an inspector, and contextual WebMCP tools. It does not provide durable multi-user state. See [architecture](https://github.com/mgd1984/comapper-webmcp/blob/fbd4a4b/docs/architecture.md).
- The repository also contains an optional Express API, OpenAI Agents SDK dependencies, and PostgreSQL/PostGIS infrastructure from Atlas Lens. Their presence does not mean the hosted challenge flow uses them.
- The existing Cloudflare worker serves assets and a dataset endpoint; it is not already an agricultural agent backend.

### Reuse map

| CoMapper source                                                            | Potential AgArena use                                                         | Adaptation required                                                         |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `src/features/map/MapWorkspace.tsx` and map helpers                        | Select a farm or study polygon; show stations, reports, and forecast coverage | Weather layers, time selection, coverage labels, and farm semantics         |
| `src/shared/importGeoJSON.ts` and `gis.ts`                                 | Normalize spatial inputs, preserve properties and stable feature IDs          | Explicit weather units, valid times, forecast issue times, and source types |
| `src/features/inspector/InspectorPanel.tsx` and `src/shared/provenance.ts` | Inspect evidence behind a prediction                                          | Distinguish measurements, reports, forecasts, and agent interpretations     |
| `src/features/webmcp/useAtlasSiteTools.ts`                                 | Contextual tools that invoke the same actions as map controls                 | AgArena tool schemas and a tested host-specific registration adapter        |
| `src/shared/export.ts`                                                     | Export a visible evidence snapshot                                            | Include event definition, source IDs, forecast cutoff, and resolution rule  |
| WebMCP contract tests                                                      | Verify bounded actions and state-dependent tool availability                  | Add weather contracts and direct host invocation verification               |

Borrow selected modules and contracts rather than copying every dependency or the Toronto dataset. Preserve applicable license notices when copying code; inspect retained map/data attribution separately.

### Stack options

These are proposed designs, not selected requirements or validated deployments.

| Option                                       | Proposed components                                                                                                            | Best fit                                                                         | Main tradeoff                                                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| A: small TypeScript service — leading option | CoMapper-derived Vite/React/MapLibre client; Node/Express API; OpenAI Agents SDK; PostgreSQL if shared persistence is in scope | Map collaboration plus a real weather/agent evidence loop                        | API hosting and persistence need setup; background jobs are additional work                                     |
| B: Cloudflare deployment                     | Same Vite client; Workers static assets and API; D1 for bounded records; scheduled worker for refresh/resolution               | Team prefers one Cloudflare deployment and a small bounded demo                  | Port and test the agent/weather path for Workers; existing Express/PostGIS code is not a drop-in backend        |
| C: reactive shared arena                     | Same Vite client; Convex data/functions; agent calls in server actions                                                         | Several farmers or forecasters must see new submissions and rankings immediately | Introduces a different backend model; spatial queries and external agent execution still need deliberate design |

[Workers static assets](https://developers.cloudflare.com/workers/static-assets/) supports packaging frontend assets with worker code. [Convex realtime](https://docs.convex.dev/realtime) documents reactive query updates. These capabilities support the options above but do not establish an end-to-end AgArena implementation.

A Next.js rewrite is another possibility, but no current requirement establishes a need to replace the existing Vite map shell. Likewise, defer PostGIS until the demo requires server-side spatial queries beyond a bounded set of farms and nearby observations.

### Ownership and data flow

1. The farmer selects a field, weather event, and time window in the map.
2. UI controls or WebMCP tools call the same validated application actions.
3. The API retrieves and stores timestamped forecast evidence and separately identified observations.
4. A server-side agent uses bounded functions to inspect this evidence and return a structured prediction or explanation with source IDs.
5. The UI renders the result on the same map and in its evidence inspector.
6. If competition is in scope, server code locks submissions at the cutoff and applies a predefined outcome/scoring rule when independent evidence arrives.

Browser owns: camera, selection, filters, active time window, and draft presentation.
Server owns: authoritative evidence snapshots, submitted predictions, cutoffs, resolution status, scoring, credentials, and background work.

The [OpenAI Agents SDK tools guide](https://openai.github.io/openai-agents-js/guides/tools/) supports function tools and agents used as tools. Start with one orchestrator and bounded weather/evidence functions; distinct contestant agents are worthwhile only if comparing their evidence or methods is part of the agreed demo. Treat Codex as the development collaborator unless the product specifically needs runtime code execution.

### WebMCP's specific contribution

The useful borrowed interaction is: “You are showing the regional outlook; focus on this field and show why the nearby reports disagree.” The agent changes the user's current map scope and evidence view through explicit tools.

Candidate tools: `inspect_farm_workspace`, `select_farm`, `set_forecast_window`, `show_weather_evidence`, and `prepare_prediction`. Submission would call the same authenticated server operation used by the UI. A backend agent cannot be assumed to discover or operate page tools merely because both use tool schemas; an explicit bridge would be required for direct page control.

CoMapper uses `document.modelContext.registerTool` with AbortController cleanup. Confirm the selected host against the current [OpenAI Site Tools guide](https://learn.chatgpt.com/docs/webmcp) and [WebMCP draft](https://webmachinelearning.github.io/webmcp/) before copying registration code. Browser/host support and callable tool discovery must be checked directly. A status banner or automated UI click is not proof of WebMCP invocation. Keep ordinary map controls usable when page tools are unavailable. Chrome's [early-preview announcement](https://developer.chrome.com/blog/webmcp-epp) is dated February 2026 and should not be treated as a complete current compatibility matrix.

### Weather evidence and a credible demo

[Open-Meteo's Forecast API](https://open-meteo.com/en/docs) is a candidate to evaluate after choosing the geography, variable, and horizon. Check the actual model coverage, units, update timing, spatial resolution, and usage terms before selecting it. Querying a field coordinate alone does not prove field-level accuracy.

For a historical demo, preserve the information available at the prediction cutoff. The [Historical Forecast API](https://open-meteo.com/en/docs/historical-forecast-api) stitches the first hours of model runs; its documentation points to Single Runs for full horizons from individual runs. An arbitrary historical series is therefore insufficient to prove what a forecaster knew the previous day. Forecast archives also do not supply independent observed truth.

Suggested first vertical slice: one farm, one measurable rainfall question, one source forecast, one separately sourced local observation, and one agent explanation of agreement or disagreement. If showing resolution during the pitch, use a clearly labeled historical replay with a fixed evidence cutoff. A verified station or gauge must match the event's location definition; otherwise resolve a station-defined event or leave the field outcome unverified.

### What would make this an arena?

A forecast comparison board is a smaller build than a trading market. Choose explicitly:

- Comparison: save timestamped probabilities from people/agents and score them against outcomes.
- Reputation competition: add identities, a scoring history, and ranking rules.
- Play-money market: additionally define balances, positions, pricing/liquidity, transaction consistency, and settlement.

Do not silently introduce the third option while implementing the first. None is selected yet.

### Next decisions and verification

Agree on the demo's farmer decision, field/station scope, event horizon, and competition mechanism first. Then verify one live weather response, one independent observation source, one server-side agent run, and one direct WebMCP invocation that visibly updates the map. Test the ordinary UI on narrow and wide screens as well.

Research limits: public source and official documentation inspected; no dependencies installed, provider calls tested, application built, or host integration invoked. GitHub CLI authentication reported an invalid token, so authenticated PR checks were unavailable; public source was read without changing credentials. No CoMapper files or deployments were modified.

## Real analyst example: Monkton (September 12, 2026)

One manually reviewed public post, not a scraper or enabled social connector: [WxOntario post](https://x.com/WxOntario1/status/2098570326980321314). Its third attachment is a screenshot of @JustinMWeather's annotated satellite interpretation west of Monkton; attribution is preserved. The image remains hosted on X, with no local media copy or automated extraction pipeline.

The [NTP survey](https://www.uwo.ca/ntp/blog/2026/an_additional_tornado_and_downburst_in_sw_on_on_sep_2.html) independently identifies the September 2, 2026 Monkton EF1 tornado. It publishes start (43.6092 N, 81.2014 W), end (43.6111 N, 81.1412 W), and worst-damage (43.6122 N, 81.1507 W) coordinates. These anchor the location; no exact path is inferred from screenshot pixels.

`/examples/monkton` displays the source attachment alongside an OpenStreetMap basemap and a derived WGS84 polygon. The polygon encloses the three coordinates with approximate 500 m padding using a local equirectangular conversion. It is an area of interest, not an official damage extent or live warning. The screenshot's additional downburst interpretation is not converted into a confirmed damage polygon. This is retrospective geolocation, not evidence that the account forecast the event ahead of time.

The real-event page is separate from synthetic farms and forecasts. It contacts X for the image and OpenStreetMap for visible tiles, with attribution and source links. A polygon download retains method, source, event time, and derived-geometry labeling. Wider ingestion, retention, and reuse remain outside this one-example scope.

## Analyst watch: reviewed snapshot, September 12, 2026

The field workspace now includes `AnalystWatch` with five additional accounts, nine attributed source notes, and four manually matched cases. The seed data and provenance live in `shared/analyst-watch.ts`; this is a curated snapshot, not continuous X ingestion. Mutual follows could not be verified: opening WxOntario's following list redirected to X login. No follows, messages, or account changes were made.

| Shortlist                             | Selection evidence                                                                                                                       | Contribution                                                                        |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Justin M / @JustinMWeather            | [Original quote of WxOntario](https://x.com/JustinMWeather/status/2098068876953080204), directly checked                                 | Satellite interpretation and damage observations                                    |
| Alex Todd / @wkdwxON                  | [Quotes WxOntario with Tavistock timelapse](https://x.com/wkdwxON/status/2096625571639808379), directly checked                          | Time/place-qualified storm video                                                    |
| Tom Stef / @vaughanweather            | [Original reply in WxOntario's grain-bin thread](https://x.com/vaughanweather/status/2097375211582546408), directly checked              | Storm imagery and damage discussion                                                 |
| Doug Gillham / @gtaweather1           | [Indexed Tom Stef thread](https://www.sotwe.com/vaughanweather) tags both accounts; adjacent candidate, not a proven direct relationship | Date-matched GTA forecasts, verified on original X posts                            |
| Instant Weather Ontario / @IWeatherON | [Indexed Alex Todd feed](https://www.sotwe.com/wkdwxon) shares this account and WxOntario; adjacent candidate                            | Conditional severe-weather outlooks; selected forecasts attributed to Brennen Perry |

Two comparisons are supported: WxOntario versus Gillham for September 12 daytime GTA coverage, and Gillham versus Instant Weather for September 9 rain/storm potential in the GTA. Their different overnight windows, regional footprints and severity language are retained. All original forecast and observation permalinks are in the dataset and visible in the app. Date-only publication metadata does not justify precise lead-time or skill scoring.

The September 2 case juxtaposes one regional forecast with subsequent chase imagery; it does not imply a multi-forecaster consensus. The Monkton case links to the existing satellite/polygon page, keeps Justin's nearby downburst hypothesis distinct from the NTP tornado finding, and groups shared source material so it cannot count as independent agreement.

The public-source case studies do not enter the synthetic rainfall brief, tenant-specific field conclusions, or decision-time replay. A future ingestion adapter needs actual retrieval timestamps, edit/withdrawal handling, source access, and a geospatial/time matching review before live claims or scoring are added. Current matching only pairs forecast records with a manually reviewed shared region/time key, matching event date, distinct authors and distinct source families.

## Official-agency baseline

Environment and Climate Change Canada (ECCC) is the baseline for Ontario. The reusable `OfficialBaseline` panel appears in every analyst case and on the Monkton map page. It compares agency message, analyst message, and interpretation limits. Agency forecasts/warnings do not increase the six-account analyst count or enter the synthetic replay.

- **September 12:** directly retrieved the [Toronto city forecast](https://weather.gc.ca/en/location/index.html?coords=43.655%2C-79.383), issued 11:00 am EDT September 12. The selected forecast excerpt, retrieval time, issue time and full source-document SHA-256 are preserved in `shared/official-capture.ts` and downloadable in the UI. The daytime forecast and overnight shower probability broadly align with the analyst narratives. The agency issue time is later; no equal-lead-time advantage is claimed.
- **September 9:** the search-indexed [official Toronto forecast](https://www.weather.gc.ca/en/location/index.html?coords=43.655%2C-79.383), issued September 8 at 5 am EDT, described morning showers and afternoon thunderstorm risk. The page now updates, so this row is explicitly provisional indexed history. Routine wind gusts must not be compared as an upper limit on severe-storm gusts.
- **September 2 outbreak:** an [indexed ECCC bulletin](https://ecalertme.weather.gc.ca/warning-latest_en.php?alert_code=STW&alert_id=92741&m_id=455209&ualert_id=19761) issued 4:24 pm EDT continued a severe-thunderstorm warning for specified Toronto/York/Guelph areas. Direct retrieval now shows no active warning. The stored summary is labeled indexed historical evidence, not a verified immutable archive or current warning.
- **Monkton:** a matched historical ECCC forecast/warning was not captured. This is an explicit missing baseline, not evidence that no warning existed. The NTP research survey is an outcome reference, not a government forecast or warning. The Toronto warning cannot be mapped onto Monkton.

The [Met Office warning service](https://weather.metoffice.gov.uk/guides/warnings) is the corresponding UK baseline for future UK cases; UK warnings are not Ontario evidence. Fair performance evaluation remains contingent on matching jurisdiction, place, variable, valid interval, issue-time cutoff and observations. No winner, accuracy score or combined probability is inferred from these selected examples.
