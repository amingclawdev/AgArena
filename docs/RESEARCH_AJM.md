# AgArena Research

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

| Area | Questions to resolve | Evidence needed |
| --- | --- | --- |
| User and decision | Who is the farmer, where are they, and what action depends on the forecast? | Concrete user scenario or interview |
| Locality | Does hyper-local mean a field, farm, or village? | Target geography and available observation coverage |
| Weather event | Rain timing, rainfall amount, frost, wind, or another event? Over what horizon? | One measurable prediction question |
| Forecast sources | Which sources cover the target location at useful spatial and temporal resolution? | Provider documentation, sample responses, access and usage terms |
| Ground truth | How do we establish what happened at the predicted place and time? | Independent observations and a resolution rule |
| Market design | Play-money trading, reputation stakes, or forecast comparison? Who participates? | Agreed interaction and scoring rules |
| Agent role | Researcher, contestant, explanation assistant, or another role? | One visible agent action that serves the user journey |
| Evaluation | Does combining evidence improve on a baseline forecast? | Timestamped forecasts, observed outcomes, and a comparison method |
| Hackathon | What are the deadline, judging criteria, team roles, and available integrations? | Event requirements and team agreement |

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

| CoMapper source | Potential AgArena use | Adaptation required |
| --- | --- | --- |
| `src/features/map/MapWorkspace.tsx` and map helpers | Select a farm or study polygon; show stations, reports, and forecast coverage | Weather layers, time selection, coverage labels, and farm semantics |
| `src/shared/importGeoJSON.ts` and `gis.ts` | Normalize spatial inputs, preserve properties and stable feature IDs | Explicit weather units, valid times, forecast issue times, and source types |
| `src/features/inspector/InspectorPanel.tsx` and `src/shared/provenance.ts` | Inspect evidence behind a prediction | Distinguish measurements, reports, forecasts, and agent interpretations |
| `src/features/webmcp/useAtlasSiteTools.ts` | Contextual tools that invoke the same actions as map controls | AgArena tool schemas and a tested host-specific registration adapter |
| `src/shared/export.ts` | Export a visible evidence snapshot | Include event definition, source IDs, forecast cutoff, and resolution rule |
| WebMCP contract tests | Verify bounded actions and state-dependent tool availability | Add weather contracts and direct host invocation verification |

Borrow selected modules and contracts rather than copying every dependency or the Toronto dataset. Preserve applicable license notices when copying code; inspect retained map/data attribution separately.

### Stack options

These are proposed designs, not selected requirements or validated deployments.

| Option | Proposed components | Best fit | Main tradeoff |
| --- | --- | --- | --- |
| A: small TypeScript service — leading option | CoMapper-derived Vite/React/MapLibre client; Node/Express API; OpenAI Agents SDK; PostgreSQL if shared persistence is in scope | Map collaboration plus a real weather/agent evidence loop | API hosting and persistence need setup; background jobs are additional work |
| B: Cloudflare deployment | Same Vite client; Workers static assets and API; D1 for bounded records; scheduled worker for refresh/resolution | Team prefers one Cloudflare deployment and a small bounded demo | Port and test the agent/weather path for Workers; existing Express/PostGIS code is not a drop-in backend |
| C: reactive shared arena | Same Vite client; Convex data/functions; agent calls in server actions | Several farmers or forecasters must see new submissions and rankings immediately | Introduces a different backend model; spatial queries and external agent execution still need deliberate design |

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
