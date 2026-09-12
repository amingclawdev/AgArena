import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { admitCapture, canonicalJson, temporalStatus } from '../server/evidence.ts';
import { places, resolvePlace } from '../server/places.ts';
import { Store } from '../server/store.ts';
import { demoForecast, getForecast, makeAlerts, normalizeForecast } from '../server/weather.ts';
import { testCapture, testWeather } from '../scripts/test-data.ts';

const now = new Date('2026-09-12T18:12:00Z');
const copy = <T>(x: T): T => JSON.parse(JSON.stringify(x));
const response = (data: unknown) => Promise.resolve(new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } }));

test('admission preserves separate timestamps and reference geography', () => {
  const packet = testCapture(now);
  packet.source.publishedAt = '2026-09-12T08:36:00-04:00';
  packet.candidate.observedAt = '2026-09-02T18:00:00Z';
  const evidence = admitCapture(packet, now);
  assert.equal(evidence.temporalStatus, 'historical');
  assert.equal(evidence.source.publishedAt, '2026-09-12T08:36:00-04:00');
  assert.equal(evidence.source.capturedAt, now.toISOString());
  assert.equal(evidence.location?.id, 'monkton');
  assert.match(evidence.locationReason, /not a confirmed event footprint/);
});

test('malformed captures, unsupported permalinks, account mismatch and future capture are rejected', () => {
  for (const mutate of [
    (p: ReturnType<typeof testCapture>) => { p.source.text = '  '; },
    (p: ReturnType<typeof testCapture>) => { p.source.url = 'https://evil.test/post'; },
    (p: ReturnType<typeof testCapture>) => { p.source.account = 'SomeoneElse'; },
    (p: ReturnType<typeof testCapture>) => { p.source.capturedAt = '2026-09-13T18:00:00Z'; },
    (p: ReturnType<typeof testCapture>) => { p.source.publishedAt = '2026-09-13T18:00:00Z'; },
    (p: ReturnType<typeof testCapture>) => { p.source.publishedAt = '2026-09-12T08:36:00'; },
    (p: ReturnType<typeof testCapture>) => { p.analysis.method = 'demo-fixture'; },
  ]) { const packet = testCapture(now); mutate(packet); assert.throws(() => admitCapture(packet, now)); }
});

test('image claims require actual recorded inspection details; unseen image text cannot map', () => {
  const packet = testCapture(now); packet.candidate.locationQuote = 'Huron County'; packet.candidate.placeQuery = 'Huron County';
  packet.source.media = [{ url: 'https://pbs.twimg.com/media/test.png', kind: 'photo', inspected: false, description: '', observedText: '' }];
  packet.candidate.imageFindings = ['Invented map label'];
  assert.throws(() => admitCapture(packet, now), /inspected image/);
  packet.candidate.imageFindings = [];
  packet.source.media[0].observedText = 'Huron County';
  assert.throws(() => admitCapture(packet, now), /requires inspection/);
  packet.source.media[0].observedText = ''; packet.source.media[0].inspected = true;
  assert.throws(() => admitCapture(packet, now), /requires a description/);
  packet.source.media[0].observedText = 'Huron County';
  assert.equal(admitCapture(packet, now).location?.id, 'huron');
  packet.source.media[0].url = 'https://example.test/map.png';
  assert.throws(() => admitCapture(packet, now), /image host/);
});

test('Ontario hashtags match only an exact source quotation and supported place names', () => {
  const text = 'Cool start across Southern #Ontario.';
  assert.equal(resolvePlace('Southern Ontario', 'Southern #Ontario', text).location?.id, 'southern-ontario');
  assert.equal(resolvePlace('Southern Ontario', 'Southern Ontario', text).location, null);
  assert.equal(resolvePlace('Monkton', 'Monktonville', 'Monktonville storm').location, null);
  assert.equal(resolvePlace('London', 'London', 'London storm').location, null);
  assert.equal(resolvePlace('London, Ontario', 'London, Ontario', 'London, Ontario report').location?.id, 'london');
  assert.equal(resolvePlace('Ottawa', 'Ottawa', 'Ottawa report').location, null);
  assert.equal(resolvePlace('Monkton', null, 'Monkton report').location, null);
});

test('unknown report times stay unknown; social forecast is an outlook', () => {
  const packet = testCapture(now);
  packet.candidate.observedAt = null; assert.equal(temporalStatus(packet, now), 'unknown');
  packet.candidate.observedAt = '2026-09-13T18:00:00Z'; assert.equal(temporalStatus(packet, now), 'unknown');
  packet.candidate.evidenceClass = 'forecast'; assert.equal(temporalStatus(packet, now), 'outlook');
});

test('SQLite recaptures remain one independent observation, edits append immutable revisions, and survive reopening', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'agarena-unit-')), 'test.sqlite');
  let store = new Store(path);
  const packet = testCapture(now);
  const first = store.ingest(admitCapture(packet, now));
  const reread = copy(packet); reread.source.capturedAt = new Date(now.getTime() + 1000).toISOString();
  reread.source.url = reread.source.url.replace('x.com', 'twitter.com') + '/'; reread.source.account = '@WxOntario1';
  assert.equal(store.ingest(admitCapture(reread, new Date(now.getTime() + 1000))).duplicate, true);
  assert.equal(store.revisions(first.evidence.id).length, 1);
  reread.candidate.summary = 'Corrected interpretation';
  const changed = store.ingest(admitCapture(reread, new Date(now.getTime() + 1000)));
  assert.equal(changed.evidence.revision, 2);
  assert.equal(changed.evidence.independentEvidence, 1);
  assert.equal(store.revisions(first.evidence.id)[0].candidate.summary, packet.candidate.summary);
  reread.analysis.version = 'revised-method';
  assert.equal(store.ingest(admitCapture(reread, new Date(now.getTime() + 1000))).evidence.revision, 3);
  store.close(); store = new Store(path);
  assert.equal(store.evidence().length, 1); assert.equal(store.revisions(first.evidence.id).length, 3); store.close();
});

