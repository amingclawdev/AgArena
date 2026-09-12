import { createHash } from 'node:crypto';
import type { AnalystClaim, ComparisonCase, ComparisonClaimInput, ComparisonMetric, ComparisonOutcome, ComparisonResult, Evidence, Forecast, InsightGroup } from '../src/contracts.ts';
import { comparisonClaimSchema, outcomeSchema } from '../src/contracts.ts';
import { findAnalyst } from './analysts.ts';
import { Store } from './store.ts';
import { getForecast } from './weather.ts';

const HOUR = 3600000;
const iso = (n: number) => new Date(n).toISOString();
export function metricDefinition(metric: ComparisonMetric) {
  return metric === 'temperature_c' ? { unit: '°C', eventDefinition: '2 m air temperature at the specified hour', field: 'temperature' as const }
    : metric === 'precipitation_mm' ? { unit: 'mm', eventDefinition: 'Total precipitation water equivalent during the preceding hour', field: 'precipitation' as const }
    : { unit: '%', eventDefinition: 'Probability of total precipitation >0.1 mm during the preceding hour', field: 'rainProbability' as const };
}
export function assertValue(metric: ComparisonMetric, value: number) {
  if (!Number.isFinite(value) || (metric === 'temperature_c' ? value < -100 || value > 70 : value < 0 || value > (metric === 'precipitation_probability' ? 100 : 1000))) throw new Error('Value is outside the metric range');
}
export function validateClaim(input: ComparisonClaimInput, evidence: Evidence, now: Date) {
  if (evidence.source.kind !== 'x' || !findAnalyst(evidence.source.account)) throw new Error('Select a captured report from the analyst shortlist');
  if (evidence.candidate.evidenceClass !== 'forecast') throw new Error('Observed reports and general context are not advance predictions');
  if (!evidence.location || evidence.location.precision !== 'town') throw new Error('A broad regional outlook cannot be scored against a town reference point');
  if (!evidence.source.publishedAt) throw new Error('Resolve the publication timestamp before registering a prediction');
  const end = Date.parse(input.validAt), start = end - (input.metric === 'temperature_c' ? 0 : HOUR);
  if (end % HOUR !== 0 || start <= now.getTime() || end > now.getTime() + 48 * HOUR) throw new Error('Choose an exact UTC hour whose entire verification period is still in the next 48 hours');
  if (Date.parse(evidence.source.publishedAt) > Date.parse(evidence.source.capturedAt) || Date.parse(evidence.source.capturedAt) > now.getTime() || Date.parse(evidence.receivedAt) > now.getTime()) throw new Error('Source chronology is inconsistent');
  const texts = [evidence.source.text, ...evidence.source.media.filter(m => m.inspected).map(m => m.observedText)];
  if (!texts.some(t => t.includes(input.quote))) throw new Error('Prediction quotation must occur literally in captured text or inspected image text');
  const numbers = input.quote.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  if (!numbers.includes(input.value)) throw new Error('Use an explicitly quoted numeric prediction; do not invent a probability or midpoint');
  const unitPattern = input.metric === 'temperature_c' ? '(?:°\\s*C|degrees?\\s+Celsius|Celsius)' : input.metric === 'precipitation_mm' ? '(?:mm|millimet(?:er|re)s?)' : '(?:%|percent)';
  const scalar = String(input.value).replace('.', '\\.');
  if (!new RegExp(`(?:^|[^0-9.−-])${scalar}\\s*${unitPattern}(?:$|[^A-Za-z])`, 'i').test(input.quote)) throw new Error('Prediction must explicitly pair the numeric value with the selected metric unit (°C, mm or %)');
  if (new RegExp(`-?\\d+(?:\\.\\d+)?\\s*(?:${unitPattern})?\\s*(?:-|−|–|—|\\bto\\b)\\s*-?\\d+(?:\\.\\d+)?\\s*${unitPattern}`, 'i').test(input.quote)) throw new Error('A numeric range is not a scalar forecast; do not choose an endpoint or midpoint');
  assertValue(input.metric, input.value);
  return { start, end, location: evidence.location };
}

