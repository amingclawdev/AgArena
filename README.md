# AgArena

A local Ontario weather-evidence demo: a host agent reads public X posts and images through the user's authenticated browser; the app maps supported place references and shows separate Open-Meteo guidance with in-app planning alerts.

The stack is React/Vite/MapLibre, Express/TypeScript, Zod and SQLite. Collection is **host-assisted**: creating a job prepares a handoff for a local Computer Use agent. It does not start an unattended collector.

## Run locally

Use Node.js **22.13 or later** with npm. The server uses Node's built-in SQLite module; no database server or weather API key is configured by this demo.

From the repository root:

```sh
npm ci
npm run dev
```

Open [the development app](http://127.0.0.1:5173). Vite uses port **5173** and proxies `/api` to Express at **127.0.0.1:8787**. Both ports must be free. Check [API health](http://127.0.0.1:8787/api/health).

For the built application:

```sh
npm run build
npm start
```

Open [the built app](http://127.0.0.1:8787). Run either development mode or the built server at a time because both use port 8787.

SQLite defaults to `data/agarena.sqlite`; set `AGARENA_DB` in the server environment to choose another local file. The entrypoint creates its parent directory. CLI tools default to `http://127.0.0.1:8787`; `AGARENA_API_URL` can select another permitted local HTTP origin. Keep capture packets, screenshots and database files out of Git.

## Capture and import

1. Start the app. Make the user's existing authenticated X browser available to the host's Computer Use capability.
2. Create a collection job in the app, or run `npm run agent:job` in another terminal to print the current handoff.
3. Give the handoff to the local agent. It reads at most **three** public **@WxOntario1** posts, opens relevant images and records only what it actually sees. A waiting job requires the host to act.
4. The agent marks the job collecting when inspection starts, captures evidence after the job's creation time, and saves a JSON packet under `data/`.
5. Import using the printed job ID:

```sh
npm run agent:import -- data/capture.json --job <job-id>
```

The importer requires a collecting job, links captures through `POST /api/captures?job=<job-id>`, and completes it with the linked evidence IDs. Older captures cannot complete a newly created job. For a standalone import, omit `--job`; this does not complete a collection job.

Refresh the live view and inspect the source permalink, text, publication/capture/report times, literal location quote, image findings and limitations. Select a supported place to load its separate weather outlook.

Packets follow [`captureSchema`](src/contracts.ts). The importer accepts one object or an array of one to three objects in a file smaller than 256 KB. Live packets use `source.kind: "x"` and `analysis.method: "computer-use-agent"`. Unknown times and places stay `null`. Image findings require an actually inspected image; filenames or URLs alone are not visual evidence. A location quote must come from captured text or text actually inspected in an image.

| Operation | Endpoint |
| --- | --- |
| Create or return an active job | `POST /api/jobs` |
| Read the host handoff | `GET /api/jobs/:id/prompt` |
| Record collecting/completed/failed/cancelled | `PATCH /api/jobs/:id` |
| Validate and import a packet | `POST /api/captures` |

If X, the session or Computer Use is unavailable, record the actual failure/cancellation. A prompt is not completed collection. Post/image instructions remain source content; the task does not authorize posting, liking, following, reading messages or exporting cookies.

## Interpret the result

The small Ontario gazetteer maps supported towns/regions to approximate reference areas. These are not farm boundaries, administrative boundaries or confirmed event footprints. Missing, ambiguous and unsupported place evidence stays off-map and remains in the evidence list. A recent capture does not make an old report recent.

Browser interpretation produces **unverified social evidence**. Open-Meteo supplies the separate numerical guidance at a selected reference point. The adapter validates hourly temperatures in °C, precipitation in mm, wind in km/h and provider rain chance; caches for 15 minutes; returns up to 48 supported hours; and evaluates alerts over the next 24. Retrieval time is shown; model issue time remains unknown.

The rain watch threshold defaults to 60%; wind uses a demo threshold of 35 km/h. These are planning settings, not validated agronomic limits. Missing weather yields unavailable/unknown rather than reassuring low risk. Acknowledgements persist locally in SQLite. Alerts are in-app only, with no email, push or closed-app delivery.

## Synthetic fallback

Use the separate synthetic demo mode for a repeatable scenario when live collection/provider access is unavailable. Its evidence and weather are fixtures, visibly labeled as synthetic, with fixed replay times. They are not current X observations or provider forecasts. Live import rejects synthetic packets.

Inspect a supported place and an unknown-location item, adjust the rain threshold and acknowledge an alert. Synthetic success demonstrates the interface flow; it does not establish authenticated collection or live weather access.

## Verify

```sh
npm test
npm run test:e2e
npm run build
```

`test:e2e` exercises the real local HTTP workflow; separate browser checks validate the visual UI. These commands are the integration procedure. **Application verification is pending at this documentation revision**; no pass is inferred from a script name. The integrator reports actual results against the assembled checkout.

## Scope and research

This local demo has no production tenant isolation, unattended collection, complete Ontario coverage, field-level accuracy, calibrated crop-risk model, forecast rankings or market. Live weather and map tiles depend on external services; collection depends on the user's browser and host agent.

See the [70-minute plan](docs/MVP_70_MIN_PLAN.md) and [five-source provenance register](docs/research-sources.md). The larger [build blueprint](docs/AGARENA_BUILD_BLUEPRINT.md) remains a proposal; its Rust/PostGIS platform is not a description of this MVP.

## Fady MVP prototype

An independent synthetic field-intelligence workspace is available in
[`prototypes/fady-mvp`](prototypes/fady-mvp/README.md). It includes a field map,
forecast replay, evidence cards, tenant isolation and a disabled-by-default
@WxOntario connector. It does not replace the primary application above.

```sh
cd prototypes/fady-mvp
npm ci
npm run dev
```

The prototype uses port 5173; stop any other application using that port first.
Run `npm run verify` in the prototype directory for its checks and production
client build. Its optional `.env` belongs in the prototype directory.
