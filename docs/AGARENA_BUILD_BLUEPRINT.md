# AGARENA Build Blueprint and Implementation Plan

> **For agentic workers:** Read this entire document before proposing repository changes. Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` when those skills are installed and implementation has been authorized. Follow the approval and evidence gates below regardless of the agent harness.

**Version:** 0.1.0  
**Document date:** September 12, 2026  
**Status:** Proposed architecture and build specification; not an implementation approval  
**Working product name:** Agarena; brand clearance is unresolved  
**Intended repository home:** `docs/AGARENA_BUILD_BLUEPRINT.md`  
**Goal:** Build a permissioned, field-aware agricultural intelligence workspace that combines weather forecasts, verified observations, and transparent forecasting competitions to improve farmers' decisions.  
**Architecture:** A modular application with a Rust service boundary, PostgreSQL/PostGIS, object storage, Python scientific workers, and a mobile-first web map. Operational weather remains the baseline; AI weather models and community forecasts are separately evaluated challengers.  
**Proposed technology stack:** Rust, Python, TypeScript/React, PostgreSQL/PostGIS, S3-compatible object storage, MapLibre GL JS, containerized workers, and GitLab CI. Exact versions and deployment services must be selected and locked during bootstrap.  
**Spec:** This file is the self-contained product and architecture specification. Execution plans derived from it must preserve its invariants and accepted ADRs.

## Read this first

The user's abbreviation **“AD” was not expanded**. This document provisionally interprets it as **Architectural Design and Architecture Decisions**, recorded as ADRs. It also includes an agent-directed development protocol, but does not claim that autonomous development was the intended expansion.

This is a **proposed build contract**, not evidence that the application exists. No project repository was inspected or modified, no infrastructure was provisioned, and no application tests or weather benchmarks were run in preparing this document. Proposed paths, APIs, commands, budgets, and targets are design specifications, not existing capabilities.

The preceding research supplies the product direction. Selected primary sources were reopened on September 12, 2026 to check important provider, model, platform, and regulatory claims. Public documentation confirms neither a commercial contract nor suitability for a particular farm. See the [source register](#sources) and [decision register](#decisions).

**The central question:** “What deserves my attention across my fields over the next 72 hours, and what evidence supports that?”

**The core product thesis:** A trusted regional intelligence network that rewards useful observations and accurate forecasts. Forecasting competitions strengthen the decision product; they do not replace it.

<a id="contents"></a>
## Contents

1. [Product contract and assumptions](#product)
2. [Scope and first pilot](#scope)
3. [Non-negotiable invariants](#invariants)
4. [System architecture](#architecture)
5. [Domain model and data contracts](#contracts)
6. [Source and model onboarding](#onboarding)
7. [Weather and agricultural risk](#risk)
8. [Social and community intelligence](#social)
9. [Arena: forecasts, scoring, and settlement](#arena)
10. [Visual workspace and field workflow](#experience)
11. [Security, privacy, and operations](#security)
12. [Evaluation and release gates](#evaluation)
13. [Repository blueprint](#repository)
14. [Implementation work packages](#implementation)
15. [Architecture Decision Records](#adrs)
16. [Agent-directed execution protocol](#agents)
17. [Open decisions and business validation](#decisions)
18. [First approved development slice](#first-slice)
19. [Primary-source register](#sources)
20. [Completion and change control](#completion)

<a id="product"></a>
## 1. Product contract and assumptions

### 1.1 Users, jobs, and expected outcomes

| User | Job | Proposed outcome |
|---|---|---|
| Farmer or farm manager | Decide what to inspect or do next across multiple fields | A short prioritized task list with weather context, uncertainty, and evidence |
| Agronomist or crop adviser | Review regional reports and coordinate scouting | Verified observations, appropriate permissions, and an auditable review workflow |
| Co-op or grower organization | Support participating farms across a region | Consent-based regional intelligence and operational oversight |
| Farmer participating in Arena | Test forecasting skill and contribute local knowledge | Comparable questions, transparent scores, and independently resolved outcomes |
| Scientific/operator team | Maintain trustworthy data and forecasts | Reproducible evaluations, source health, spend controls, and rollback capability |

Do not assume a farmer's experience on X represents the whole target market. Treat X participation, willingness to contribute observations, and willingness to pay as pilot hypotheses.

### 1.2 Product boundaries

Agarena is initially **decision support**, not an automated agronomist, insurer, securities exchange, pesticide application controller, or emergency warning authority. Official alerts retain their origin, wording where permitted, validity period, and authority. The platform must not imply that its experimental indicators supersede them.

A field-aware product uses a field's context and geometry. It must not claim field-resolved measurements merely because a coarse forecast is displayed inside a field polygon.

The Palantir-inspired element is a permissioned domain model connecting evidence, entities, relationships, and actions. It is not a requirement to use Palantir software or reproduce its branding.

### 1.3 Assumptions with explicit status

| ID | Assumption | Status and test |
|---|---|---|
| A01 | A co-op, adviser, or grower group can recruit a concentrated pilot | Unvalidated; secure a willing partner before selecting the production region |
| A02 | Better weather context plus scouting prioritization is valuable | Interview participants and observe current decisions before building complex models |
| A03 | Local observations add information beyond public weather | Evaluate an observation-enhanced system against the weather-only baseline |
| A04 | Farmers enjoy forecasting competitions without cash rewards | Run a small invitation-only league and measure repeat participation |
| A05 | Community forecasts improve predictions | Run a preregistered incremental-skill experiment; do not infer this from engagement |
| A06 | Authorized social data is worth its cost and obligations | Measure useful, independently corroborated evidence per dollar |
| A07 | A frontier AI weather model improves selected decisions | Require region-, variable-, and lead-time-specific evaluation |
| A08 | The working name is usable | Unresolved; AI-AgARENA already names an agricultural research testbed [S21][s21] |

<a id="scope"></a>
## 2. Scope and first pilot

### 2.1 Recommended starting position

Select **one partner-backed geographic cluster, at most two crops, and two recurring decisions**. A U.S. Corn Belt corn/soybean pilot is the research default, not a confirmed commercial launch. A committed Canadian partner can justify a different first region through ADR-001.

Suggested first decisions are weather-aware scheduling of scouting or field visits, and prioritization of fields for inspection. Rain and temperature forecasting questions provide a simpler initial Arena than crop-loss or disease-outbreak contracts.

Do not put spray approval, exact pest dispersal, field-specific yield prediction, or machinery control into the first slice.

### 2.2 Delivery scope

| Release | Included | Deliberately excluded |
|---|---|---|
| **R0: Local evidence demo** | Synthetic fields, permission checks, normalized forecast fixtures, map, provenance drawer, offline tests | Real farm data, purchased feeds, live alerts, GPU requirements |
| **R1: Invitation-only intelligence pilot** | One approved regional weather adapter, field context, source freshness, native observations, agronomist review, tasks | Continental coverage, automatic diagnoses, chemical prescriptions, public farm boundaries |
| **R2: Forecast League** | Shared station questions, locked probability submissions, Brier scoring, auditable settlement | Money, credits for purchase, transferable rewards, outcome control by participants |
| **R3: Scientific challengers** | One AI weather model and one crop-risk module in shadow mode; bounded licensed social connector | Replacing baselines without validation; universal disease prediction |
| **R4: Optional virtual-market experiment** | Reviewed noncash virtual trading, independent settlement, anti-abuse controls | Redeemability, deposits, withdrawals, financial hedging claims |
| **Later country/crop packs** | New crop models, language, sources, permissions, and local professional review | Assuming U.S. coverage or rules apply unchanged to Canada or Mexico |

The intended market is North America, including the United States, Canada, and Mexico. Coverage must be enabled by **country-region-crop-capability**, not a single continent-wide feature flag. Plan for English/French/Spanish localization without claiming all three languages or all regions are implemented in R1.

### 2.3 Initial operating constraints

Use existing stations and authorized data before requiring proprietary hardware. Start with a conventional database-backed job queue and managed infrastructure where appropriate. Do not introduce Kubernetes, a dedicated graph database, a blockchain, a custom distributed scheduler, or a generalized agent swarm without a new approved ADR.

Purchased data, external processing of private information, infrastructure spend, and public releases require explicit authorization. The default external-spend authorization is **zero** until a written budget exists.

<a id="invariants"></a>
## 3. Non-negotiable invariants

These are proposed project-wide constraints. Once approved, every implementation task inherits them.

| ID | Invariant | Required verification |
|---|---|---|
| INV-01 | Observations, forecasts, social claims, and crowd estimates remain different evidence types | Schema and presentation tests reject type substitution |
| INV-02 | Missing, stale, or unsupported data is never rendered as reassuring low risk | Stale/missing fixtures display unknown or insufficient evidence |
| INV-03 | Every assessment names its inputs, model/rule version, geographic support, and validity period | Contract validation and evidence-closure checks |
| INV-04 | Historical decisions use only information demonstrably available at that time | As-of replay tests, including delayed publication and revised observations |
| INV-05 | Every private object and derivative obeys tenant and sharing policy | Cross-tenant API, tile, export, job, and cache tests |
| INV-06 | No production social connector operates without a permitted-use and retention record | Disabled connector tests; rights gate at fetch and processing boundaries |
| INV-07 | Crowd consensus and social popularity cannot verify agronomic truth | Reposts cannot increase independent evidence count; votes cannot confirm disease |
| INV-08 | Arena settles from predefined independent observations | Settlement fixtures, frozen rules, and oracle-outage tests |
| INV-09 | R0-R3 contain no money, redeemable rewards, or financial exposure | API, UI, configuration, and schema scans |
| INV-10 | Language models do not invent quantitative risk or execute agronomic operations | Typed outputs; numerical consistency checks; no actuation permissions |
| INV-11 | Experimental risk is not presented as a diagnosis or a permission to spray | Reviewed language templates and feature gates |
| INV-12 | Retries cannot duplicate authoritative submissions, reviews, or settlement; external delivery semantics are explicit | Idempotency, concurrency, and delivery-deduplication tests |
| INV-13 | Scientific outputs preserve native units, accumulation intervals, resolution, and transformation lineage | Golden tests for unit/time/grid conversions |
| INV-14 | Deletion obligations override a desire for indefinite raw-data retention | Purge propagation and restore-after-deletion tests |
| INV-15 | Promoting a model requires evidence, not a vendor ranking | Frozen evaluation manifest, review, deployment record, and rollback |
| INV-16 | A document or agent cannot approve its own high-impact decisions | Gate tests and explicit human acceptance records |

<a id="architecture"></a>
## 4. System architecture

### 4.1 Logical components

```text
Approved public feeds      Authorized partner data      Native observations
         |                         |                          |
         +-------------------------+--------------------------+
                                   |
                   Source registry and rights gate
                                   |
                Fetch -> validate -> normalize -> deduplicate
                                   |
                  Evidence metadata + permitted raw assets
                                   |
            +----------------------+-----------------------+
            |                      |                       |
       Weather service        Review workflow        Context/field data
            |                      |                       |
            +----------------------+-----------------------+
                                   |
              Scientific risk workers and task generation
                                   |
                   Permissioned assessment repository
                                   |
           Field map / timeline / evidence drawer / task inbox

