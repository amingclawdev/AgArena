import { test } from "node:test";
import assert from "node:assert/strict";
import { getBrief, listFields } from "../server/domain.js";
test("tenant field list and guessed IDs remain isolated", () => {
  assert.equal(listFields("alpha").length, 2);
  assert.equal(listFields("beta").length, 1);
  assert.equal(
    getBrief("beta", "north", "2026-09-12T15:00:00Z", "normal"),
    null,
  );
});
test("replay excludes later publication and ingestion", () => {
  assert.equal(
    getBrief("alpha", "north", "2026-09-12T12:00:00Z", "normal")?.forecast?.id,
    "forecast-06",
  );
  assert.equal(
    getBrief("alpha", "north", "2026-09-12T15:00:00Z", "normal")?.forecast?.id,
    "forecast-12",
  );
  assert.equal(
    getBrief("alpha", "north", "2026-09-12T05:00:00Z", "normal")?.forecast,
    null,
  );
});
test("missing, stale and withdrawn evidence never becomes low risk", () => {
  for (const scenario of ["missing", "stale", "withdrawn"] as const) {
    const b = getBrief("alpha", "north", "2026-09-12T15:00:00Z", scenario)!;
    assert.equal(b.status, "unknown");
    assert.equal(b.forecast, null);
  }
});
test("model geometry and field observations retain different support", () => {
  const b = getBrief("alpha", "north", "2026-09-12T15:00:00Z", "normal")!;
  assert.equal(b.forecast?.support, "3 km model grid");
  assert.equal(b.observation?.type, "field_observation");
  assert.equal(b.observation?.quality, "stale");
  assert.equal(b.localStatus, "unknown");
  assert.ok(
    b.evidence.every((e) => Date.parse(e.availableAt) <= Date.parse(b.asOf)),
  );
});

test("ingestion cutoff includes the run only when the system had received it", () => {
  assert.equal(
    getBrief("alpha", "north", "2026-09-12T14:05:00Z", "normal")?.forecast?.id,
    "forecast-06",
  );
  assert.equal(
    getBrief("alpha", "north", "2026-09-12T14:10:00Z", "normal")?.forecast?.id,
    "forecast-12",
  );
});
