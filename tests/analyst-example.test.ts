import { test } from "node:test";
import assert from "node:assert/strict";
import { analystExample, locationEnvelope } from "../shared/analyst-example.js";
test("location envelope encloses all published coordinates and is explicitly derived", () => {
  const feature = locationEnvelope(),
    ring = feature.geometry.coordinates[0];
  assert.deepEqual(ring[0], ring.at(-1));
  assert.equal(ring.length, 5);
  for (const p of analystExample.points) {
    assert.ok(p.coordinates[0] > ring[0][0] && p.coordinates[0] < ring[1][0]);
    assert.ok(p.coordinates[1] > ring[0][1] && p.coordinates[1] < ring[2][1]);
  }
  assert.equal(feature.properties?.notOfficialDamageBoundary, true);
  assert.equal(feature.properties?.paddingMetres, 500);
  assert.ok(feature.properties?.source.includes("uwo.ca/ntp/"));
});
