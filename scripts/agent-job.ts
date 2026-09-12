import { apiBase, requestJson } from './local-api.ts';
import type { Job } from '../src/contracts.ts';
const job = await requestJson<Job>('/api/jobs', { method: 'POST', body: '{}' });
const response = await fetch(`${apiBase}/api/jobs/${job.id}/prompt`, { signal: AbortSignal.timeout(10000), redirect: 'error' });
if (!response.ok) throw new Error(await response.text());
console.log(await response.text());