Shared regional questions -> probability submissions -> independent observations
                                                    -> settlement -> score history

AI weather and community forecast experiments run in shadow mode before promotion.
```

This diagram is logical, not a requirement for separate deployments at every box.

### 4.2 Proposed responsibilities

| Component | Responsibility | Not permitted to do |
|---|---|---|
| Rust application/API | Authentication, authorization, domain validation, idempotency, tasks, Arena state | Perform unreviewed scientific inference inside request handlers |
| PostgreSQL/PostGIS | Fields, tenant policies, evidence metadata, relationships, jobs, settlement ledger | Store large weather tensors as ordinary row payloads |
| Object storage | Permitted original and derived scientific assets with lifecycle rules | Retain restricted social content indefinitely by default |
| Python scientific workers | Decode weather formats, spatial extraction, calculations, evaluation, optional GPU inference | Bypass source rights or publish directly to unrelated tenants |
| TypeScript/React client | Map, evidence inspection, task workflow, forecast submissions | Treat UI hiding as an authorization control |
| Language-model adapter | Structured claim extraction, translation, evidence-grounded explanations | Create missing measurements, assign disease confirmation, settle events |
| Operations console | Source health, review queues, model promotions, audit records | Give support operators unrestricted farm-data access |

Use HTTP/JSON for application requests and versioned job envelopes for asynchronous work. Start with PostgreSQL jobs with leases, bounded retries, and an outbox for committed domain events. Reconsider a broker only after measuring a limitation.

### 4.3 Work and caching boundaries

Run weather ingestion and regional calculations once per source, cycle, variable set, geographic tile, and processing version. Serve multiple authorized field queries from shared public forecast products.

Separate public scientific caches from private field/assessment caches. A private cache key must include tenant scope, relevant sharing-policy version, field geometry version, source/model version, and forecast issue time. Authorization must be rechecked before a cached object is returned.

Do not run a global model for each field or each page view. Add GPU infrastructure only for a benchmarked experiment with a cost cap. The CPU-only local demo must remain viable.

### 4.4 Time and availability model

Preserve these concepts separately:

- **Observed/valid time:** When the physical condition occurred or the forecast applies.
- **Initialization time:** The model's atmospheric starting point.
- **Issue/publication time:** When the provider produced or released the product.
- **Available time:** Earliest verifiable time the dependency was accessible for the intended workflow.
- **Ingested time:** When Agarena actually obtained the object.
- **System-valid interval:** When this version was known to Agarena before replacement, withdrawal, or correction.

An archived reanalysis is not automatically a real-time input. When historical availability cannot be established, label the evaluation retrospective and exclude it from claims of real-time predictive skill.

For an operational replay at decision time `T`, every dependency must have a defensible availability time no later than `T`; replaying actual Agarena behavior additionally requires its ingestion time no later than `T`. Apply this recursively through lineage.

<a id="contracts"></a>
## 5. Domain model and data contracts

### 5.1 Core entities

| Entity | Required purpose and relationships |
|---|---|
| `Organization` / `Membership` | Tenant identity and scoped user roles |
| `Farm` / `Field` / `FieldGeometryVersion` | Permissioned management units and explicit boundary versions; not inferred ownership |
| `CropSeason` | Declared crop, growth stage with observation date, and applicable management period |
| `SourceRegistration` | Access method, permitted uses, cost model, cadence, geography, and review status |
| `EvidenceItem` | Typed claim or measurement with time, space, provenance, quality, and retention rules |
| `ObservationReview` | Reviewer, supporting evidence, review scope, disposition, and superseded reviews |
| `ForecastRun` / `ForecastProduct` | Initialization, issue, availability, model identity, variables, members, and asset references |
| `RiskAssessment` | Hazard-specific output, limitations, evidence references, model version, and suggested next step |
| `Task` / `TaskEvent` | Farmer/adviser-owned action workflow with non-actuating notifications |
| `ForecastQuestion` | Frozen measurable outcome and resolution policy |
| `PredictionRevision` | Probability, server receipt time, lock schedule, and prior revision pointer |
| `ResolutionVersion` | Independent observed outcome, evaluator version, review, and correction lineage |
| `ScoreEntry` | Deterministic score tied to prediction and resolution versions |
| `ConsentGrant` / `PolicyVersion` | Purpose-specific sharing and its effective interval |
| `ModelRelease` / `EvaluationRun` | Reproducible candidate, baseline, data split, metrics, and promotion state |

Represent relationships with foreign keys and typed relation tables initially. A field may be adjacent to another field, but adjacency is not proof of exposure or permission to reveal its owner.

### 5.2 Typed evidence envelope

Every evidence type must expose `schema_version`, `id`, `tenant_scope`, `source_id`, `source_version`, `evidence_type`, relevant valid/observed times, `available_at`, `ingested_at`, spatial support, quality status, provenance references, and a rights-policy reference.

`evidence_type` is one of `measurement`, `forecast`, `field_observation`, `social_claim`, `expert_review`, or `crowd_estimate`. A machine-classified image remains an inference linked to an observation; it is not an expert review.

`spatial_support` declares whether a record concerns a station, field geometry, grid cell, county/region, or unknown location. Store original geographic precision. Do not turn a county report into a precise coordinate or spread it uniformly across every farm.

### 5.3 Synthetic risk-assessment example

The following is a **synthetic contract fixture**, not a forecast, calibrated probability, or real farm record. The `condition_probability` describes only the defined weather event; it is not infection probability or a permission to act.

```json
{
  "schema_version": "1.0.0",
  "id": "fixture.assessment.001",
  "tenant_id": "fixture.tenant.alpha",
  "field_id": "fixture.field.north",
  "field_geometry_version": 1,
  "assessment_type": "weather_window",
  "hazard": "rainfall_interrupting_field_visit",
  "status": "experimental",
  "generated_at": "2026-09-12T15:00:00Z",
  "valid_from": "2026-09-12T16:00:00Z",
  "valid_until": "2026-09-12T20:00:00Z",
  "condition_probability": {
    "event": "precipitation_accumulation_gte_threshold",
    "threshold": 1.0,
    "unit": "mm",
    "value": 0.65,
    "method": "synthetic_ensemble_fraction",
    "calibration_status": "not_validated"
  },
  "risk_probability": null,
  "confidence": "insufficient_local_validation",
  "spatial_support": {
    "type": "model_grid",
    "native_resolution_m": 3000,
    "field_resolved": false
  },
  "evidence_refs": ["fixture.forecast.001"],
  "model_release": "fixture.weather_window.v1",
  "rights_policy_ref": "fixture.policy.synthetic",
  "missing_inputs": ["recent_local_rain_observation"],
  "suggested_next_step": "Review updated conditions before the planned field visit.",
  "visibility": "tenant_private"
}
```

Contract rules: probabilities are finite values in `[0,1]`; missing values are `null`, never zero; `valid_until` must exceed `valid_from`; displayed percentages must identify their event and calibration status. Invalid or unsupported coordinates, nonfinite numbers, unrecognized units, and inconsistent intervals are rejected.

### 5.4 Weather normalization rules

Use canonical engineering units: temperature `K`, wind `m/s`, rainfall accumulation `mm`, pressure `Pa`, and area `m2`; render user-selected display units at the boundary. Preserve original units in lineage. Distinguish rainfall rate from accumulation and precipitation probability from expected amount.

Accumulative fields need explicit accumulation start/end and reset semantics. Do not difference adjacent forecast cycles as though they were one continuous accumulation. Preserve wind components and distinguish meteorological direction-from from direction-to. A wind animation is not a validated plume forecast.

Use explicit CRS metadata. Exchange field geometries as GeoJSON longitude/latitude, and calculate area or buffers using appropriate geodesic or projected methods, not degree arithmetic. Regridding must record its method and preserve the meaning of the variable; no automatic bilinear interpolation for categorical classes.

### 5.5 Proposed application routes

| Route | Function and checks |
|---|---|
| `POST /v1/fields` | Create a permitted field geometry; validate tenant, CRS assumptions, geometry, and size limits |
| `GET /v1/fields/{id}/brief?as_of=...` | Return authorized assessments, evidence summary, and freshness state |
| `GET /v1/evidence/{id}` | Return only the permitted evidence representation and current rights state |
| `POST /v1/observations` | Submit a first-party observation with consent and an idempotency key |
| `POST /v1/observations/{id}/reviews` | Append an authorized review without rewriting the original report |
| `POST /v1/tasks` | Create a user-owned task, not execute an agronomic operation |
| `GET /v1/questions` | List authorized, appropriately scoped forecasting questions |
| `PUT /v1/questions/{id}/prediction` | Append a probability revision before the server-enforced lock time |
| `GET /v1/questions/{id}/resolution` | Explain independent outcome determination and any correction |
| `POST /v1/internal/questions/{id}/resolve` | Restricted service/reviewer workflow with deterministic resolution and audit |
| `GET /v1/source-health` | Return approved source-health metadata without exposing credentials |

All writes require authentication, authorization, bounded payload size, and server validation. Creation routes use an idempotency key; concurrent updates use a revision precondition. Errors use stable machine codes such as `SOURCE_NOT_APPROVED`, `EVIDENCE_STALE`, `GEOMETRY_INVALID`, `QUESTION_LOCKED`, and `VERSION_CONFLICT`, without leaking private object existence.

<a id="onboarding"></a>
## 6. Source and model onboarding

### 6.1 Source registration before ingestion

Every live source requires a registration containing: provider and contact, endpoint/documentation, geographical support, covered variables, native resolution, expected cadence, publication delay, quality flags, attribution, allowed processing and redistribution, storage/deletion rules, third-party AI-processing permission, cost units, budget cap, fallback behavior, reviewer, review date, and a review trigger.

A successful HTTP response is not a source approval. Neither public visibility nor a permissive code license establishes rights over a source's data or model weights.

Use source states `candidate -> reviewed -> enabled -> suspended -> retired`. Budget exhaustion, rights expiry, schema changes, repeated quality failures, or missing attribution can suspend a source. Resuming requires a recorded reason and the appropriate reviewer.

### 6.2 Priority data sources

| Source family | Initial role | Verified fact and implementation caveat |
|---|---|---|
| NOAA HRRR | U.S. short-range model baseline | NOAA describes hourly updates and a 3 km grid. Treat source version and coverage as adapter metadata [S02][s02] |
| NWS API | U.S. observations and official alerts | Official API documentation exists; monitor upstream latency separately from ingestion delay [S03][s03] |
| ECCC HRDPS | Canadian high-resolution baseline | ECCC documents the regional product; onboard exact fields, horizons, availability, and terms for the selected area [S04][s04] |
| ECMWF open forecast products | Medium-range comparison and ensembles | ECMWF offers an open IFS/AIFS subset; archive permitted as-issued products for evaluation rather than relying on indefinite provider retention [S05][s05] |
| Native farmer/adviser reports | Permissioned local observations | Obtain purpose-specific consent, observation time, review workflow, and deletion handling |
| Extension and crop networks | Regional context and approved crop models | NEWA demonstrates weather-linked crop tools; individual models and data access require separate review [S20][s20] |
| Licensed social channels | Discovery of candidate evidence | X is a gated optional source, never the only route to core functionality [S11][s11] [S12][s12] [S13][s13] |
| Satellite, crop inventory, soils, machinery APIs | Later context layers | Prior research leads, not preapproved integrations; verify exact product, resolution, terms, latency, and partner authorization first |

For Mexico, source availability, rights, station quality, crop expertise, and Spanish-language review remain an explicit onboarding work package. Do not silently extrapolate U.S. adapters across the border.

### 6.3 Model candidate register

| Candidate | Proposed experiment | Constraint before promotion |
|---|---|---|
| NVIDIA Earth-2 / Earth2Studio | Scientific experimentation and standardized weather-model runs | Pin code, weights, input dependencies, and separate licenses; the platform listing is not agricultural validation [S01][s01] |
| NVIDIA Atlas | Global ensemble challenger | The published checkpoint uses a 0.25-degree grid; do not label it field-resolution. Review operational inputs and local skill [S06][s06] |
| NVIDIA StormScope GOES-MRMS | Short-horizon U.S. storm imagery/reflectivity challenger | The documented use case is CONUS GOES/MRMS prediction. Reflectivity is not automatically rainfall amount; any conversion needs validation [S07][s07] |
| NVIDIA HealDA | Later data-assimilation experiment | Account for the model's observation window and actual data availability, not just GPU runtime [S08][s08] |
| Google WeatherNext | Hosted/commercially reviewed challenger | Current model documentation describes WeatherNext 3. Verify the actual feed, variable resolutions, latency, terms, and redistribution permission [S09][s09] |
| Microsoft Aurora | Research or contracted challenger | Microsoft describes Aurora 1.5; review exact checkpoint and permitted commercial deployment separately [S10][s10] |
| CorrDiff or another downscaler | Local-resolution experiment | An attractive map is not proof of added information; test independent local observations [S01][s01] |

No model is selected merely because it is newest. Operational source versions, weights, licenses, and providers must be pinned when an experiment is approved; this document intentionally does not invent dependency hashes.

A model release record must include training-period information where available, test contamination risks, input availability, expected hardware, measured end-to-end latency, calibration artifacts, geographic support, known limitations, cost, owner, and rollback target.

### 6.4 Research carry-forward policy

Previously mentioned datasets, competitors, and models not listed as checked in the source register remain **research leads**. Recheck them before use. Do not copy time-sensitive release dates, cost claims, coverage, or licensing conclusions from an earlier chat into production configuration.

<a id="risk"></a>
## 7. Weather and agricultural risk

### 7.1 Separate scientific questions

Agarena must distinguish: what the weather may do; whether an organism or substance could reach an area; whether conditions support damage; whether damage is observed; and what action a qualified person should consider.

Do not compress these into one uncalibrated “Farm Risk 87/100.” Display hazard, exposure, potential consequence, confidence, missing evidence, and a next step. A suitability index must remain labeled an index unless validated against observed outcomes as a probability.

### 7.2 Module contract

A scientific module consumes a versioned `FieldContext`, permitted `EvidenceBundle`, relevant `ForecastProduct` references, a `DecisionTime`, and a reviewed `RuleSet`. It produces a versioned `RiskAssessment` or a typed insufficient-evidence result.

`FieldContext` contains the authorized field geometry version, crop season, growth-stage evidence, and applicable region. `EvidenceBundle` is an immutable-at-evaluation manifest of permitted evidence IDs and versions. `DecisionTime` is a UTC instant. `RuleSet` identifies a scientific protocol, parameter version, scope, required variables, permitted output type, and reviewer.

A module must return `unsupported_crop`, `unsupported_region`, `missing_required_input`, `stale_required_input`, or `out_of_distribution` when applicable. It must not replace missing scientific inputs with language-model guesses.

### 7.3 Distinct transport and risk pathways

| Module family | Necessary evidence | Permitted initial output |
|---|---|---|
| Weather-aware field visits | Forecast precipitation/wind/temperature, task window, uncertainty | Weather conditions and a reviewable scheduling suggestion |
| Windborne crop disease | Credible source detections, crop susceptibility, transport scenario, environmental suitability | Experimental scouting priority, not infection diagnosis |
| Insect pressure | Species-specific model, trap observations, life-stage evidence, crop and region | Regional pressure and scouting context |
| Equipment/soil transfer | Permissioned movement records, relevant detections, sanitation observations | A possible exposure pathway requiring review |
| Spray drift | Actual application parameters, atmospheric stability, local conditions, sensitive receptors, current label requirements | Deferred decision-support research; never automatic permission to spray |
| Runoff | Terrain/drainage, soil state, rainfall, relevant material/application records | Deferred water-transport assessment, not reused airborne risk |

Southern rust can involve windborne movement and conducive crop/weather conditions, whereas clubroot highlights contaminated soil and equipment pathways. These are examples of why separate modules are necessary, not ready-made equations for Agarena [S17][s17] [S18][s18]. NOAA HYSPLIT is an atmospheric transport modeling candidate, not a complete biological infection model [S19][s19].

Health Canada's drift guidance distinguishes relevant weather and application factors. The product must not equate low wind with safe application or use an approximate forecast to override product-label requirements [S16][s16].

### 7.4 First risk implementation

Implement a **weather-aware scouting/field-visit window** first. Make user constraints explicit and avoid presenting them as agronomic thresholds. Evaluate conditions jointly across each ensemble trajectory and across the whole requested duration. Preserve event definitions and the distinction between model frequency and calibrated probability.

Do not multiply independent-looking rain, wind, and humidity probabilities to obtain a joint probability unless independence is a justified model assumption. Do not average models with different event definitions, accumulation periods, or valid times.

A deterministic forecast supplies predicted values or threshold conditions, not an ensemble probability. Do not turn one trajectory into a confident 0% or 100% event probability. Producing probabilities from deterministic forecasts requires a separately evaluated error/calibration model; otherwise show the deterministic result and its limitations.

The first crop-risk module remains in shadow mode until an agronomist selects an appropriate published protocol and evaluation labels. Exact crop thresholds and chemical guidance are intentionally blocked pending that decision rather than invented for a complete-looking specification.

### 7.5 Explainability and escalation

Every visible assessment answers: what changed; where and when; which evidence supports it; how reliable the sources are; what is missing; and which human action is appropriate.

Allowed next steps include inspect, upload a recent observation, consult an adviser, check an official alert, or review a changed weather window. They do not include autonomous spraying, accusations against a neighbor, or claims of confirmed infection from a social post.

<a id="social"></a>
## 8. Social and community intelligence

### 8.1 Channel strategy

First-party farmer observations and participating advisers are the durable network. Social platforms are optional discovery and distribution channels. Start with a narrowly selected crop/region/account set, not an unrestricted firehose.

Other channels, including Bluesky, Reddit, public newsletters, extension bulletins, and authorized private groups, require their own source review. Do not assume that an X approval covers another platform or that private-group membership permits automated collection.

### 8.2 Processing pipeline

```text
Permitted capture
  -> rights and retention check
  -> language/claim extraction using an approved processor
  -> original observation time and permitted geographic precision
  -> duplicate and common-source clustering
  -> evidence classification and moderation
  -> independent corroboration or expert review
  -> appropriately scoped display
  -> correction, withdrawal, or expiry when needed