test('canonical JSON ignores object key insertion order', () => assert.equal(canonicalJson({ b: 2, a: [1, { z: 3 }] }), canonicalJson({ a: [1, { z: 3 }], b: 2 })));

test('normal provider response covers the current hour and next day with separate source attribution', () => {
  const f = normalizeForecast(testWeather(now), places[0], now);
  assert.equal(f.status, 'live'); assert.equal(f.hours.length, 48);
  assert.equal(f.hours[0].time, '2026-09-12T18:00:00.000Z');
  assert.equal(f.provider, 'Open-Meteo'); assert.equal(f.issuedAt, null);
});

test('provider invalid units, coordinates, coverage, gaps and impossible values are rejected', () => {
  for (const mutate of [
    (d: ReturnType<typeof testWeather>) => { d.hourly_units.wind_speed_10m = 'm/s'; },
    (d: ReturnType<typeof testWeather>) => { d.latitude = 0; },
    (d: ReturnType<typeof testWeather>) => { d.hourly.time = d.hourly.time.map(t => t + 86400 * 2); },
    (d: ReturnType<typeof testWeather>) => { d.hourly.time[1] = d.hourly.time[0]; },
    (d: ReturnType<typeof testWeather>) => { d.hourly.temperature_2m.pop(); },
    (d: ReturnType<typeof testWeather>) => { d.hourly.temperature_2m[0] = 150; },
    (d: ReturnType<typeof testWeather>) => { d.hourly.precipitation_probability[0] = 101; },
    (d: ReturnType<typeof testWeather>) => { d.hourly.precipitation[0] = -1; },
    (d: ReturnType<typeof testWeather>) => { d.hourly.wind_speed_10m[0] = -1; },
    (d: ReturnType<typeof testWeather>) => { d.hourly.weather_code[0] = 500; },
  ]) { const data = testWeather(now); mutate(data); assert.throws(() => normalizeForecast(data, places[0], now)); }
  assert.throws(() => normalizeForecast(testWeather(now, 23), places[0], now), /Incomplete/);
});

test('null weather remains partial and never produces a clear-window message', () => {
  const data = testWeather(now); data.hourly.temperature_2m[3] = null;
  const f = normalizeForecast(data, places[0], now);
  assert.match(f.note, /partial/); assert.equal(f.hours[3].temperature, null);
  const alerts = makeAlerts(f); assert.deepEqual(alerts.map(a => a.kind), ['unknown']);
  data.hourly.precipitation_probability.fill(null); data.hourly.wind_speed_10m.fill(null);
  assert.equal(makeAlerts(normalizeForecast(data, places[0], now))[0].kind, 'unknown');
});

test('alerts are deduplicated across cached/live responses and demo acknowledgement IDs are isolated', () => {
  const data = testWeather(now); data.hourly.precipitation_probability.fill(70); data.hourly.wind_speed_10m.fill(40);
  const f = normalizeForecast(data, places[0], now);
  const alerts = makeAlerts(f); assert.deepEqual(alerts.map(a => a.kind), ['rain', 'wind']);
  assert.deepEqual(makeAlerts({ ...f, status: 'cached' }), alerts);
  assert.ok(makeAlerts({ ...f, status: 'demo' }).every(a => a.id.startsWith('demo-')));
  assert.ok(makeAlerts(demoForecast(places[0])).every(a => a.id.startsWith('demo-')));
});

test('fetch caches fresh results, expires them, and provider failures expose unavailable without stale hours', async () => {
  const store = new Store(':memory:'); let calls = 0;
  const fetcher: typeof fetch = async () => { calls++; return new Response(JSON.stringify(testWeather(now))); };
  const first = await getForecast(places[0], store, fetcher, now); assert.equal(first.status, 'live');
  assert.equal((await getForecast(places[0], store, fetcher, now)).status, 'cached'); assert.equal(calls, 1);
  const failure = await getForecast(places[0], store, async () => new Response('', { status: 503 }), new Date(now.getTime() + 16 * 60000));
  assert.equal(failure.status, 'unavailable'); assert.deepEqual(failure.hours, []); assert.equal(makeAlerts(failure)[0].kind, 'unknown');
  store.close();
});

test('in-flight fetches coalesce per store and failed synchronous requests can retry', async () => {
  const firstStore = new Store(':memory:'); const secondStore = new Store(':memory:'); let calls = 0;
  const fetcher: typeof fetch = async () => { calls++; await new Promise(resolve => setTimeout(resolve, 5)); return response(testWeather(now)); };
  await Promise.all([getForecast(places[0], firstStore, fetcher, now), getForecast(places[0], firstStore, fetcher, now), getForecast(places[0], secondStore, fetcher, now)]);
  assert.equal(calls, 2); firstStore.close(); secondStore.close();
  const retryStore = new Store(':memory:');
  assert.equal((await getForecast(places[0], retryStore, () => { throw new Error('offline'); }, now)).status, 'unavailable');
  assert.equal((await getForecast(places[0], retryStore, () => response(testWeather(now)), now)).status, 'live'); retryStore.close();
});
