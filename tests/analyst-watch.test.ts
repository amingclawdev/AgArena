import { test } from "node:test";
import assert from "node:assert/strict";
import {
  analysts,
  insights,
  cases,
  caseInsights,
  comparablePairs,
  type Insight,
} from "../shared/analyst-watch.js";

test("shortlist and evidence preserve source identity without claiming mutual follows", () => {
  assert.equal(analysts.filter((a) => a.id !== "wxontario").length, 5);
  assert.equal(new Set(analysts.map((a) => a.id)).size, analysts.length);
  assert.equal(new Set(insights.map((i) => i.id)).size, insights.length);
  for (const a of analysts) {
    assert.equal(a.mutualFollow, "unverified");
    assert.equal(new URL(a.connectionUrl).protocol, "https:");
  }
  for (const i of insights) {
    const author = analysts.find((a) => a.id === i.analystId);
    assert.ok(author);
    assert.ok(cases.some((c) => c.id === i.caseId));
    const url = new URL(i.url);
    assert.equal(url.protocol, "https:");
    if (url.hostname === "x.com")
      assert.ok(url.pathname.startsWith(`/${author.handle}/status/`));
    assert.match(i.publishedOn, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(i.caveat.length > 0);
  }
});
test("comparisons require matching event and reviewed spatial/time overlap", () => {
  const pair = caseInsights("weekend");
  assert.equal(comparablePairs(pair).length, 1);
  assert.equal(comparablePairs(caseInsights("sep9")).length, 1);
  for (const changed of [
    { eventOn: "2026-09-13" },
    { comparisonKey: "different-region-or-window" },
    { comparisonKey: undefined },
    { kind: "observation" as const },
    { analystId: pair[0].analystId },
    { sourceFamily: pair[0].sourceFamily },
  ])
    assert.equal(
      comparablePairs([pair[0], { ...pair[1], ...changed }]).length,
      0,
    );
});
test("shared retrospective evidence never becomes forecast agreement", () => {
  assert.equal(comparablePairs(caseInsights("monkton")).length, 0);
  assert.equal(comparablePairs(caseInsights("outbreak")).length, 0);
  assert.equal(caseInsights("monkton", "all", true).length, 0);
  assert.equal(caseInsights("outbreak", "all", true).length, 1);
  assert.equal(caseInsights("weekend", "doug").length, 1);
  assert.equal(caseInsights("monkton", "doug").length, 0);
  const observations: Insight[] = caseInsights("monkton").map((i) => ({
    ...i,
    comparisonKey: "forced-same-key",
  }));
  assert.equal(comparablePairs(observations).length, 0);
});