```

Preserve the difference between first-hand observation, hearsay, prediction, historical anecdote, and repost. Keep original-language text only where permitted and label translations. An account's follower count is not a substitute for evidence quality.

County-level reporting stays county-level. Geography derived from platform content must be explicitly permitted for the intended processing; a general-purpose geocoder must not turn restricted social text into a private geospatial database.

### 8.3 X-specific implementation gate

The reviewed X agreement restricts foundation/frontier-model training, certain geographic processing, and commercial use beyond stated self-serve scope. The policy also affects deletion, redistribution, and incentives. Therefore, the X connector is **disabled by default** until the actual processing, storage, display, geographic use, and model-provider arrangements are permitted [S11][s11] [S12][s12].

Do not reward posting, reposting, or other actions on X. Any initial reputation mechanism rewards reviewed, native Agarena observations or forecasting performance instead [S12][s12].

The pricing page currently lists USD 0.005 per post read. Illustratively, 10,000 billable reads daily for 30 days cost USD 1,500 in post reads alone. This is a pricing snapshot, not an authorized budget or production quote; contract scope may independently require Enterprise arrangements [S13][s13] [S11][s11].

Meter volume and cost before dispatching requests; stop before exceeding the approved cap. Deduplicate for evidence quality even when a provider offers billing deduplication.

### 8.4 Review and correction

Observation states are `submitted`, `screened`, `under_review`, `reviewed_supported`, `reviewed_rejected`, and `withdrawn`. A supported review must say exactly what was supported, such as image consistency or a laboratory result, rather than broadly “verified truth.”

Store observer and reviewer reputation separately from forecasting skill. Limit duplicate, self-reviewed, coordinated, and mechanically repeated contributions. A correction must invalidate dependent assessments and notify affected authorized users when materially relevant.

<a id="arena"></a>
## 9. Arena: forecasts, scoring, and settlement

### 9.1 First release: Forecast League

Users answer shared regional questions using probabilities between zero and one. All scored entries use the same question definition and server-enforced submission deadline. Participants may revise before the deadline; preserve every revision and use the eligible final revision for the scheduled scoring snapshot.

A small region should share a manageable number of questions. Do not create one illiquid market per field. Keep forecasts about reference stations clearly distinct from conditions on each user's farm.

Example question: “Will the named reference station report at least 20 mm of accumulated precipitation during the specified UTC interval?” This is a template; no actual station, live question, or commercial contract is created by this document.

### 9.2 Required question contract

A question requires: ID and version; plain-language definition; permitted audience; location/station identifier; measured variable; unit; comparison operator; threshold; event start/end; opening and submission-lock times; observation source and product; coverage/quality requirements; evaluator version; source-revision cutoff; provisional-result hold; dispute deadline; finalization policy; and missing-data/void rules.

Use explicit half-open event intervals `[start, end)` unless a source's convention requires a documented alternative. Source observation intervals must match the event definition; do not sum overlapping rolling precipitation totals. Represent trace precipitation, missing samples, and rejected quality flags explicitly.

Freeze the question definition before opening. Correcting a substantive error requires voiding/replacing the question, not secretly changing it after submissions. Only predeclared equivalent backup sources may be used; otherwise missing data leads to a void result.

### 9.3 Synthetic question fixture

```json
{
  "schema_version": "1.0.0",
  "id": "fixture.question.rain.001",
  "question_version": 1,
  "title": "Will the synthetic reference station record at least 20 mm?",
  "station_id": "fixture.station.001",
  "variable": "precipitation_accumulation",
  "operator": "gte",
  "threshold": 20.0,
  "unit": "mm",
  "opens_at": "2026-09-12T12:00:00Z",
  "locks_at": "2026-09-13T00:00:00Z",
  "event_start": "2026-09-13T00:00:00Z",
  "event_end": "2026-09-15T00:00:00Z",
  "observation_source": "fixture.complete_interval_totals",
  "required_coverage_fraction": 1.0,
  "missing_data_action": "void",
  "revision_cutoff": "2026-09-18T00:00:00Z",
  "provisional_at": "2026-09-18T00:00:00Z",
  "dispute_deadline": "2026-09-20T00:00:00Z",
  "evaluator_version": "fixture.precipitation_interval.v1",
  "rewards": "reputation_only"
}
```

The fixture's times and policies demonstrate a complete contract. Real source products require a reviewed question template; the fixture does not establish an appropriate publication delay or dispute period for every provider.

### 9.4 Scoring and comparability

For a binary outcome `y` and predicted probability `p`:

```text
Brier(p, y) = (p - y)^2
MeanBrier = sum(Brier_i) / N
DisplayScore = 100 * (1 - MeanBrier)
```

Lower Brier is better. The display transformation changes presentation, not the underlying statistic. Examples: `p=0.8,y=1` gives 0.04; `p=0.8,y=0` gives 0.64; `p=0.5` gives 0.25 for either outcome.

Compare participants on matched question sets and lead times. Show question count and coverage; incomplete participation must not produce an apparently equivalent league ranking. Proposed minimum for a non-provisional leaderboard is 20 finalized common questions, subject to pilot review. Do not label this minimum statistically sufficient to establish expertise.

Report the baseline's score on the same questions. Compute skill relative to a preregistered baseline only when the baseline denominator is nonzero. If baseline mean Brier is zero, report the comparison as undefined rather than dividing by zero.

Blind forecasting rounds should hide crowd consensus until submissions lock. Clearly identify assisted rounds where model guidance is visible. Evaluate whether participants add information rather than simply copy the same forecast.

### 9.5 Resolution state machine

```text
DRAFT -> OPEN -> LOCKED -> AWAITING_OBSERVATION
      -> PROVISIONALLY_RESOLVED -> FINALIZED

