import { z } from 'zod';

const iso = z.string().datetime({ offset: true });
export const hazardSchema = z.enum(['rain', 'wind', 'tornado', 'heat', 'frost', 'field', 'birds', 'unknown']);
export const captureSchema = z.object({
  schemaVersion: z.literal(1),
  source: z.object({
    kind: z.enum(['x', 'demo']),
    url: z.string().url().max(500), account: z.string().min(1).max(100),
    publishedAt: iso.nullable(), capturedAt: iso, text: z.string().min(1).max(16000).refine(s => s.trim().length > 0, 'Captured text is required'),
    media: z.array(z.object({
      url: z.string().url().max(1000), kind: z.enum(['photo', 'radar', 'video']),
      inspected: z.boolean(), description: z.string().max(2000),
      observedText: z.string().max(2000).default(''),
    })).max(6),
  }),
  candidate: z.object({
    title: z.string().min(1).max(150), summary: z.string().min(1).max(2000),
    hazard: hazardSchema, severity: z.enum(['informational', 'monitor', 'attention']),
    evidenceClass: z.enum(['report', 'forecast', 'context']),
    placeQuery: z.string().max(150).nullable(), locationQuote: z.string().max(500).nullable(),
    observedAt: iso.nullable(), timeNote: z.string().max(1000),
    imageFindings: z.array(z.string().max(1000)).max(10),
    limitations: z.array(z.string().max(1000)).max(10),
  }),
  analysis: z.object({ method: z.enum(['computer-use-agent', 'demo-fixture']), version: z.string().min(1).max(100) }),
}).superRefine((p, ctx) => {
  if (p.source.kind === 'x' && !/^https:\/\/(?:x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/\d+\/?$/.test(p.source.url))
    ctx.addIssue({ code: 'custom', message: 'X source must be a public post permalink', path: ['source', 'url'] });
  if (p.source.kind === 'x' && p.analysis.method !== 'computer-use-agent')
    ctx.addIssue({ code: 'custom', message: 'Live source requires an agent analysis record' });
  if (p.source.kind === 'x') {
    const account = p.source.account.replace(/^@/, '');
    const urlAccount = new URL(p.source.url).pathname.split('/')[1];
    if (!/^[A-Za-z0-9_]{1,15}$/.test(account) || account.toLowerCase() !== urlAccount?.toLowerCase())
      ctx.addIssue({ code: 'custom', message: 'Account must match the source permalink', path: ['source', 'account'] });
  }
  for (const m of p.source.media) {
    const u = new URL(m.url);
    if (u.protocol !== 'https:' || !['x.com', 'twitter.com', 'pbs.twimg.com'].includes(u.hostname))
      ctx.addIssue({ code: 'custom', message: 'Media must link to X or its image host' });
    if (m.inspected && !m.description.trim() && !m.observedText.trim())
      ctx.addIssue({ code: 'custom', message: 'An inspected image requires a description or visible text' });
    if (!m.inspected && m.observedText.trim())
      ctx.addIssue({ code: 'custom', message: 'Visible image text requires inspection' });
  }
  if (p.candidate.imageFindings.length && !p.source.media.some(m => m.inspected))
    ctx.addIssue({ code: 'custom', message: 'Image findings require an inspected image' });
});
export type Capture = z.infer<typeof captureSchema>;
export type Hazard = z.infer<typeof hazardSchema>;
export type Place = { id: string; name: string; lat: number; lon: number; bounds: [number, number, number, number]; precision: 'town' | 'region'; aliases: string[] };
export type Evidence = Capture & { id: string; revision: number; receivedAt: string; digest: string; location: Place | null; locationReason: string; temporalStatus: 'recent' | 'historical' | 'unknown' | 'outlook'; independentEvidence: number };
export type ForecastHour = { time: string; temperature: number | null; precipitation: number | null; rainProbability: number | null; wind: number | null; code: number | null };
export type Forecast = { status: 'live' | 'cached' | 'unavailable' | 'demo'; provider: string; sourceUrl: string; fetchedAt: string | null; issuedAt: null; locationId: string; latitude: number; longitude: number; hours: ForecastHour[]; error?: string; note: string };
export type Alert = { id: string; title: string; detail: string; kind: 'rain' | 'wind' | 'unknown' | 'info'; source: string; validAt: string | null; acknowledged: boolean };
export type Job = { id: string; account: string; limit: number; status: 'waiting_for_agent' | 'collecting' | 'completed' | 'failed' | 'cancelled'; createdAt: string; updatedAt: string; capturedCount: number; message: string };
export type Dashboard = { evidence: Evidence[]; places: Place[]; jobs: Job[]; serverTime: string; mode: 'live' | 'demo'; collector: { mode: 'host-assisted'; account: string }; counts: { total: number; mapped: number; images: number } };
