# 70-minute MVP: browser evidence to weather planning

## Selected slice

Prioritize the user's explicit authenticated Computer Use requirement: a local agent reads X post text **and opens images**, AgArena preserves the evidence, maps a supported Ontario place, retrieves independent provider guidance and displays in-app planning alerts.

The 70 minutes are a proposed timebox, not an assertion of elapsed work or completed checks. The parent's AC batch binds separate API, UI and documentation lanes before implementation. This scope does not accept every blueprint ADR or authorize its production platform.

## Reconcile the five research inputs

| Source | Carry forward | Narrow or defer |
| --- | --- | --- |
| Andy | Browsing a shortlist; extract event, time, severity and affected-area claims | ELO, identity verification, radar/network validation, WeatherNext and pest/disease risk |
| AJM | React/Vite/MapLibre direction, small TypeScript backend, evidence inspector, small vertical slice | WebMCP registration, shared map collaboration, server agents, competition and PostGIS |
| FH | Explicit location evidence, unknown places off-map, distinct observation/publication times, repost caution | Its weather → CHU → pest → trap → official-X-API order is replaced in this timebox by the requested authenticated-browser flow; CHU/pest science, GLMPMN and polling remain deferred |
| AC | One region, provenance, missing means unknown, language models interpret while providers supply numbers | Rust/Python platform, scientific challengers, spread models, leagues, virtual markets and commercial pilot |
| Full blueprint | Evidence/forecast distinction, explicit geographic support, bounded ownership, actual verification | Its synthetic tenant/field slice and Rust/PostGIS/S3 design are proposals, not this implementation; tenant isolation and production scientific/source release gates remain future work |

Original research remains intact. Andy's original content, spelling and line breaks are preserved in [andy-RESEARCH.md](research/andy-RESEARCH.md). The [source register](research-sources.md) records exact commits and blobs.

## Timebox

| Minutes | Work | Demonstrable exit |
| --- | --- | --- |
| 0–10 | Read research, choose journey, bind ownership and shared capture contract | Authenticated capture requirement and separate synthetic fallback are explicit |
| 10–25 | API/SQLite, capture validation, job handoff/import, identity/revisions | Real packets can be stored with original source text and interpretation boundaries |
| 25–40 | Map, list/inspector, reference extents, unknown-location handling | Evidence selection reveals source/time/image/location limitations |
| 40–50 | Provider adapter, units/time validation, cache/outage and threshold alerts | Numerical guidance is independent of social interpretation |
| 50–60 | Host reads up to three posts and relevant images; import packets | Actual evidence appears live, or collection truthfully fails |
| 60–70 | Integration tests/build, browser checks, rehearsal and runbook | Actual results and remaining failures are recorded |

Under time pressure, reduce polish or post count. Do not fill unseen images, unknown places or failed collection with invented evidence.

## Runtime and evidence boundaries

```text
Authenticated browser + local Computer Use agent
  -> observed post text/images + typed packet
  -> local import API -> SQLite evidence/revisions
  -> React evidence list + MapLibre reference areas

Selected reference place -> Open-Meteo adapter -> validated hourly guidance/cache
  -> separate forecast display -> deterministic in-app watch alerts
```

Browser state and credentials remain with the host. Express prepares a bounded handoff; it does not launch or schedule the host agent. Packet validation checks shape and consistency, not whether a post is true or an operator really viewed an image.

Use [README](../README.md) for installation, commands and ports. Node >=22.13, Express on 127.0.0.1:8787, Vite on 127.0.0.1:5173, SQLite under `data/` (override with `AGARENA_DB`). No Rust, PostgreSQL, Python service or GPU is needed.

| Evidence concept | Meaning |
| --- | --- |
| Publication time | When the post was published, or unknown |
| Capture/receipt time | When the host captured / API received it |
| Report time | Event time only when supported; otherwise null with explanation |
| Image findings | Visible facts from opened images, with interpretation limits |
| Geographic support | Literal source quote resolving to a supported town/region reference |
| Social forecast | A post's forecast claim; remains unverified social evidence |
| Provider forecast | Validated numerical guidance; issue time unknown if absent |
| Independence | Re-reading one permalink is not another observation; cross-post common-source clustering is not implemented |
| Alert | Watch threshold or missing-data message; no diagnosis or official warning authority |

## Demo sequence

1. Run `npm ci`, then `npm run dev`; open port 5173 and check API health.
2. Create a job and give its prompt to the host. Explain that waiting requires an actual Computer Use agent.
3. Mark collecting when inspection starts. Read up to three public @WxOntario1 posts and relevant opened images; preserve permalink/account/text/times/location quotes and image observations.
4. Save under ignored local data and run `npm run agent:import -- data/capture.json --job <job-id>`. Evidence must be captured after job creation. Standalone imports without `--job` do not prove a job completed.
5. Refresh live evidence. Inspect a mapped report and an ambiguous/historical item. If real captures lack such an example, demonstrate it in the explicitly synthetic mode.
6. Select a supported place; show provider, retrieval time, units and unknown issue time. Explain that the browser agent did not produce the numbers.
7. Adjust the rain threshold and acknowledge an alert. Acknowledgements are local; wind is a demo watch threshold.
8. Show provider-unavailable behavior or the labeled synthetic fallback. Identify actual browser evidence, live/cached forecasts and fixtures separately.

Do not claim that a prepared prompt collected data, that a screenshot proves forecast skill, or that fixture success establishes live integration.

## Acceptance and verification

The integrator runs `npm test`, `npm run test:e2e` and `npm run build` against the assembled candidate, plus browser checks. The HTTP end-to-end suite is not itself a visual browser test. Document checks cover provenance, links, fenced blocks and owned file scope.

| Case | Required evidence |
| --- | --- |
| Authenticated text/image capture | Actual host inspection, validated import and UI display |
| Duplicate/revised permalink | Stable identity on repeat; changed content retained as a revision |
| Location/time ambiguity | Unsupported location off-map; unresolved time unknown; old report not current |
| Numerical guidance | Actual provider response or clearly identified test fixture, with units/times validated |
| Outage/partial data | Unknown/unavailable without a reassuring low-risk conclusion |
| Job lifecycle | Truthful states; completion limited to evidence linked after collection starts |
| Alerts | Provider-based watch rules and local acknowledgement |
| Reproducibility | Actual install/start/test/build outputs against the integrated candidate |

**Integration verification is pending at this documentation revision.** The host has reported inspecting three image maps and preparing a real packet; import, provider response and UI behavior require separate results. The documentation worker did not perform those host capture actions.

## Deferred

CHU/GDD and pest models; disease detection; trap networks; transport/spread science; ELO/Brier rankings; identity reputation; leagues, settlement and markets; Rust/PostGIS/S3/Python/GPU infrastructure; WebMCP; tenant isolation and production login; public deployment; farm boundaries; unattended/scheduled or official-API X collection; broad account discovery; production retention/deletion automation; email/push/SMS and closed-app alerts.

These remain research directions. The demo makes no forecast-accuracy, crop-risk or production-readiness claim.