DRAFT / OPEN / LOCKED / AWAITING_OBSERVATION /
PROVISIONALLY_RESOLVED -> VOIDED when the frozen rules require it
```

Finalized historical records are not silently rewritten. A permitted correction appends a new resolution version and compensating score entries, preserving the previous result and its reason for change. Replaying settlement twice must not create duplicate scores.

Oracle input is an independently published measurement with recorded quality and provenance. Participant-controlled sensors, model forecasts, majority votes, or language-model judgments cannot settle the initial league.

Disputes concern applying the frozen rules to admissible evidence, not popularity. Reviewers with a relevant conflict must recuse themselves. Every outcome explanation names the data version and evaluator used.

### 9.6 Optional virtual markets

After R2 works, a separate approved experiment may add YES/NO trading with equal allocations of nonpurchasable, nontransferable, nonredeemable credits. This is an optional product experiment, not an implied requirement to implement an exchange in the first build.

Before implementation, approve the market mechanism, bounded inventory/balances, liquidity policy, maximum positions, issuance/burn rules, concurrency model, abuse monitoring, and handling of voided/corrected questions. Require ledger and conservation tests. Do not select an AMM solely to make a sparse market appear active.

Label prices as virtual-market estimates, with participation and liquidity context. Never present them as guaranteed event probabilities or a hedge against farm loss.

### 9.7 Money and prizes gate

No deposits, withdrawals, transferable tokens, purchased credits, redeemable rewards, prizes with value, or financial hedging claims are authorized. Introducing them requires separate jurisdiction-specific legal review and an accepted ADR. Noncash product design is a risk-reduction proposal, not a legal conclusion.

The CFTC's March 12, 2026 advisory addresses event-contract obligations. Canadian guidance dated August 27, 2026 addresses specified contract categories and notes continuing assessment of others. Neither source provides blanket approval for Agarena; Mexico and relevant subnational jurisdictions require separate analysis [S14][s14] [S15][s15].

<a id="experience"></a>
## 10. Visual workspace and field workflow

### 10.1 Primary workspace

| Area | User purpose | Required behavior |
|---|---|---|
| Field map | Identify which authorized fields need attention | One selected primary risk layer; legend, time, coverage, and resolution visible |
| “Next actions” panel | Decide what to inspect or review | Explain priority; allow acknowledge, assign, dismiss with reason, and complete |
| Time scrubber | Compare recent observations and future conditions | Make observation/forecast boundary explicit; do not imply smooth interpolation is evidence |
| Evidence drawer | Inspect why an assessment exists | Source, age, geographic support, confidence, model/rule version, missing inputs |
| Forecast comparison | Understand model disagreement | Comparable variables and times; label experimental outputs |
| Regional observation view | See permissioned local reports | Review status and coarse geography; no private farm identification by default |
| Arena panel | Enter and review forecasts | Clear lock time, event definition, settlement source, and provisional/final score |
| Source health indicator | Understand outages and missing coverage | Separate upstream publication delays from Agarena failures |

### 10.2 Main user journey

1. Select or import a field the user is authorized to manage; confirm geometry and crop context.
2. Review the field brief and one relevant weather-aware task.
3. Open the evidence drawer to inspect timing, uncertainty, and source resolution.
4. Submit a native observation, including observation time and sharing scope.
5. An authorized reviewer records an appropriately bounded disposition.
6. Recompute affected assessments, preserving evidence lineage and policy.
7. Optionally answer a shared station-based forecast question and later inspect its resolution.

### 10.3 Presentation requirements

Provide an accessible list/table alternative to the map, keyboard navigation, high-contrast text, non-color status cues, and explicit time-zone/unit preferences. Treat accessibility checks as acceptance tests, not a final styling pass.

For mobile/offline use, allow an observation draft to remain local and display its upload state. A queued forecast submission is not accepted until acknowledged by the server before the deadline. Revoked sessions and shared devices must not expose cached private maps indefinitely.

A gray/hatched unknown field is preferable to an unjustified green one. Explain uncertainty in plain language and allow inspection of the technical detail. Avoid compulsive streak penalties, celebratory loss imagery, and rewards that encourage unsafe field behavior.

<a id="security"></a>
## 11. Security, privacy, and operations

### 11.1 Permission model

Use deny-by-default tenant isolation and purpose-specific grants. Suggested roles are grower, invited adviser, regional reviewer, organization administrator, and restricted platform operator. Roles do not replace object-level checks.

Enforce policy at API, database/query, background job, object-store, tile, export, and cache boundaries. Workers receive scoped job identities, not unrestricted farm-data access. Test guessed IDs and derived artifacts, not only list endpoints.

Exact field boundaries, disease observations, crop operations, and equipment movements remain private unless explicitly shared. Regional summaries require a privacy review; aggregation does not automatically prevent reidentification.

### 11.2 Retention and deletion

Version scientific inputs when permitted, but do not equate provenance with indefinite raw-content retention. Each source policy controls original content, derivatives, embeddings, logs, caches, and backups.

Maintain a minimal audit record of a deletion only where lawful and permitted; do not retain disallowed content under the label of an audit log. A purge must traverse dependency references and invalidate affected outputs. Restored backups must reapply the deletion ledger before serving data.

If deletion makes an old evaluation unreproducible, state that limitation and exclude it from claims requiring full replay. Do not conceal the conflict between retention obligations and reproducibility.

### 11.3 AI and ingestion security

Treat source documents, posts, image captions, and extracted text as untrusted data. They must not change system instructions, tool permissions, settlement logic, or source configuration. Disable arbitrary URL fetching from extracted content; use approved domains, size/type limits, and network egress controls.

Scan uploads, bound decoding costs, limit decompression, handle image metadata deliberately, and rate-limit submissions. Remove precise location metadata from shared derivative images unless explicitly authorized.

LLM calls require a reviewed data-processing path. Default to redacted, minimal evidence; do not send private farm information or restricted social content to a third-party provider without permission. The core app must work when the LLM is unavailable by using deterministic explanations and raw evidence views.

### 11.4 Operational controls

Use encrypted transport, managed secret storage, scoped service accounts, audited administrative actions, dependency scanning, and tested backups. Record structured logs without raw private content. Every asynchronous job has an idempotency key, lease expiry, attempt cap, timeout, and observable failure state.

Authoritative domain changes must be transactional and idempotent. External notifications use provider idempotency when available; otherwise document at-least-once delivery and apply client-side deduplication. Do not claim exactly-once delivery across an external service that does not support it.

Proposed pilot targets, not measured service guarantees:

| Measure | Initial target | Interpretation |
|---|---|---|
| Cached field-brief API | p95 under 1 second at the declared pilot load | Excludes scientific recomputation |
| Core cached workspace | Usable within 5 seconds on the declared test device/network | List fallback remains available |
| Supported-feed processing | p95 under 5 minutes after Agarena receives a complete product | Does not include upstream production latency |
| Evidence lineage | 100% of displayed assessments have complete required references | Missing references block publication |
| Cross-tenant access | Zero successful accesses in the defined adversarial suite | A passing suite is not proof of absence of vulnerabilities |
| Settlement replay | Identical outcome/score for identical frozen inputs | Tested across retries and concurrency |
| Unapproved external spend | Zero | Budget gate must reject the request before dispatch |

Capacity assumption for initial load tests: 25 farms, 250 fields, and 50 concurrent authenticated sessions. These are proposed sizing inputs, not acquired users. Select backup recovery objectives and notification channels before a live pilot; rehearse recovery rather than relying on a provider's feature list.

<a id="evaluation"></a>
## 12. Evaluation and release gates

### 12.1 Experimental ladder

Compare, in order: operational weather baseline; baseline plus AI weather; weather plus verified local observations; and the full system plus crowd forecasts. Preserve the same target outcomes and valid evaluation population.

Use held-out times and geographic blocks, versioned observations, and forecasts available as of the decision time. Audit model training periods where disclosed. Shared training data, related forecast products, and reposted reports create dependence; they do not constitute independent votes.

WeatherBench supplies a relevant weather evaluation reference, but task-specific agricultural value still requires separate testing [S22][s22].

### 12.2 Metrics

Weather evaluation includes appropriate continuous-variable error, probabilistic scoring, calibration/reliability, threshold-event performance, and lead time. Decision evaluation includes actionable alert precision, missed-event rate, warning usefulness, time saved, and reviewed changes in action.

Crowd evaluation compares matched questions and horizons, blind versus assisted rounds, participation coverage, and baseline-relative skill. Report uncertainty using a design that respects temporal/spatial dependence. A small pilot cannot establish performance on rare extremes merely by producing many correlated grid cells.

Agronomic evaluation requires defensible labels and expert review. Do not translate benchmark improvements into yield or monetary benefits without appropriate evidence. Record possible harms and false reassurance as first-class outcomes.

### 12.3 Release gates

| Gate | Required evidence | Blocks |
|---|---|---|
| **G0: Architecture** | Pilot assumptions reviewed; relevant ADRs accepted; spending/rights constraints recorded | Repository implementation beyond authorized scope |
| **G1: Local vertical slice** | Synthetic fixtures; permissions; lineage; stale-state UI; clean test results | Live data and farmer-facing claims |
| **G2: Data onboarding** | Rights record; source contract tests; source health; deletion behavior; approved budget | Enabling each live connector |
| **G3: Private pilot** | Partner consent; operational runbook; privacy/security review; incident and recovery rehearsal | Live farm use |
| **G4: Forecast League** | Frozen question templates; deadline/concurrency tests; independent settlement; scoring tests | Public league rankings |
| **G5: Scientific promotion** | Preregistered comparison; held-out evaluation; limitations; scientific/agronomic signoff; rollback | Production recommendations from challenger models |
| **G6: Virtual markets** | Separate mechanism, abuse, ledger, and legal/product review | Trading-style interactions |
| **G7: Expansion** | New country/crop data, language, science, permissions, and support review | Turning on unsupported regions or crops |

If a gate fails, fix or narrow the feature. Do not dilute the gate merely to maintain a launch date.

<a id="repository"></a>
## 13. Repository blueprint

This is a proposed monorepo layout. These files do not yet exist in a project repository. Use GitLab for issue tracking, merge requests, CI, and review evidence.

```text
agarena/
  README.md
  GOAL.md
  AGENTS.md
  justfile
  Cargo.toml
  Cargo.lock
  rust-toolchain.toml
  .gitlab-ci.yml
  docs/
    AGARENA_BUILD_BLUEPRINT.md
    decisions.md
    adrs/
      ADR-001-pilot-scope.md
      ...one file per accepted or proposed record below...
    plans/
    runbooks/
    research/source-register.yaml
  schemas/
    evidence.schema.json
    risk-assessment.schema.json
    forecast-question.schema.json
    source-registration.schema.json
    job-envelope.schema.json
  crates/
    contracts/src/lib.rs
    domain/src/{fields,evidence,questions,resolutions,policy}.rs
    persistence/src/{fields,evidence,jobs,arena}.rs
  apps/
    api/src/{main,routes,auth}.rs
    api/tests/{tenant_isolation,idempotency,deadlines}.rs
    web/src/{map,brief,evidence,observations,arena}/
    web/package.json
    web/package-lock.json
  services/science/
    pyproject.toml
    uv.lock
    src/agarena_science/{ingest,normalize,weather,risk,evaluate}/
    tests/
  migrations/
  fixtures/
    synthetic/{fields,forecasts,observations,questions}/
  tests/
    contracts/
    integration/
    e2e/
    security/
  evaluations/
    manifests/
    reports/
  scripts/
    check_docs.py
    verify_contracts.py
    replay_fixture.py
    check_budget.py
  infra/
    compose.yaml
    containerfiles/
