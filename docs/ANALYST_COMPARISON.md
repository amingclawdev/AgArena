# Analyst comparison demonstration

Open **Analysts** in the application. This extends the existing WxOntario1 source with five researched candidates, attributed insight summaries and a persistent comparison workflow. Selection is editorial and is not an accuracy ranking.

## Shortlist and source verification

Checked September 12, 2026. Employer bios verify professional identity; linked public examples establish relevant weather commentary. These links do not establish current posting frequency.

| Analyst | Public profile | Primary identity reference |
| --- | --- | --- |
| Anthony Farnell | [@AnthonyFarnell](https://x.com/AnthonyFarnell) | [Global News](https://globalnews.ca/author/anthony-farnell/) |
| Mark Robinson | [@StormhunterTWN](https://x.com/StormhunterTWN) | [The Weather Network](https://www.theweathernetwork.com/en/news/author/mark-robinson) |
| Doug Gillham | [@gtaweather1](https://x.com/gtaweather1) | [The Weather Network](https://www.theweathernetwork.com/en/news/author/dr-doug-gillham) |
| Chris Scott | [@ChrisScottWx](https://x.com/ChrisScottWx) | [The Weather Network](https://www.theweathernetwork.com/en/news/author/chris-scott) |
| Ross Hull | [@Ross_Hull](https://x.com/Ross_Hull) | [Global News](https://globalnews.ca/author/ross-hull/) |

Chris Scott's current biography identifies VP Meteorology & Content. His [official forecasting explainer](https://www.theweathernetwork.com/en/news/weather/forecasts/world-meteorological-day-forecast-weather-science) links his account. Ross's [official forecast caption](https://globalnews.ca/video/10730237/global-news-morning-forecast-september-3-2024/) links his account. Mark and Doug's bios explicitly identify their handles. Three candidates share The Weather Network and two share Global News; their inputs and methods may overlap. Account count must not be interpreted as independent model count.

The application contains five dated, linked research examples, including retrospective and seasonal material. They are stored separately from actual browser captures and numeric claims. The editorial synthesis is to inspect timing, local storm effects and model uncertainty while preserving forecast horizon. It is not a current consensus forecast. Research examples never enter scoring.

## Live collection and aggregation

Use **Collect** on an analyst card. `POST /api/jobs` accepts `{ "account": "gtaweather1" }` (or another shortlisted account). Omitting the account retains WxOntario1 compatibility. Only one waiting/collecting job is allowed across accounts; attempting another account returns409 with the active account. Finish or cancel that job before continuing.

The handoff still requires an actual host Computer Use agent, at most three public posts per job, visually inspected media and validated imports. Existing source/account/time checks remain enforced. A button does not launch an unattended agent. Capture packets and observations stay in the ignored local SQLite store.

The digest groups captures by named location, hazard and publication date, retaining each source's summary and link. Grouping does not imply matching event windows or agreement. Canonical post IDs and exact normalized copied text are conservatively deduplicated. Similar text, shared models, copied images and organizational dependence are not a solved independence problem. Broad, historical, unknown-time and qualitative claims remain readable and unscored.

## Comparable numeric claims

**Register a comparable prediction** starts from an admitted forecast with a resolved publication time and a supported town. Broad regions are excluded from point scoring. The reviewer must verify an explicitly stated scalar value, unit, exact UTC hour and location. Quotation containment and scalar-unit/range validation catch obvious mismatches; semantic matching of language and time remains an explicit reviewer responsibility. Never infer percentages from “likely,” choose range endpoints or convert a daily forecast to an hourly claim.

The first version supports:

| Metric | Verification event | Prediction unit | Outcome |
| --- | --- | --- | --- |
| `temperature_c` | 2m air temperature at the exact UTC hour | °C | Station temperature at that hour |
| `precipitation_mm` | Total precipitation water equivalent during the preceding hour | mm | Full-hour station or quantitative radar estimate |
| `precipitation_probability` | Total precipitation **strictly greater than0.1mm** during the preceding hour | % | Full-hour precipitation amount converted to a binary event |

These periods and definitions follow [Open-Meteo's hourly API](https://open-meteo.com/en/docs). Its probability guidance represents a model ensemble on an approximately27km grid. The UI exposes both the town reference coordinate and provider grid coordinate; spatial representativeness is imperfect.

`POST /api/comparisons` accepts:

```json
{
  "evidenceId": "an-existing-live-evidence-id",
  "metric": "precipitation_probability",
  "validAt": "2026-09-13T15:00:00Z",
  "value": 70,
  "quote": "A literal source quotation explicitly supporting 70% and its event",
  "interpretationNote": "Review of the exact town, threshold, units and UTC period.",
  "reviewed": true
}
```

The example shape is illustrative and cannot be admitted without real matching evidence. `validAt` is the instant for temperature and the hour ending for precipitation. The entire period must still be in the future, within48hours, including after any slow provider fetch. The matching baseline must be available before the period. Its full selected value, retrieval time and coordinates are frozen independently of the changing forecast cache; model issue time remains unknown.

Cases match exactly on town, metric and normalized UTC period. All included analyst publications must precede or equal that case's frozen baseline retrieval cutoff. A later-issued prediction cannot join that older baseline. Each analyst gets one immutable claim, preserving evidence revision/digest and registration time. Exact copied quotations cannot add votes. A repeated identical request is idempotent; later revisions do not rewrite a claim. This is a small prospective comparison registry, not a historical backtest with reconstructed model runs. Differing forecast ages remain visible and prevent broad fairness claims.

## Outcomes and evaluation

After the period ends, **Record a sourced observation** requires an HTTPS source, station/product name, coordinates, explicit metric, exact matching period, complete coverage and reviewer notes. Only samples within5km of the reference point are admitted. This geographic tolerance does not prove that a storm affected the entire town.

`POST /api/comparisons/:id/outcome` accepts the fields in `outcomeSchema` in `src/contracts.ts`. Missing coverage, wrong periods, wrong units/metric, future periods and distant locations are rejected. Radar cannot verify air temperature. A reviewer must supply a quantitative, full-hour precipitation estimate for radar; the app does not derive accumulation from a screenshot. Outcomes are immutable once admitted.

Radar echoes can differ from conditions at the ground. Read [ECCC radar interpretation](https://www.canada.ca/en/environment-climate-change/services/weather-general-tools-resources/radar-overview/interpretation-rain-snow.html). Radar-derived results are labeled as scores against an estimate. The application does not automatically fetch, validate or archive an ECCC observation product, and a supplied source URL is reviewer evidence rather than cryptographic proof.

For a probability `p` on0–1 and event `y` on0/1, Brier error is `(p-y)^2`. For deterministic values, error is `abs(prediction-observation)`. See the [Bureau of Meteorology's verification discussion](https://www.bom.gov.au/news-and-media/understanding-forecast-accuracy-and-verification) and [verification methods](https://www.cawcr.gov.au/projects/verification/Mason/IntegratedVerificationProcedures.pdf).

The arithmetic mean of eligible analyst values is the demonstration aggregate; the range and individual errors remain visible. Baseline error minus aggregate error is displayed as improvement: positive is better in that case. Missing outcomes produce no score. No leaderboard, statistical significance, calibrated ensemble claim or general skill advantage is inferred from the sample.

## Demonstrate and verify

1. Open Analysts in Live. Expand the five dated research examples and review the existing attributed source digest.
2. Switch to Demo scenario. The scored example has five invented analysts at60/80/70/50/90%, a40% invented reference forecast and1.2mm invented observed precipitation. The mean is70%, Brier error0.09 versus0.36 for the baseline; improvement0.27.
3. Inspect individual predictions and dates. The second example has no observation, so it has no score. Demo identities are not the real shortlisted people.
4. Switch to Live and use a shortlisted account's Collect action. After actual capture, register only explicitly comparable future predictions. Later attach a reviewed observation for the same event.

Run `npm test`, `npm run test:e2e`, and `npm run build`. Tests cover cutoff leakage, future-window checks including slow fetches, frozen persistence, duplicate/revision handling, literal unit/range checks, outcome matching and scoring. Independent browser QA checks the composed journey and mobile rendering. AC backlog: `AG-ANALYST-008`; lane: operator-supervised direct main.
