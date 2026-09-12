import type { Capture } from '../src/contracts.ts';
import { admitCapture } from './evidence.ts';

const base: Capture = {
  schemaVersion: 1,
  source: { kind: 'demo', url: 'https://example.test/demo/rain', account: 'Demo scenario', publishedAt: '2026-09-12T16:00:00Z', capturedAt: '2026-09-12T17:00:00Z', text: 'Illustrative report: rain beginning near Monkton, Ontario. This is synthetic content for the hackathon demonstration.', media: [] },
  candidate: { title: 'Rain reported near Monkton', summary: 'An illustrative local report places rainfall near Monkton. Check regional weather guidance before planning a field visit.', hazard: 'rain', severity: 'monitor', evidenceClass: 'report', placeQuery: 'Monkton', locationQuote: 'Monkton', observedAt: '2026-09-12T16:00:00Z', timeNote: 'Synthetic event time.', imageFindings: [], limitations: ['Synthetic example; not a real weather event.', 'A town reference does not identify affected farms.'] },
  analysis: { method: 'demo-fixture', version: 'demo-v1' },
};
export const fixtures: Capture[] = [base,
  { ...base, source: { ...base.source, url: 'https://example.test/demo/harvest', text: 'Illustrative report: bean harvest is progressing in Huron/Perth. Synthetic demonstration only.' }, candidate: { ...base.candidate, title: 'Harvest activity in Huron–Perth', summary: 'A regional field activity report adds context for farmers watching the weather.', hazard: 'field', severity: 'informational', placeQuery: 'Huron/Perth', locationQuote: 'Huron/Perth', evidenceClass: 'context' } },
  { ...base, source: { ...base.source, url: 'https://example.test/demo/history', text: 'Illustrative archive: storm damage near Monkton on September 2. This is synthetic content.' }, candidate: { ...base.candidate, title: 'A past storm, shared again', summary: 'The event happened ten days before the post. It remains historical and cannot trigger a current storm alert.', hazard: 'tornado', severity: 'attention', observedAt: '2026-09-02T18:00:00Z', timeNote: 'Event date is September 2; publication date is September 12.' } },
  { ...base, source: { ...base.source, url: 'https://example.test/demo/unknown', text: 'Illustrative report: strong gusts here this afternoon. No location was provided.' }, candidate: { ...base.candidate, title: 'Wind report needs a location', summary: 'The report mentions gusts but gives no place. It stays in the evidence list and off the map.', hazard: 'wind', placeQuery: null, locationQuote: null, observedAt: null, timeNote: 'Both location and exact event time are unresolved.' } },
];
export function demoEvidence() { return fixtures.map(p => admitCapture(p, new Date('2026-09-12T18:00:00Z'))); }