```

The ellipsis in the ADR directory describes expansion into the 20 named records below, not missing scientific requirements. When bootstrapping, generate the actual files with their status and owner rather than keeping a literal ellipsis file.

### 13.1 Repository control files

`GOAL.md` records the current bounded objective, exit criteria, explicit exclusions, blocking decisions, and active gate. `AGENTS.md` contains the execution protocol from this document, tool permissions, required verification, and stop conditions. `docs/decisions.md` records proposed/accepted/superseded decisions and human approvals.

`docs/research/source-register.yaml` is an operational registry, not a copy of marketing text. Each enabled source must map to a rights decision and test fixture. `evaluations/manifests/` records model/data/version/split/availability details before an evaluation starts.

### 13.2 Dependency and verification contract

Pin compatible toolchain/library versions at bootstrap and commit lockfiles. Dependency upgrades must produce a reviewable diff and rerun contract, replay, and security tests. The document does not assert that any unspecified current release is compatible.

The proposed `just verify` command must orchestrate formatting, Rust tests, Python tests, client checks, schema/fixture validation, documentation links, and a bounded integration suite. Its implementation is a WP-01 deliverable.

Representative commands after their referenced files and dependencies exist:

```bash
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace --locked
uv run --project services/science pytest services/science/tests
npm --prefix apps/web ci
npm --prefix apps/web run check
npm --prefix apps/web run test -- --run
python scripts/verify_contracts.py
python scripts/check_docs.py
```

These are **proposed verification entrypoints**, not commands already run against an existing application. Bootstrap must define client scripts and tool dependencies so the eventual documented commands are real and reproducible.

<a id="implementation"></a>
## 14. Implementation work packages

### 14.1 Execution rule

Each work package becomes its own reviewed task plan after dependencies and decisions are accepted. Do not begin with a large all-at-once implementation. Every package must produce a demonstrable result, explicit tests, and a rollback or removal path.

For each package: write the failing tests; run them and capture the failure; implement the smallest approved behavior; rerun tests; inspect the diff; update relevant contracts/docs; and submit a GitLab merge request with evidence. No package may certify itself complete by describing intended behavior.

### 14.2 Dependency-ordered plan

| ID | Deliverable | Depends on | Gate |
|---|---|---|---|
| WP-00 | Docs review, accepted first-slice decisions, and source/spend defaults | This specification | G0 |
| WP-01 | Reproducible skeleton, tenant identity, fields, test harness | WP-00 | G1 |
| WP-02 | Source registry, evidence envelope, rights-aware fixture ingestion | WP-01 | G1 |
| WP-03 | Weather normalization and as-of replay | WP-02 | G1 |
| WP-04 | Private field brief, map/list, evidence drawer, unknown state | WP-01, WP-03 | G1 |
| WP-05 | Native observation, consent, review, and correction workflow | WP-02, WP-04 | G3 before live data |
| WP-06 | Question creation, frozen rules, probability submissions | WP-01, WP-02 | G4 |
| WP-07 | Independent resolution and deterministic scoring | WP-03, WP-06 | G4 |
| WP-08 | Weather-aware task window and scoped risk-module interface | WP-03, WP-04 | G3/G5 as applicable |
| WP-09 | One approved live source and invitation-only partner pilot | WP-04, WP-05, WP-08 | G2, G3 |
| WP-10 | One AI weather and one agronomic shadow experiment | WP-03, WP-08, WP-09 | G5 |
| WP-11 | One optional licensed social connector | WP-02, WP-05, separate rights approval | G2 |
| WP-12 | Pilot evaluation, cost review, recovery rehearsal, release decision | Relevant prior packages | G3/G4/G5 |

WP-06 and WP-07 can use synthetic observations before a live pilot. Their live/public release still requires the applicable gates. WP-11 is not a dependency for core product usefulness.

### WP-00: Review and freeze the first slice

**Files:** `GOAL.md`, `AGENTS.md`, `docs/decisions.md`, relevant `docs/adrs/` records.  
**Consumes:** This proposed specification and explicit human decisions.  
**Produces:** Accepted scope and an implementation authorization record.

- [ ] Resolve whether “AD” means architecture decisions, autonomous development, or another requested convention; retain both sections until clarified.
- [ ] Select the bounded first slice and approve the relevant ADRs.
- [ ] Record no paid feeds, no live private data, no GPU requirement, and no public deployment for the local demo.
- [ ] Record a repository location and branch only after inspection; do not invent an existing repository or remote.
- [ ] Verify every required first-slice decision has an owner and status.

**Acceptance:** An executor can distinguish permitted local work from decisions that require another approval. No implementation is implied by the existence of this file alone.

### WP-01: Skeleton, tenant identity, and fields

**Files:** Root manifests/lockfiles, `.gitlab-ci.yml`, `justfile`, `crates/domain/src/fields.rs`, `crates/domain/src/policy.rs`, `apps/api/`, `migrations/`, `tests/security/`.  
**Consumes:** Accepted scope and synthetic tenant/field fixtures.  
**Produces:** Authenticated field create/read behavior and a reproducible verification command.

- [ ] Write tests that tenant Alpha can read its field and tenant Beta cannot retrieve that field through guessed IDs.
- [ ] Write geometry tests for self-intersection, missing CRS assumptions, inverted coordinates, and oversized payloads.
- [ ] Implement the minimal domain, persistence, and local authentication setup; no production authentication bypass may share the demo configuration.
- [ ] Define client/test scripts and `just verify`; run the actual commands and capture outputs.

**Acceptance:** Synthetic fields round-trip correctly; unauthorized access and malformed geometries fail without private details; the clean checkout test instructions work in the documented environment.

### WP-02: Evidence and source-rights foundation

**Files:** `schemas/evidence.schema.json`, `schemas/source-registration.schema.json`, `crates/domain/src/evidence.rs`, `crates/persistence/src/evidence.rs`, `docs/research/source-register.yaml`, `tests/contracts/`.  
**Consumes:** Source definitions and synthetic typed evidence.  
**Produces:** Validated evidence IDs/versions with rights, lineage, timestamps, and duplicate handling.

- [ ] Test a disabled source, expired approval, missing attribution, and exhausted budget before any request is dispatched.
- [ ] Test duplicate ingestion and correction events without duplicating independent evidence.
- [ ] Validate required temporal/spatial support and reject forbidden transformations.
- [ ] Implement retention and withdrawal propagation for synthetic dependencies.

**Acceptance:** Every stored fixture is traceable, duplicate-safe, and rights-scoped; withdrawn evidence cannot support a newly published assessment.

### WP-03: Weather normalization and temporal replay

**Files:** `services/science/src/agarena_science/normalize/`, `services/science/src/agarena_science/weather/`, `services/science/tests/test_normalization.py`, `services/science/tests/test_asof.py`, `scripts/replay_fixture.py`.  
**Consumes:** Versioned forecast fixtures, units, grids, and availability metadata.  
**Produces:** `ForecastProduct` manifests and reproducible authorized field extractions.

- [ ] Test `273.15 K -> 0 C` at display conversion and `1 m/s -> 3.6 km/h`.
- [ ] Test cumulative rainfall resets and overlapping intervals; neither may silently overcount precipitation.
- [ ] Test that a forecast published after the decision cutoff is excluded despite an earlier initialization time.
- [ ] Test that a later-revised observation is absent from a replay of the earlier system state.
- [ ] Test native-resolution metadata and out-of-domain field queries.

**Acceptance:** Identical frozen inputs produce the same normalized values and manifest; no unavailable future dependency enters an as-of result.

### WP-04: Field brief and evidence workspace

**Files:** `apps/web/src/map/`, `apps/web/src/brief/`, `apps/web/src/evidence/`, `apps/api/src/routes.rs`, `tests/e2e/`.  
**Consumes:** Authorized fields and normalized forecast/evidence manifests.  
**Produces:** A map/list field brief with time, resolution, freshness, and inspectable provenance.

- [ ] Write end-to-end cases for fresh, stale, missing, withdrawn, and unsupported data.
- [ ] Test keyboard/list access and distinguish observation time from forecast valid time.
- [ ] Test private tiles and cached briefs after a sharing grant is revoked.
- [ ] Implement a deterministic explanation path that works without an LLM.

**Acceptance:** A reviewer can inspect one field, understand the forecast support, and see why missing data is unknown rather than low risk. This completes the recommended first local slice.

### WP-05: Native observations and reviews

**Files:** `apps/web/src/observations/`, `crates/domain/src/evidence.rs`, `crates/domain/src/policy.rs`, `tests/integration/test_observation_review.py`.  
**Consumes:** Consent, native reports, observation times, and approved reviewer identities.  
**Produces:** Scoped reports, review versions, and downstream invalidation events.

- [ ] Test offline draft replay, duplicate upload, unauthorized review, and self-review restrictions.
- [ ] Test an old observation uploaded today without changing its observation date.
- [ ] Test consent revocation and derivative-image metadata removal.
- [ ] Test a corrected report invalidating dependent assessments and producing one relevant notification.

**Acceptance:** Review adds precisely bounded evidence; it does not rewrite history or expose unrelated farms.

### WP-06: Questions and prediction submissions

**Files:** `schemas/forecast-question.schema.json`, `crates/domain/src/questions.rs`, `apps/web/src/arena/`, `apps/api/tests/deadlines.rs`.  
**Consumes:** Reviewed question templates, server time, and authenticated participant identities.  
**Produces:** Frozen questions and auditable prediction revisions.

- [ ] Test invalid probabilities, nonfinite values, invalid event intervals, and missing settlement rules.
- [ ] Test submission one instant before the deadline and rejection at or after the deadline.
- [ ] Test simultaneous updates and idempotent retries.
- [ ] Test that consensus is hidden in blind rounds and that offline late delivery is rejected.

**Acceptance:** The eligible prediction is unambiguous, server-enforced, and tied to a frozen question version.

### WP-07: Resolution and scores

**Files:** `crates/domain/src/resolutions.rs`, `crates/persistence/src/arena.rs`, `tests/integration/test_settlement.py`, `fixtures/synthetic/questions/`.  
**Consumes:** Locked questions, eligible predictions, independent observation fixtures, and evaluator version.  
**Produces:** Provisional/final/void outcomes, deterministic Brier scores, and correction history.

- [ ] Test Brier examples `0.04`, `0.64`, and `0.25` from Section 9.
- [ ] Test exact-threshold outcomes, incomplete coverage, overlapping totals, source outages, and void handling.
- [ ] Test replayed and concurrent settlement without duplicate scores.
- [ ] Test a late authorized correction with an appended resolution and compensating score record.
- [ ] Test that participant content and model forecasts cannot enter the oracle path.

**Acceptance:** An independent reviewer can reproduce every fixture outcome and score from its frozen evidence.

### WP-08: Weather-aware task windows

**Files:** `services/science/src/agarena_science/risk/`, `schemas/risk-assessment.schema.json`, `services/science/tests/test_windows.py`, `apps/web/src/brief/`.  
**Consumes:** Field context, task constraints, aligned forecast trajectories, evidence manifest.  
**Produces:** Weather-aware field-visit suggestions with explicit limitations and provenance.

- [ ] Test a valid window, no feasible window, missing variable, stale forecast, and unsupported crop-specific rule.
- [ ] Test that joint conditions are evaluated on compatible trajectories rather than multiplying marginal probabilities.
- [ ] Test that uncalibrated frequencies remain labeled and no infection probability is invented.
- [ ] Test that “safe to spray” or actuation instructions cannot be generated by this module.

**Acceptance:** The result is a transparent scheduling aid, with no implied agronomic approval.

### WP-09: First live source and partner pilot

**Files:** One adapter under `services/science/src/agarena_science/ingest/`, source registry, `docs/runbooks/`, source contract tests.  
**Consumes:** Source authorization, budget, approved partner consent, and regional pilot configuration.  
**Produces:** Bounded live ingestion and an invitation-only workspace.

- [ ] Verify exact source variables, domain, issue timing, units, quality flags, and permitted retention.
- [ ] Run an outage/schema-change rehearsal with stale states and operational rollback.
- [ ] Verify backup restore, deletion reapplication, support access, and incident communication.
- [ ] Enable only the accepted region/crop capabilities and invited participants.

**Acceptance:** Live behavior matches source contracts and operational gates. Successful ingestion alone is insufficient.

### WP-10: Scientific challengers

**Files:** Model adapter, `evaluations/manifests/`, `evaluations/reports/`, one reviewed crop module, model promotion record.  
**Consumes:** Approved weights/terms, available inputs, protected evaluation split, agronomist protocol, budget.  
**Produces:** Shadow predictions and a baseline comparison, not automatic production promotion.

- [ ] Freeze the comparison, input-availability policy, split, and relevant metrics before scoring.
- [ ] Measure end-to-end latency, cost, calibration, event performance, and decision relevance.
- [ ] Check unavailable inputs, contamination risks, rare-event limits, and geographic failures.
- [ ] Publish the evidence and limitations; require a reviewer to approve promotion or retain the baseline.

**Acceptance:** A negative or inconclusive result is valid evidence. The task does not require claiming improvement.

### WP-11: Licensed social connector

**Files:** One isolated connector, permitted-use policy, processing tests, purge tests, source budget monitor.  
**Consumes:** Written authorization for the intended platform use and approved processors.  
**Produces:** Properly attributed, scoped candidate evidence or a documented decision not to enable the source.

- [ ] Test prohibition/expiry gates, bounded collection, repost clustering, and unsupported location handling.
- [ ] Test prompt-injection text without granting tool or policy authority.
- [ ] Test removal of raw and derived content according to the source policy.
- [ ] Evaluate corroborated useful evidence per unit cost against native-report alternatives.

**Acceptance:** Core product behavior remains intact when this connector is disabled or removed.

### WP-12: Pilot review and release decision

**Files:** Evaluation reports, runbooks, cost ledger, product interview synthesis, release checklist.  
**Consumes:** Actual pilot observations and measured behavior, not optimistic assumptions.  
**Produces:** A reviewed continue/narrow/pause decision for each major capability.

- [ ] Report technical reliability, decision usefulness, harm/false reassurance, engagement, costs, and willingness to pay separately.
- [ ] Distinguish seasonal limits from product failures and plan additional observation periods where necessary.
- [ ] Rehearse rollback and recovery; resolve critical privacy and settlement defects.
- [ ] Record which assumptions were supported, contradicted, or remain unknown.

**Acceptance:** Expansion is justified by evidence and approved scope, not merely by a working demo.

<a id="adrs"></a>
## 15. Architecture Decision Records

**All 20 records below have status `PROPOSED`.** None has been accepted merely because it appears in this document. The default decision owner is the human architecture/product owner; source rights, agronomy, privacy, and financial matters additionally require the relevant qualified reviewer.

Acceptance requires a dated record identifying the decision, approver, scope, rationale, and evidence. Changes to accepted records create superseding ADRs instead of rewriting history. Export each record into `docs/adrs/` during WP-00 when a repository is actually available.

### ADR-001: Start with a partner-backed regional pilot

**Context:** Continental coverage would multiply source, crop, language, and validation requirements before proving value.  
**Proposed decision:** One geographic cluster, at most two crops, and two recurring decisions; choose partner access before theoretical market size.  
**Alternatives:** Continental general-purpose platform; single-crop national platform.  
**Consequences:** Smaller initial reach but clearer evaluation and support. Expansion requires a capability pack.  
**Acceptance evidence:** Named pilot configuration, partner commitment, observation access, and success criteria.

### ADR-002: Intelligence first, participation second

**Context:** Engagement alone does not establish agronomic or commercial value.  
**Proposed decision:** The field brief and evidence workflow remain useful without Arena; Arena is a separately evaluated enhancement.  
**Alternatives:** Prediction-market-first product; social-feed-first product.  
**Consequences:** Core value survives low participation. Product metrics must separate decision usefulness from engagement.  
**Acceptance evidence:** A farmer can complete the principal decision workflow with Arena disabled.

### ADR-003: Rust service boundary with Python scientific workers

**Context:** Application correctness and scientific-model integration have different engineering needs.  
**Proposed decision:** Use Rust for the domain/API boundary, Python for scientific work, and versioned contracts between them.  
**Alternatives:** Entirely Rust; entirely Python; premature per-function microservices.  
**Consequences:** Two language environments require contract tests and independent lockfiles. No requirement to rewrite scientific libraries.  
**Acceptance evidence:** A fixture passes from application job to worker result without schema or unit drift.

### ADR-004: PostgreSQL/PostGIS as the first domain store

**Context:** The ontology is a domain modeling requirement, not automatically a graph-database requirement.  
**Proposed decision:** Store permissioned entities, spatial fields, and typed relations in PostgreSQL/PostGIS, with large assets in object storage.  
**Alternatives:** Dedicated graph database; distributed multi-store architecture.  
**Consequences:** Simpler transactions and operating model; benchmark advanced traversal before introducing another store.  
**Acceptance evidence:** Field, evidence, relation, and permission queries meet the declared pilot load tests.

### ADR-005: Preserve time, lineage, and as-of availability

**Context:** Forecast initialization, publication, observation, and ingestion times differ.  
**Proposed decision:** Preserve explicit time semantics and dependency-level availability; use versioned manifests for replay.  
**Alternatives:** A single timestamp; latest-value-only storage.  
**Consequences:** More metadata and retention design; honest limits when availability or lawful retention is missing.  
**Acceptance evidence:** Delayed-publication and revised-observation fixtures cannot leak future information into earlier decisions.

### ADR-006: Operational baselines before AI promotion

**Context:** A global model benchmark does not establish local agricultural value.  
**Proposed decision:** Keep approved operational forecasts as baseline and run one frontier challenger in shadow mode before promotion.  
**Alternatives:** AI-only forecasts; indiscriminate equal-weight ensembles.  
**Consequences:** Delays AI marketing claims but establishes measurable value and rollback.  
**Acceptance evidence:** Frozen evaluation manifest, matched comparison, calibration assessment, cost/latency results, and signed promotion decision.

### ADR-007: Rights and budget checks before source access

**Context:** API access, data rights, and commercial authorization are separate issues.  
**Proposed decision:** Require an enabled source registration before fetching, processing, storing, displaying, or exporting data.  
**Alternatives:** Ingest first and review later; assume public equals reusable.  
**Consequences:** Some attractive feeds may remain unavailable; the app must tolerate that.  
**Acceptance evidence:** Disabled, expired, prohibited-use, and over-budget requests are rejected before dispatch.

### ADR-008: Social data is optional candidate evidence

**Context:** Platform dependence, reposting, unverifiable location, and usage restrictions can undermine reliability.  
**Proposed decision:** Isolate social connectors, preserve source constraints, and prefer permissioned native observations for durable intelligence.  
**Alternatives:** Unrestricted firehose; social popularity as truth; mandatory social login.  
**Consequences:** Less volume, clearer provenance, and removable dependencies.  
**Acceptance evidence:** The product works with every social connector disabled; reposts cannot create independent corroboration.

### ADR-009: Risk modules are non-actuating decision support

**Context:** Consequences differ between a scheduling suggestion and a pesticide decision.  
**Proposed decision:** Expose reviewed evidence and bounded next steps; prohibit autonomous application, treatment, and equipment operation.  
**Alternatives:** Fully autonomous agronomic agent; universal risk-score generator.  
**Consequences:** Human judgment remains necessary; some workflows require agronomist review.  
**Acceptance evidence:** Outputs cannot claim unsupported diagnosis, safe application, or authority to actuate.

### ADR-010: Model pathways, not a universal contamination score

**Context:** Airborne, soil/equipment, insect, and runoff pathways require different inputs.  
**Proposed decision:** Separate module contracts and scopes; start with weather-aware visits and one reviewed crop experiment.  
**Alternatives:** One wind-driven risk model for every hazard.  
**Consequences:** Slower hazard expansion, less misleading inference. Missing pathway evidence produces unknown.  
**Acceptance evidence:** Unsupported pathways reject the request and source-specific scientific review approves each new module.

### ADR-011: Reputation-only Forecast League first

**Context:** Forecast skill can be tested without implementing financial exposure or virtual trading mechanics.  
**Proposed decision:** Use probability submissions, common question sets, Brier scores, and nonredeemable reputation.  
**Alternatives:** Cash market; token rewards; trading ledger at launch.  
**Consequences:** Simpler first experiment; virtual markets remain separately gated.  
**Acceptance evidence:** No money-like flows exist, matched scores are reproducible, and all question rules are inspectable.

### ADR-012: Independent, deterministic outcome resolution

**Context:** The oracle is the boundary between prediction and outcome.  
**Proposed decision:** Freeze question definitions, use approved independent observations, and preserve resolution/correction versions.  
**Alternatives:** Model-based settlement; crowd vote; participant sensor settlement.  
**Consequences:** Some questions void when data is missing; fairness takes precedence over always producing a winner.  
**Acceptance evidence:** Threshold, outage, duplicate, dispute, and correction fixtures resolve deterministically.

### ADR-013: Modular application and database-backed jobs first

**Context:** A small pilot needs reliable work execution, not a distributed-platform project.  
**Proposed decision:** Use a modular application, PostgreSQL leases/outbox, and isolated scientific workers before adding a broker or cluster scheduler.  
**Alternatives:** Kubernetes/event-bus-first deployment; generalized agent orchestration.  
**Consequences:** Fewer moving parts; scaling changes require measured limits.  
**Acceptance evidence:** Retry, timeout, lease-expiry, and worker-crash tests preserve exactly-once domain effects.

### ADR-014: Language models interpret, not adjudicate

**Context:** Fluent text can conceal unsupported quantitative or factual claims.  
**Proposed decision:** Restrict LLMs to approved extraction, translation, and evidence-grounded explanation through typed interfaces.  
**Alternatives:** LLM-generated numerical risk; free-form tool selection from social content.  
**Consequences:** Deterministic scientific outputs and fallback explanations remain authoritative.  
**Acceptance evidence:** Injection attempts cannot change tools/policies; unsupported numbers and missing citations block generated claims.

### ADR-015: Privacy extends to derivatives and offline caches

**Context:** Tiles, embeddings, exports, and cached views can leak data despite protected source rows.  
**Proposed decision:** Carry policy through derivatives and enforce revocation, retention, and deletion throughout the dependency graph.  
**Alternatives:** API-only authorization; indefinite raw/audit retention.  
**Consequences:** More deletion and cache testing; some historical results become unreproducible.  
**Acceptance evidence:** Cross-tenant, revoke-access, deletion, and backup-restore tests cover all artifact types.

### ADR-016: Promotion requires preregistered evaluation

**Context:** Retrospective tuning and cherry-picked events can exaggerate performance.  
**Proposed decision:** Freeze the relevant comparison and split before scoring; report uncertainty, failures, and incremental value.  
**Alternatives:** Vendor benchmark selection; demo-driven model promotion.  
**Consequences:** Negative findings are valid outcomes; safety and calibration can outweigh average error improvements.  
**Acceptance evidence:** A reviewer can reproduce the report and identify its scope, exclusions, and rollback criteria.

### ADR-017: Regional capability packs for expansion

**Context:** Country, crop, language, source coverage, and support requirements differ.  
**Proposed decision:** Enable explicit region/crop capabilities with local sources and reviewed scientific rules.  
**Alternatives:** Global feature flags with silent extrapolation.  
**Consequences:** Uneven but truthful coverage; visible unsupported areas.  
**Acceptance evidence:** Each expansion has approved sources, localization, scientific scope, and legal/privacy/support review.

### ADR-018: Human gates for agent-directed development

**Context:** Autonomous coding does not authorize new product commitments, spending, or high-impact changes.  
**Proposed decision:** Agents work on bounded approved packages with tests, scoped tools, and explicit stop conditions.  
**Alternatives:** One unconstrained “build everything” goal; self-approved architecture changes.  
**Consequences:** Review overhead, clearer accountability, and reversible work.  
**Acceptance evidence:** Every executed package maps to an authorization record and supplies actual verification output.

### ADR-019: No blockchain dependency in the first product

**Context:** Provenance and forecast scoring require auditability but not inherently public tokens or on-chain settlement.  
**Proposed decision:** Use a conventional auditable store and signatures/hashes where justified; introduce a chain only for a separately validated requirement.  
**Alternatives:** Token-first rewards; public on-chain farm evidence.  
**Consequences:** Less composability at launch, fewer privacy/operational obligations, and no speculative coupling to other projects.  
**Acceptance evidence:** The core workflow and league are independently auditable without a wallet or chain connection.

### ADR-020: Cost-bounded regional compute

**Context:** Per-field global inference and unlimited data ingestion can overwhelm pilot economics.  
**Proposed decision:** Reuse regional forecast products, meter every paid source/job, and require explicit budgets before GPU or paid-feed activation.  
**Alternatives:** Per-request global inference; unlimited social collection; infrastructure selected by peak theoretical scale.  
**Consequences:** More caching and accounting design; graceful degradation at caps.  
**Acceptance evidence:** Load tests show regional reuse and budget-exhaustion tests stop dispatch without breaking core cached views.

<a id="agents"></a>
## 16. Agent-directed execution protocol

### 16.1 Roles and authority

A coordinating agent may decompose **approved** work, inspect authorized code, and propose bounded tasks. An implementing agent edits only its assigned scope. A reviewer checks requirements, tests, scientific assumptions where qualified, and the actual diff. None may approve its own architecture, commercial rights, agronomic protocol, or spending.

Parallel work is allowed only when contracts and file ownership are explicit. Shared schemas and migrations require coordination before simultaneous changes. A single accountable integrator owns cross-package verification.

### 16.2 Required task packet

Every task packet contains: objective; accepted ADRs; dependencies; allowed files; input/output contracts; invariants; exact acceptance cases; commands to execute; source and network permissions; budget; rollback; and stop conditions.

The worker first inspects the repository and reports any mismatch with this specification. Do not invent a file, interface, test result, credential, partner, dataset, or previous approval. Do not overwrite unrelated work or force-push shared history.

### 16.3 Mandatory stop conditions

Stop the affected task, record the blocker, and continue only unrelated authorized work when: an ADR is missing; source permission is ambiguous; a secret or paid account is required; private data would leave the approved boundary; a scientific rule lacks review; scope crosses into money/prizes/actuation; a benchmark requires unavailable historical data; or a schema change breaks an agreed contract.

Do not solve these blockers with guessed credentials, unrestricted scraping, fabricated observations, relaxed permissions, or an LLM-generated scientific parameter.

### 16.4 Completion evidence

A task report must list changed files, behavior implemented, actual command outputs with exit status, test failures or skips, contract/schema changes, security implications, limitations, and rollback instructions. “Tests should pass” is not evidence. A screenshot is not a substitute for settlement, authorization, or numerical tests.

Use a GitLab merge request for integration. Keep docs, schemas, code, and tests in the same review when they change together. Independent review does not mean another agent merely restates the implementer's claim.

### 16.5 Copyable first-agent handoff

```text
Read docs/AGARENA_BUILD_BLUEPRINT.md, GOAL.md, AGENTS.md, and the ADR status register.

