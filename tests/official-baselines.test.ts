import { test } from "node:test";
import assert from "node:assert/strict";
import {
  officialBaselines,
  baselineStatus,
} from "../shared/official-baselines.js";
import { officialCapture } from "../shared/official-capture.js";
import { cases, analysts } from "../shared/analyst-watch.js";
test("each case distinguishes captured, indexed and missing official evidence", () => {
  for (const c of cases) assert.ok(officialBaselines[c.id]);
  assert.equal(
    baselineStatus(officialBaselines.weekend),
    "Official forecast · captured snapshot",
  );
  assert.equal(
    baselineStatus(officialBaselines.sep9),
    "Provisional · indexed history",
  );
  assert.equal(officialBaselines.outbreak.product, "warning");
  assert.equal(
    baselineStatus(officialBaselines.monkton),
    "Historical baseline missing",
  );
  assert.equal(officialBaselines.monkton.product, "unavailable");
  assert.equal(
    analysts.length,
    6,
    "agency baseline must not inflate the analyst shortlist",
  );
});
test("captured forecast keeps its issue time and retrieval provenance", () => {
  assert.ok(
    Date.parse(officialCapture.retrievedAt) >=
      Date.parse(officialCapture.issuedAt),
  );
  assert.equal(officialCapture.issuedAt, "2026-09-12T15:00:00Z");
  assert.match(officialCapture.sourceSha256, /^[a-f0-9]{64}$/);
  assert.equal(new URL(officialCapture.sourceUrl).hostname, "weather.gc.ca");
  assert.match(
    officialCapture.excerpt,
    /11:00 AM EDT Saturday 12 September 2026/,
  );
  assert.match(
    officialCapture.excerpt,
    /Tonight.*40 percent chance of showers/,
  );
});
