import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../server/store.ts';
import { admitCapture } from '../server/evidence.ts';
import { aggregateInsights, demoComparisons, evaluateCase, registerClaim, registerOutcome, validateClaim } from '../server/comparisons.ts';
import { analysts, researchExamples } from '../server/analysts.ts';
import { testCapture, testWeather } from '../scripts/test-data.ts';
import type { ComparisonClaimInput, Evidence } from '../src/contracts.ts';

const now = new Date('2026-09-12T12:15:00Z');
const clock = () => now;
function source(account = 'WxOntario1', value = 80, serial = '1000000000000000080'): Evidence {
  const p = testCapture(now, serial); p.source.account = account; p.source.url = `https://x.com/${account}/status/${serial}`;
  p.source.publishedAt = '2026-09-12T11:00:00Z';
  p.source.text = `Test fixture from ${account}: Monkton has ${value}% chance of >0.1 mm total precipitation during 14:00–15:00 UTC on September 12, 2026.`;
  p.candidate.evidenceClass = 'forecast'; p.candidate.placeQuery = 'Monkton'; p.candidate.locationQuote = 'Monkton';
  return admitCapture(p, now);
}
const input = (e: Evidence): ComparisonClaimInput => ({ evidenceId: e.id, metric: 'precipitation_probability', validAt: '2026-09-12T15:00:00Z', value: Number(e.source.text.match(/(\d+)%/)![1]), quote: e.source.text, interpretationNote: 'Test review: explicit town, percent threshold and exact UTC hour.', reviewed: true });
const provider: typeof fetch = async () => { const data = testWeather(now); data.hourly.precipitation_probability = data.hourly.precipitation_probability.map(() => 40); return new Response(JSON.stringify(data)); };
const outcome = { metric: 'precipitation_mm', value: 1.2, validFrom: '2026-09-12T14:00:00Z', validTo: '2026-09-12T15:00:00Z', sourceType: 'station', sourceUrl: 'https://example.org/test-observation', sourceName: 'Synthetic test station', latitude: 43.677, longitude: -81.087, coverageComplete: true, reviewed: true, note: 'Test observation: complete hourly water-equivalent precipitation.' };

