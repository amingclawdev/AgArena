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

export type Analyst = { account: string; name: string; organization: string; focus: string; profileUrl: string; verificationUrl: string; existing?: boolean };
export const comparisonMetricSchema = z.enum(['temperature_c', 'precipitation_mm', 'precipitation_probability']);
export type ComparisonMetric = z.infer<typeof comparisonMetricSchema>;
export const comparisonClaimSchema = z.object({
  evidenceId: z.string().min(1).max(100), metric: comparisonMetricSchema,
  validAt: iso, value: z.number().finite(), quote: z.string().trim().min(3).max(1000),
  interpretationNote: z.string().trim().min(10).max(1000), reviewed: z.literal(true),
}).strict();
export type ComparisonClaimInput = z.infer<typeof comparisonClaimSchema>;
export const outcomeSchema = z.object({
  metric: z.enum(['temperature_c', 'precipitation_mm']), value: z.number().finite(),
  validFrom: iso, validTo: iso, sourceType: z.enum(['station', 'radar_estimate']),
  sourceUrl: z.string().url().max(1000).refine(s => new URL(s).protocol === 'https:', 'Use an HTTPS observation source'),
  sourceName: z.string().trim().min(2).max(150), latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180),
  coverageComplete: z.literal(true), reviewed: z.literal(true), note: z.string().trim().min(10).max(1000),
}).strict();
export type ComparisonOutcome = z.infer<typeof outcomeSchema> & { recordedAt: string };
export type AnalystClaim = { evidenceId: string; evidenceRevision: number; evidenceDigest: string; account: string; sourceUrl: string; quote: string; value: number; issuedAt: string; capturedAt: string; registeredAt: string; interpretationNote: string };
export type ComparisonCase = {
  id: string; mode: 'live' | 'demo'; locationId: string; placeName: string; latitude: number; longitude: number;
  metric: ComparisonMetric; unit: string; eventDefinition: string; validFrom: string; validTo: string; createdAt: string;
  baseline: { value: number; fetchedAt: string; issuedAt: null; sourceUrl: string; provider: string; latitude: number; longitude: number };
  claims: AnalystClaim[]; outcome: ComparisonOutcome | null;
};
export type ComparisonResult = ComparisonCase & { summary: { count: number; mean: number | null; min: number | null; max: number | null; organizations: string[]; status: 'awaiting_observation' | 'evaluated'; scoreName: string; analystScores: { account: string; score: number }[]; consensusScore: number | null; baselineScore: number | null; improvement: number | null } };
export type InsightGroup = { key: string; location: string; hazard: string; date: string; accounts: string[]; reports: { id: string; account: string; sourceUrl: string; summary: string; publishedAt: string | null; scoreability: string }[] };
export type ResearchExample = { account: string; publishedDate: string; sourceUrl: string; sourceType: string; summary: string; treatment: string };
export type AnalystDashboard = { mode: 'live' | 'demo'; analysts: Analyst[]; researchExamples: ResearchExample[]; groups: InsightGroup[]; comparisons: ComparisonResult[]; evidence: Evidence[]; note: string };
