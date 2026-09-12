import express from 'express';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { z } from 'zod';
import { Store } from './store.ts';
import { admitCapture, temporalStatus } from './evidence.ts';
import { places } from './places.ts';
import { demoEvidence } from './fixtures.ts';
import { demoForecast, getForecast, makeAlerts } from './weather.ts';
import { agentPrompt } from './agent.ts';
import type { Job } from '../src/contracts.ts';

export function createApp(store: Store, fetcher: typeof fetch = fetch) {
  const app = express(); app.disable('x-powered-by');
  app.use((req, res, next) => {
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(req.hostname)) return void res.status(403).json({ error: 'Local demo only' });
    const origin = req.headers.origin;
    if (origin && !['http://127.0.0.1:5173', 'http://localhost:5173', 'http://127.0.0.1:8787', 'http://localhost:8787'].includes(origin)) return void res.status(403).json({ error: 'Origin not allowed' });
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin'); next();
  });
  app.use(express.json({ limit: '256kb' }));
  app.get('/api/health', (_req, res) => res.json({ ok: true, collector: 'host-assisted', version: '0.1.0' }));
  app.get('/api/dashboard', (req, res) => {
    const mode = req.query.mode === 'demo' ? 'demo' : 'live';
    const evidence = mode === 'demo' ? demoEvidence() : store.evidence().filter(e => e.source.kind === 'x').map(e => ({ ...e, temporalStatus: temporalStatus(e) }));
    res.json({ evidence, places, jobs: store.jobs(), serverTime: new Date().toISOString(), mode, collector: { mode: 'host-assisted', account: 'WxOntario1' }, counts: { total: evidence.length, mapped: evidence.filter(e => e.location).length, images: evidence.reduce((n, e) => n + e.source.media.filter(m => m.inspected).length, 0) } });
  });
  app.post('/api/captures', (req, res) => {
    const evidence = admitCapture(req.body);
    if (evidence.source.kind !== 'x') return void res.status(400).json({ error: 'Use the separate demo scenario for synthetic data' });
    const jobId = req.query.job === undefined ? undefined : z.string().uuid().parse(req.query.job);
    const job = jobId ? store.jobs().find(j => j.id === jobId) : undefined;
    if (jobId && (!job || job.status !== 'collecting')) return void res.status(409).json({ error: 'Claim an active collection job before importing' });
    if (job && (evidence.source.account.toLowerCase() !== job.account.toLowerCase() || Date.parse(evidence.source.capturedAt) < Date.parse(job.createdAt))) return void res.status(400).json({ error: 'Capture must come from this job account and browser session after job creation' });
    if (job && store.jobEvidence(job.id).length >= job.limit && !store.jobEvidence(job.id).includes(evidence.id)) return void res.status(409).json({ error: 'Collection job capture limit reached' });
    const result = store.ingest(evidence, jobId);
    if (job) store.saveJob({ ...job, capturedCount: store.jobEvidence(job.id).length, updatedAt: new Date().toISOString() });
    res.status(result.duplicate ? 200 : 201).json(result);
  });
  app.get('/api/forecast/:placeId', async (req, res) => {
    const place = places.find(p => p.id === req.params.placeId);
    if (!place) return void res.status(404).json({ error: 'Unsupported place' });
    const threshold = z.coerce.number().int().min(10).max(100).parse(req.query.threshold ?? 60);
    const forecast = req.query.mode === 'demo' ? demoForecast(place) : await getForecast(place, store, fetcher);
    const alerts = makeAlerts(forecast, threshold).map(a => ({ ...a, acknowledged: store.acknowledged(a.id) }));
    res.json({ forecast, alerts });
  });
  app.post('/api/alerts/:id/acknowledge', (req, res) => { const id = z.string().max(200).parse(req.params.id); store.acknowledge(id); res.json({ ok: true }); });
  app.post('/api/jobs', (_req, res) => {
    const active = store.jobs().find(j => ['waiting_for_agent', 'collecting'].includes(j.status));
    if (active) return void res.status(200).json(active);
    const now = new Date().toISOString();
    const job: Job = { id: randomUUID(), account: 'WxOntario1', limit: 3, status: 'waiting_for_agent', createdAt: now, updatedAt: now, capturedCount: 0, message: 'Waiting for your local Computer Use agent. Open the agent handoff to begin.' };
    res.status(201).json(store.saveJob(job));
  });
  app.get('/api/jobs/:id/prompt', (req, res) => {
    const j = store.jobs().find(j => j.id === req.params.id); if (!j) return void res.status(404).json({ error: 'Job not found' });
    res.type('text/plain').send(agentPrompt(j));
  });
  app.get('/api/jobs/:id', (req, res) => {
    const job = store.jobs().find(j => j.id === req.params.id);
    if (!job) return void res.status(404).json({ error: 'Job not found' });
    res.json(job);
  });
  app.patch('/api/jobs/:id', (req, res) => {
    const job = store.jobs().find(j => j.id === req.params.id); if (!job) return void res.status(404).json({ error: 'Job not found' });
    const patch = z.object({ status: z.enum(['collecting', 'completed', 'failed', 'cancelled']), message: z.string().max(1000).optional(), evidenceIds: z.array(z.string()).max(3).optional() }).parse(req.body);
    if (!['waiting_for_agent', 'collecting'].includes(job.status)) return void res.status(409).json({ error: 'Job is already closed' });
    if (patch.status === 'completed') {
      if (job.status !== 'collecting') return void res.status(409).json({ error: 'Job must be collecting before completion' });
      const ids = [...new Set(patch.evidenceIds ?? [])];
      const linked = store.jobEvidence(job.id);
      if (!ids.length || ids.length !== linked.length || !ids.every(id => linked.includes(id))) return void res.status(400).json({ error: 'Completion requires all evidence IDs imported with this job' });
      job.capturedCount = ids.length;
    }
    res.json(store.saveJob({ ...job, status: patch.status, updatedAt: new Date().toISOString(), message: patch.message ?? (patch.status === 'completed' ? 'Browser evidence imported and validated.' : patch.status === 'collecting' ? 'Agent is reading the authenticated browser.' : `Collection ${patch.status}.`) }));
  });
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Route not found' }));
  app.use(express.static(resolve('dist')));
  app.get('/', (_req, res) => res.sendFile(resolve('dist/index.html')));
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = error instanceof z.ZodError ? error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') : error instanceof Error ? error.message : 'Invalid request';
    const status = error && typeof error === 'object' && 'status' in error && error.status === 413 ? 413 : 400;
    res.status(status).json({ error: message.slice(0, 1500) });
  });
  return app;
}
