import { createHash } from 'node:crypto';
import { captureSchema, type Capture, type Evidence } from '../src/contracts.ts';
import { resolvePlace } from './places.ts';

export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value !== null && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`;
  return JSON.stringify(value);
}
export function digest(value: unknown) { return createHash('sha256').update(canonicalJson(value)).digest('hex'); }
export function temporalStatus(p: Capture, now = new Date()): Evidence['temporalStatus'] {
  if (p.candidate.evidenceClass === 'forecast') return 'outlook';
  if (!p.candidate.observedAt) return 'unknown';
  const age = now.getTime() - Date.parse(p.candidate.observedAt);
  if (age < -3600000) return 'unknown';
  return age > 48 * 3600000 ? 'historical' : 'recent';
}
export function admitCapture(input: unknown, now = new Date()): Evidence {
  const p = captureSchema.parse(input);
  if (Date.parse(p.source.capturedAt) > now.getTime() + 5 * 60000) throw new Error('Capture time is in the future');
  if (p.source.publishedAt && Date.parse(p.source.publishedAt) > Date.parse(p.source.capturedAt) + 5 * 60000) throw new Error('Publication cannot follow capture');
  if (p.source.kind === 'x') {
    // X and twitter.com permalinks refer to the same post. Account spelling and trailing slashes are not new evidence.
    const u = new URL(p.source.url);
    p.source.url = `https://x.com/${u.pathname.split('/')[1].toLowerCase()}/status/${u.pathname.split('/')[3]}`;
    p.source.account = p.source.account.replace(/^@/, '').toLowerCase();
  }
  const spatialText = [p.source.text, ...p.source.media.filter(m => m.inspected).map(m => m.observedText)].join('\n');
  const identity = p.source.kind === 'x' ? `x:${new URL(p.source.url).pathname.split('/')[3]}` : p.source.url;
  return { ...p, id: digest(identity).slice(0, 20), revision: 1, receivedAt: now.toISOString(), digest: digest(p), ...resolvePlace(p.candidate.placeQuery, p.candidate.locationQuote, spatialText), temporalStatus: temporalStatus(p, now), independentEvidence: 1 };
}