test('directory contains exactly five more verified identities, separate from dated unscored research', () => {
  assert.equal(analysts.filter(a => !a.existing).length, 5); assert.equal(new Set(analysts.map(a => a.account)).size, 6);
  assert.equal(researchExamples.length, 5); assert.ok(researchExamples.every(e => !('value' in e) && e.sourceUrl.startsWith('https://')));
});
test('quote must explicitly bind units and scalar; context, broad scope, unknown times and hindsight are rejected', () => {
  const e = source(), i = input(e); validateClaim(i,e,now);
  for (const metric of ['temperature_c','precipitation_mm'] as const) assert.throws(() => validateClaim({...i,metric},e,now), /metric unit/);
  const mm = structuredClone(e); mm.source.text = 'Monkton: 12 mm of rain tomorrow.';
  assert.throws(() => validateClaim({...i,metric:'temperature_c',value:12,quote:mm.source.text},mm,now), /metric unit/);
  const range = structuredClone(e); range.source.text = 'Monkton 20–25 °C tomorrow';
  assert.throws(() => validateClaim({...i,metric:'temperature_c',value:25,quote:range.source.text},range,now));
  range.source.text = 'Monkton 10 to 20 °C at 15:00 UTC';
  assert.throws(() => validateClaim({...i,metric:'temperature_c',value:20,quote:range.source.text},range,now), /range/);
  range.source.text = 'Monkton 20 °C at 15:00 UTC on 2026-09-12';
  validateClaim({...i,metric:'temperature_c',value:20,quote:range.source.text},range,now);
  assert.throws(() => validateClaim({...i,quote:'Invented 80%'},e,now), /literally/);
  assert.throws(() => validateClaim(i,{...e,source:{...e.source,publishedAt:null}},now), /publication/);
  assert.throws(() => validateClaim(i,{...e,location:{...e.location!,precision:'region'}},now), /regional/);
  assert.throws(() => validateClaim(i,{...e,candidate:{...e.candidate,evidenceClass:'report'}},now), /advance/);
  assert.throws(() => validateClaim({...i,validAt:'2026-09-12T13:00:00Z'},e,now), /entire/);
  assert.throws(() => validateClaim({...i,validAt:'2026-09-12T15:30:00Z'},e,now), /exact UTC/);
});
test('pre-event baseline freezes, exact events aggregate accounts once, and SQLite reopening preserves it', async () => {
  const db=join(mkdtempSync(join(tmpdir(),'ag-compare-')),'store.sqlite'); const s=new Store(db);
  try {
    const e=source(); s.ingest(e); const first=await registerClaim(input(e),s,provider,clock);
    assert.equal(first.summary.consensusScore,null); assert.equal(first.baseline.value,40);
    const cached=s.forecast('monkton')!; cached.hours.forEach(h=>h.rainProbability=99); s.saveForecast(cached);
    const second=source('gtaweather1',60,'1000000000000000060'); s.ingest(second);
    const two=await registerClaim({...input(second),validAt:'2026-09-12T11:00:00-04:00'},s,provider,clock);
    assert.equal(two.id,first.id); assert.equal(two.summary.mean,70); assert.equal(two.baseline.value,40);
    assert.equal((await registerClaim(input(e),s,provider,clock)).summary.count,2);
    const changed={...input(e),value:60}; await assert.rejects(registerClaim(changed,s,provider,clock));
    const later=source('AnthonyFarnell',90,'1000000000000000090'); later.source.publishedAt='2026-09-12T12:16:00Z'; later.source.capturedAt='2026-09-12T12:17:00Z'; s.ingest(later);
    await assert.rejects(registerClaim(input(later),s,provider,()=>new Date('2026-09-12T12:18:00Z')),/cutoff/);
    const reopened=new Store(db); assert.equal(reopened.comparison(first.id)!.baseline.value,40); assert.equal(reopened.comparison(first.id)!.claims.length,2); reopened.close();
  } finally { s.close(); }
});
test('identical copied quote cannot gain another vote; later evidence revisions do not rewrite frozen claims', async () => {
  const s=new Store(':memory:'); try {
    const a=source();s.ingest(a);const c=await registerClaim(input(a),s,provider,clock);
    const b=source('gtaweather1',80,'1000000000000000081'); b.source.text=a.source.text;s.ingest(b);
    await assert.rejects(registerClaim(input(b),s,provider,clock),/copied/);
    const before=JSON.stringify(s.comparison(c.id)!.claims); const revised=structuredClone(a); revised.candidate.summary='Edited after registration';s.ingest(revised);
    assert.equal(JSON.stringify(s.comparison(c.id)!.claims),before);
  }finally{s.close();}
});
test('provider failure, missing metric and slow response crossing period start create no comparison', async () => {
  for(const fetcher of [async()=>new Response('',{status:503}),async()=>{const d=testWeather(now); d.hourly.precipitation_probability=d.hourly.precipitation_probability.map(()=>null);return new Response(JSON.stringify(d));}] as (typeof fetch)[]){
    const s=new Store(':memory:');const e=source();s.ingest(e);await assert.rejects(registerClaim(input(e),s,fetcher,clock),/baseline/);assert.equal(s.comparisons().length,0);s.close();
  }
  const s=new Store(':memory:'); const e=source();s.ingest(e);let calls=0;
  await assert.rejects(registerClaim(input(e),s,provider,()=>calls++===0?now:new Date('2026-09-12T14:01:00Z')),/entire/);
  assert.equal(s.comparisons().length,0);s.close();
});
test('outcomes enforce completed matching coverage, metric, location and immutable results', async () => {
  const s=new Store(':memory:'); try {
    const e=source();s.ingest(e);const c=await registerClaim(input(e),s,provider,clock);const after=new Date('2026-09-12T16:00:00Z');
    assert.throws(()=>registerOutcome(c.id,outcome,s,now),/ends/);
    for(const patch of [{validFrom:'2026-09-12T13:00:00Z'},{metric:'temperature_c'},{latitude:44.8},{coverageComplete:false},{value:-1},{sourceUrl:'javascript:alert(1)'}]) assert.throws(()=>registerOutcome(c.id,{...outcome,...patch},s,after));
    const done=registerOutcome(c.id,outcome,s,after); assert.ok(Math.abs(done.summary.consensusScore!-.04)<1e-9);assert.equal(done.summary.baselineScore,.36);
    assert.throws(()=>registerOutcome(c.id,outcome,s,after),/immutable/);
    await assert.rejects(registerClaim(input(e),s,provider,()=>after));
  }finally{s.close();}
});
test('Brier scores use strict >0.1mm outcome and absolute error uses the correct metric', () => {
  const c=demoComparisons()[0]; assert.equal(c.summary.mean,70);assert.ok(Math.abs(c.summary.consensusScore!-.09)<1e-9);assert.ok(Math.abs(c.summary.improvement!-.27)<1e-9);
  const dry=evaluateCase({...c,outcome:{...c.outcome!,value:.1}});assert.ok(Math.abs(dry.summary.consensusScore!-.49)<1e-9);
  const temp=evaluateCase({...c,metric:'temperature_c',unit:'°C',claims:[{...c.claims[0],value:20}],baseline:{...c.baseline,value:24},outcome:{...c.outcome!,metric:'temperature_c',value:21}});assert.equal(temp.summary.consensusScore,1);assert.equal(temp.summary.baselineScore,3);
  assert.equal(demoComparisons()[1].summary.consensusScore,null); assert.ok(c.claims.every(p=>p.account.startsWith('Demo analyst')));
});
test('radar only verifies quantitative precipitation; topic groups retain unscheduled claims as unscored', async () => {
  const s=new Store(':memory:');try{
    const e=source();e.source.text='Monkton 20 °C at 15:00 UTC on September 12, 2026.';s.ingest(e);
    const c=await registerClaim({evidenceId:e.id,metric:'temperature_c',value:20,validAt:'2026-09-12T15:00:00Z',quote:e.source.text,interpretationNote:'Test exact scalar temperature at the town reference point.',reviewed:true},s,provider,clock);
    assert.throws(()=>registerOutcome(c.id,{...outcome,metric:'temperature_c',validFrom:c.validFrom,validTo:c.validTo,sourceType:'radar_estimate'},s,new Date('2026-09-12T16:00:00Z')),/radar/);
    const unknown={...e,source:{...e.source,publishedAt:null}};const groups=aggregateInsights([unknown,unknown]);assert.equal(groups.length,1);assert.equal(groups[0].reports.length,1);assert.match(groups[0].reports[0].scoreability,/unresolved/);
  }finally{s.close();}
});