export async function registerClaim(raw: unknown, store: Store, fetcher: typeof fetch = fetch, clock: () => Date = () => new Date()) {
  const input = comparisonClaimSchema.parse(raw), now = clock();
  const evidence = store.evidence().find(e => e.id === input.evidenceId);
  if (!evidence) throw new Error('Captured evidence not found');
  const { start, end, location } = validateClaim(input, evidence, now);
  const def = metricDefinition(input.metric);
  const id = createHash('sha256').update(JSON.stringify([location.id, input.metric, iso(start), iso(end)])).digest('hex').slice(0,24);
  let candidate = store.comparison(id);
  if (!candidate) {
    const f: Forecast = await getForecast(location, store, fetcher, now);
    const hour = f.hours.find(h => Date.parse(h.time) === end), value = hour?.[def.field];
    if (!['live', 'cached'].includes(f.status) || value == null || !f.fetchedAt || Date.parse(f.fetchedAt) >= start || Date.parse(f.fetchedAt) > clock().getTime()) throw new Error('A complete pre-event provider baseline is required; retry before the event');
    // The entire baseline object is retained; the normal forecast cache cannot replace it.
    candidate = { id, mode: 'live', locationId: location.id, placeName: location.name, latitude: location.lat, longitude: location.lon, metric: input.metric, ...def, validFrom: iso(start), validTo: iso(end), createdAt: clock().toISOString(), baseline: { value, fetchedAt: f.fetchedAt, issuedAt: null, sourceUrl: f.sourceUrl, provider: f.provider, latitude: f.latitude, longitude: f.longitude }, claims: [], outcome: null };
  }
  const registered = clock();
  validateClaim(input, evidence, registered); // A slow fetch must not cross the event boundary.
  if (Date.parse(evidence.source.publishedAt!) > Date.parse(candidate.baseline.fetchedAt)) throw new Error('This prediction was issued after the frozen baseline cutoff; it is not comparable in this case');
  const claim: AnalystClaim = { evidenceId: evidence.id, evidenceRevision: evidence.revision, evidenceDigest: evidence.digest, account: findAnalyst(evidence.source.account)!.account, sourceUrl: evidence.source.url, quote: input.quote, value: input.value, issuedAt: evidence.source.publishedAt!, capturedAt: evidence.source.capturedAt, registeredAt: registered.toISOString(), interpretationNote: input.interpretationNote };
  return evaluateCase(store.insertComparisonClaim(candidate, claim));
}

export function registerOutcome(id: string, raw: unknown, store: Store, now = new Date()) {
  const input = outcomeSchema.parse(raw), c = store.comparison(id);
  if (!c) throw new Error('Comparison not found');
  if (c.outcome) throw new Error('Outcome is immutable once recorded');
  if (Date.parse(c.validTo) > now.getTime()) throw new Error('Wait until the verification period ends');
  if (Date.parse(input.validFrom) !== Date.parse(c.validFrom) || Date.parse(input.validTo) !== Date.parse(c.validTo)) throw new Error('Observation must cover exactly the same UTC period');
  const outcomeMetric = c.metric === 'temperature_c' ? 'temperature_c' : 'precipitation_mm';
  if (input.metric !== outcomeMetric || (input.sourceType === 'radar_estimate' && input.metric !== 'precipitation_mm')) throw new Error('Observation metric does not match; radar does not measure air temperature');
  assertValue(input.metric, input.value);
  const km = Math.hypot((input.latitude - c.latitude) * 111, (input.longitude - c.longitude) * 111 * Math.cos(c.latitude * Math.PI / 180));
  if (km > 5) throw new Error('Observation is outside the 5 km reference-point tolerance');
  const outcome: ComparisonOutcome = { ...input, validFrom: c.validFrom, validTo: c.validTo, recordedAt: now.toISOString() };
  return evaluateCase(store.setComparisonOutcome(id, outcome));
}

export function evaluateCase(c: ComparisonCase): ComparisonResult {
  const values = c.claims.map(p => p.value), mean = values.length ? values.reduce((a,b) => a+b,0)/values.length : null;
  const score = (p: number) => c.metric === 'precipitation_probability' ? (p/100 - (c.outcome!.value > .1 ? 1 : 0)) ** 2 : Math.abs(p - c.outcome!.value);
  const consensusScore = c.outcome && mean !== null ? score(mean) : null, baselineScore = c.outcome ? score(c.baseline.value) : null;
  return { ...c, summary: { count: values.length, mean, min: values.length ? Math.min(...values) : null, max: values.length ? Math.max(...values) : null, organizations: [...new Set(c.claims.map(p => findAnalyst(p.account)?.organization ?? 'Synthetic'))], status: c.outcome ? 'evaluated' : 'awaiting_observation', scoreName: c.metric === 'precipitation_probability' ? 'Brier score' : `Absolute error (${c.unit})`, analystScores: c.outcome ? c.claims.map(p => ({ account: p.account, score: score(p.value) })) : [], consensusScore, baselineScore, improvement: consensusScore !== null && baselineScore !== null ? baselineScore-consensusScore : null } };
}

