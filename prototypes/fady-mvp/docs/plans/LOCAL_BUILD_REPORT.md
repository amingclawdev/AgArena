# Local build evidence — September 12, 2026

## Delivered

React field workspace, offline schematic map with selection and zoom, searchable list, forecast horizon chart, field brief, evidence drawer, JSON snapshot export, demo organization picker and replay controls. Node API applies session-bound tenant checks to brief, evidence, tile and export routes. Temporal logic separately checks availability and ingestion. Unknown states suppress current-weather figures and chart; native grid resolution is explicit.

Changed files: root package/lock/TypeScript/index manifests, README, GOAL, apps/web/src/main.tsx and style.css, server/domain.mjs and index.mjs, tests/domain.test.mjs and http.mjs, docs/decisions.md and this report. Original research files are unchanged.

## Actual checks

- Initial `npm test`: exit 1, missing domain module, before implementation.
- Final `npm run verify`: exit 0. TypeScript passed; 7 domain tests passed; Vite 6.4.3 production client build passed (213.54 kB JavaScript, 66.35 kB gzip).
- `node tests/http.mjs` against the running localhost server: exit 0. Unauthenticated access rejected; Beta denied Alpha brief/evidence/tile/export; authorized access permitted with no-store headers; changing session invalidates old cookie; cross-origin session requests and malformed replay time rejected.
- npm installation audit after Vite patch: 0 vulnerabilities. Initial Vite advisory was remediated by upgrading to 6.4.3 and rebuilding.
- Browser: default workspace rendered, evidence drawer displayed full forecast timestamps and resolution; withdrawn scenario showed unknown, no figures and no usable chart; Beta displayed only West pasture. Restarted final server and confirmed default Alpha workspace.
- Narrow viewport override was attempted but the browser capture appeared scaled; mobile visual verification is incomplete. Responsive CSS is implemented, but no claim of full accessibility or mobile certification is made.

The HTTP suite is an explicit integration command, separate from offline `npm run verify`; start `npm run dev` first. Dependency installation and localhost process/network access required environment permissions. These were granted for the executed commands.

## Scope limitations and rollback

This is a local R0 prototype, not completion of every WP-01–04 infrastructure requirement. No Rust toolchain, persistent database, field creation/geometry validator, actual source-ingestion registry, scientific worker, production identity, live weather, notifications, social integration or Arena exists. Demo sessions permit switching synthetic tenants and are not a real account system. The map is schematic. See README and docs/decisions.md for explicit scope and rationale.

No remote integration, public deployment or external resource was created. Rollback consists of removing the newly listed app files and restoring README; original research is unaffected.