First inspect the repository. Do not assume this blueprint describes existing code.
Do not implement until the first-slice scope and relevant ADRs have human approval.

Once authorized, implement only the local synthetic field-brief slice in Section 18.
Use test-driven development, typed contracts, tenant isolation, explicit timestamps,
source provenance, and missing/stale-data handling.

Use no real farm data, paid feed, social API, GPU provisioning, live notifications,
public deployment, wallet, token, real-money feature, or agronomic actuation.

Preserve unrelated work. Report blockers rather than inventing scientific rules or
permissions. Supply actual verification output, the changed-file list, limitations,
and rollback instructions. Stop at the first-slice review gate.
```

<a id="decisions"></a>
## 17. Open decisions and business validation

### 17.1 Blocking-decision register

| ID | Decision | Owner | Blocks | Recommended next evidence |
|---|---|---|---|---|
| OD-01 | Confirm the intended expansion of “AD” | Product owner | Naming/structure conventions only | User clarification; the architecture and agent sections are separately identified |
| OD-02 | Select pilot partner, region, and crops | Product owner + agronomy lead | Live regional configuration | Partner commitment and concrete workflow interviews |
| OD-03 | Accept first-slice ADRs and choose repository | Architecture owner | Implementation | Dated acceptance and inspected repository |
| OD-04 | Select supported weather source and actual variables | Scientific/data lead | Live ingestion | Endpoint/terms review, sample data, availability checks |
| OD-05 | Set source/compute spending authority | Product/operations owner | Paid access or GPU jobs | Approved cap, responsible account, kill-switch test |
| OD-06 | Select first crop-risk protocol and reviewer | Qualified agronomy lead | Agronomic module beyond shadow experimentation | Reviewed protocol, labels, crop/region scope, error costs |
| OD-07 | Approve real observation and sharing consent | Privacy/product owner | Partner farm data | Consent purpose, retention, sharing and withdrawal workflow |
| OD-08 | Approve production identity and recovery objectives | Security/operations owner | Live pilot | Authentication design, support access, restore rehearsal |
| OD-09 | Approve each Arena question template | Scientific/product reviewer | Live question publication | Independent source, units/interval semantics, dispute policy |
| OD-10 | Resolve social processing and geographic permissions | Rights/privacy reviewer | Social connector | Permission for the exact collection and downstream use |
| OD-11 | Determine whether virtual markets add value | Product owner | R4 | League participation, user research, and separate legal/mechanism review |
| OD-12 | Complete brand clearance | Product/legal owner | Public brand commitment | Relevant name, domain, and trademark review |

An unresolved decision must remain visible with its affected gate. It is not an invitation for an executor to guess an answer.

### 17.2 Commercial experiments

Test a partner-led paid pilot before depending on a broad self-serve funnel. Interview farmers and advisers separately: who experiences the problem, who changes decisions, who approves procurement, and who pays may differ.

Measure decision value, observation contribution, forecast-league retention, willingness to pay, and support effort separately. Competitive differentiation remains a hypothesis: transparent evidence and locally useful observations must outperform the farmer's current workflow, not merely combine its screens.

Maintain a cost ledger for data licensing, social reads, storage, transfer, scientific compute, language-model processing, support, and human verification. Proposed revenue scenarios belong in a separately labeled financial model; no revenue or margin is asserted by this blueprint.

For a build beginning in September 2026, distinguish an autumn software/operations pilot from scientific validation requiring the 2027 growing season. Calendar deadlines do not establish agronomic performance.

### 17.3 Principal risks

| Risk | Early signal | Response |
|---|---|---|
| No meaningful decision improvement | Users inspect the map but do not change useful behavior | Narrow to one costly recurring decision or stop the feature |
| Sparse/biased observations | Reports cluster around a few engaged participants | Report coverage; recruit structured observations; avoid area-wide inference |
| Unsupported scientific precision | Very detailed maps with weak local validation | Preserve native resolution and uncertainty; remove misleading layers |
| Source/legal dependence | Essential data cannot be used as intended | Keep adapters optional and re-evaluate the business scope |
| Social-data costs | Low corroborated value per billable read | Reduce collection or remove the connector |
| Market manipulation or oracle problems | Coordinated entries, disputed outcomes, controlled sensors | Freeze/void affected questions; independent review and stronger templates |
| Farm privacy leakage | Unexpected access through maps, exports, or caches | Suspend sharing, contain incident, invalidate derivatives, review policies |
| Seasonal evaluation limits | Too few independent events to compare models | Report inconclusive results and collect an appropriate further sample |
| Overengineering | Infrastructure work grows faster than field workflows | Enforce ADR scope and first-slice acceptance |

<a id="first-slice"></a>
## 18. First approved development slice

### Objective

Demonstrate that one authorized user can inspect one synthetic field, view a normalized forecast, understand its source/time/resolution, and see **unknown** when a required input is missing. A second tenant must not access any private field or derived view.

### Inputs and deliverables

Use two synthetic tenants, three synthetic field geometries, two synthetic forecast issue cycles, one delayed-publication fixture, one stale observation, and one missing-input scenario. No real farm identity or paid/live source is necessary.

Deliver a minimal API, a map/list client, an evidence drawer, source freshness states, a replayable fixture path, and tests. Implement WP-01 through WP-04 only after WP-00 approval. Do not add Arena, a pest model, a social feed, or a GPU experiment to this slice.

### Acceptance checklist

- [ ] Tenant Alpha sees only its authorized fields and derived views.
- [ ] Tenant Beta cannot retrieve Alpha's objects by ID, cache, tile, or export.
- [ ] The field brief names initialization/issue/valid/availability times where applicable.
- [ ] A 3 km synthetic model grid is not represented as a field measurement.
- [ ] A delayed forecast is absent from an earlier as-of view.
- [ ] Missing and stale inputs display an explicit unknown/insufficient-evidence state.
- [ ] Source withdrawal invalidates the affected assessment.
- [ ] Core explanations work without an LLM or external network.
- [ ] The documented verification entrypoint runs from the reviewed checkout.
- [ ] The handoff contains actual results and stops before another work package is added.

**Success is a trustworthy vertical slice, not an impressive number of integrations.**

<a id="sources"></a>
## 19. Primary-source register

The following pages were reopened while preparing this document on **September 12, 2026**. Their existence and the limited facts cited above were checked; endpoints were not integrated, commercial rights were not granted, and models were not executed. Recheck time-sensitive terms, versions, and coverage before onboarding.

| ID | Primary source | What it supports here |
|---|---|---|
| S01 | [NVIDIA Earth-2][s01] | Platform/model family and experimentation candidates |
| S02 | [NOAA HRRR][s02] | U.S. short-range baseline description |
| S03 | [NWS API documentation][s03] | Official observations/alerts service reference |
| S04 | [ECCC HRDPS documentation][s04] | Canadian regional weather product reference |
| S05 | [ECMWF open data][s05] | Open forecast products and access context |
| S06 | [NVIDIA Atlas model card][s06] | Published checkpoint grid, ensemble role, and model terms reference |
| S07 | [NVIDIA StormScope model card][s07] | GOES/MRMS outputs and documented CONUS use case |
| S08 | [NVIDIA HealDA model card][s08] | Data-assimilation candidate and input-availability considerations |
| S09 | [Google WeatherNext model documentation][s09] | Current model-family reference; no blanket production permission inferred |
| S10 | [Microsoft Aurora 1.5 research announcement][s10] | Challenger research direction; deployment terms still require review |
| S11 | [X Developer Agreement][s11] | Restrictions and commercial/geographic processing context |
| S12 | [X Developer Policy][s12] | Platform-use, incentive, and content-handling constraints |
| S13 | [X API pricing][s13] | Time-sensitive per-post-read cost example |
| S14 | [CFTC prediction-markets advisory announcement][s14] | U.S. event-contract regulatory context |
| S15 | [CSA/CIRO event-contract guidance announcement][s15] | Canadian guidance scope and continuing assessment |
| S16 | [Health Canada pesticide spray-drift guidance][s16] | Application/weather considerations and drift decision boundaries |
| S17 | [Crop Protection Network: southern rust][s17] | Example of wind-related disease context |
| S18 | [Canola Council: clubroot][s18] | Example of soil/equipment-mediated disease pathways |
| S19 | [NOAA HYSPLIT][s19] | Atmospheric transport modeling reference |
| S20 | [Cornell NEWA][s20] | Weather-linked agricultural model network |
| S21 | [AI-AgARENA research testbed][s21] | Existing use of a similar agricultural name |
| S22 | [WeatherBench][s22] | Weather-model evaluation reference |

[s01]: https://www.nvidia.com/en-us/high-performance-computing/earth-2/
[s02]: https://rapidrefresh.noaa.gov/hrrr/
[s03]: https://www.weather.gov/documentation/services-web-api
[s04]: https://eccc-msc.github.io/open-data/msc-data/nwp_hrdps/readme_hrdps-datamart_en/
[s05]: https://www.ecmwf.int/en/forecasts/datasets/open-data
[s06]: https://huggingface.co/nvidia/atlas-era5
[s07]: https://huggingface.co/nvidia/stormscope-goes-mrms
[s08]: https://huggingface.co/nvidia/healda
[s09]: https://developers.google.com/weathernext/guides/models
[s10]: https://www.microsoft.com/en-us/research/blog/aurora-1-5-extending-open-foundation-models-for-weather-and-earth-system-applications/
[s11]: https://docs.x.com/developer-terms/agreement
[s12]: https://docs.x.com/developer-terms/policy
[s13]: https://docs.x.com/x-api/getting-started/pricing
[s14]: https://www.cftc.gov/PressRoom/PressReleases/9193-26
[s15]: https://www.securities-administrators.ca/news/prediction-markets-csa-and-ciro-provide-guidance-on-certain-types-of-event-contracts/
[s16]: https://www.canada.ca/en/health-canada/services/consumer-product-safety/pesticides-pest-management/growers-commercial-users/drift-mitigation/management-pesticide-spray-drift.html
[s17]: https://cropprotectionnetwork.org/publications/an-overview-of-southern-rust
[s18]: https://www.canolacouncil.org/canola-encyclopedia/diseases/clubroot/
[s19]: https://www.ready.noaa.gov/HYSPLIT.php
[s20]: https://newa.cornell.edu/
[s21]: https://translationalaicenterisu.github.io/ai-agarena/
[s22]: https://sites.research.google/gr/weatherbench/

<a id="completion"></a>
## 20. Completion and change control

### Document completion criteria

The blueprint must remain self-contained, distinguish research from proposed design, preserve unresolved decisions, include the source register, and provide testable first-slice acceptance criteria. Its Markdown structure, internal links, source references, and JSON examples should be mechanically checked before handoff.

Those checks validate the **document**, not the proposed application. Successful document validation does not mean that product tests, legal reviews, scientific evaluations, or repository builds have passed.

### Change policy

Use patch versions for nonbehavioral clarification, minor versions for compatible scope/contract additions, and a major revision for incompatible architectural changes. Accepted ADRs are superseded explicitly. Every scope change must identify affected invariants, schemas, work packages, gates, and source reviews.

Do not silently convert a research candidate into an enabled dependency, a synthetic example into a live forecast, a proposal into an approval, or a forecasting game into a financial product.

**Build order:** establish trust in the evidence; make one decision workflow useful; evaluate participation and advanced models; expand only where the evidence supports it.