export function aggregateInsights(evidence: Evidence[]): InsightGroup[] {
  const groups = new Map<string, InsightGroup>(), seen = new Set<string>();
  for (const e of evidence) {
    // Deduplicate canonical post identity and identical text, including cross-account copies.
    const textKey = e.source.text.replace(/\s+/g,' ').trim().toLowerCase();
    const postKey = e.source.url.match(/\/status\/(\d+)/)?.[1] ?? e.id;
    if (seen.has(postKey) || seen.has(textKey)) continue;
    seen.add(postKey); seen.add(textKey);
    const date = e.source.publishedAt ? iso(Date.parse(e.source.publishedAt)).slice(0,10) : 'Unknown publication date';
    const key = `${e.location?.id ?? 'unmapped'}|${e.candidate.hazard}|${date}`;
    const group = groups.get(key) ?? { key, location: e.location?.name ?? 'Unmapped', hazard: e.candidate.hazard, date, accounts: [], reports: [] };
    if (!group.accounts.includes(e.source.account)) group.accounts.push(e.source.account);
    group.reports.push({ id: e.id, account: e.source.account, sourceUrl: e.source.url, summary: e.candidate.summary, publishedAt: e.source.publishedAt, scoreability: e.candidate.evidenceClass !== 'forecast' ? 'Context / observation; not an advance prediction' : !e.source.publishedAt ? 'Unscored: publication time unresolved' : e.location?.precision !== 'town' ? 'Unscored: location is broad or unresolved' : 'Requires numeric claim and exact future window review' });
    groups.set(key, group);
  }
  return [...groups.values()];
}

export function demoComparisons(): ComparisonResult[] {
  const c: ComparisonCase = { id: 'synthetic-london-rain', mode: 'demo', locationId: 'london', placeName: 'London, Ontario', latitude: 42.9849, longitude: -81.2453, metric: 'precipitation_probability', unit: '%', eventDefinition: metricDefinition('precipitation_probability').eventDefinition, validFrom: '2026-09-10T17:00:00Z', validTo: '2026-09-10T18:00:00Z', createdAt: '2026-09-10T12:00:00Z', baseline: { value: 40, fetchedAt: '2026-09-10T12:00:00Z', issuedAt: null, sourceUrl: 'https://github.com/amingclawdev/AgArena', provider: 'Synthetic reference forecast', latitude: 42.98, longitude: -81.25 }, claims: [60,80,70,50,90].map((value,i) => ({ evidenceId: `synthetic-${i}`, evidenceRevision: 1, evidenceDigest: 'synthetic', account: `Demo analyst ${i+1}`, sourceUrl: 'https://github.com/amingclawdev/AgArena', quote: `Synthetic prediction: ${value}% chance of >0.1 mm precipitation in London during 17:00–18:00 UTC.`, value, issuedAt: '2026-09-10T11:00:00Z', capturedAt: '2026-09-10T11:30:00Z', registeredAt: '2026-09-10T12:00:00Z', interpretationNote: 'Invented demonstration, not a real analyst statement.' })), outcome: { metric: 'precipitation_mm', value: 1.2, validFrom: '2026-09-10T17:00:00Z', validTo: '2026-09-10T18:00:00Z', sourceType: 'station', sourceUrl: 'https://github.com/amingclawdev/AgArena', sourceName: 'Synthetic station', latitude: 42.9849, longitude: -81.2453, coverageComplete: true, reviewed: true, note: 'Invented observation for a repeatable scoring example.', recordedAt: '2026-09-10T19:00:00Z' } };
  return [evaluateCase(c), evaluateCase({ ...c, id: 'synthetic-pending', validFrom: '2026-09-11T17:00:00Z', validTo: '2026-09-11T18:00:00Z', outcome: null })];
}
