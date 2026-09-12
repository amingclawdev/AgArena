# Local prototype decisions — 2026-09-12

The user's request, “Look into the research in the docs folder and build”, authorizes reversible local implementation. It does not signify individual approval of every proposed ADR, production release, source rights, or spending. Original ADRs remain proposed.

## Implemented scope

A synthetic field-brief prototype based on blueprint Section 18: two tenants, three fields, two issue cycles including delayed availability, stale local observation, missing-input and withdrawal scenarios, offline schematic map/list, evidence drawer and export. CPU only, no external data calls or paid services. The source of truth is `server/domain.mjs`.

## Local implementation choice

Use React/TypeScript and Node, the small-service option from RESEARCH_AJM. Node 24 is installed; Rust/Cargo are unavailable. This is a reversible prototype decision, not acceptance or supersession of the proposed production Rust/Python/PostGIS ADRs. A persistent store, production auth and scientific workers require subsequent implementation. The diagrammatic map avoids external map requests and cannot establish actual field position or scale.

## Evidence behavior

Only cycles available and ingested by decision time are eligible. Forecasts become stale after the explicit 18-hour demo rule. Missing, stale, unsupported and withdrawn are distinct unknown states. Withdrawal overrides historical replay. No runtime scientific claims or quantitative risk scores are generated. The 24-hour accumulation equals the first four six-hour fixture intervals for the noon cycle. Older-cycle values are a separate synthetic issue, never differenced against the new cycle.

## Open gates

Live region/partner/crops, provider review, agronomic protocols, real observation consent, production identity, brand clearance, persistence and deployment remain open. No GitLab project is configured by this work; no remote PR/MR is created. This repository remains the inspected local repository.

## @WxOntario connector follow-up

The user subsequently requested X analysis of @WxOntario. Implemented a fixed-account official API connector with manual refresh and local keyword tagging. Token absent during implementation, so no live calls or account-verification claims. Read enablement is false by default; one account lookup and at most five posts per server start, no retries. This is a local extension, not acceptance of continuous social ingestion or production rights. Snapshot display expires after 15 minutes; production compliance, account access and monetary budget remain unverified.
