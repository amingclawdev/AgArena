import { readFile, stat } from 'node:fs/promises';
import { admitCapture } from '../server/evidence.ts';
import type { Job } from '../src/contracts.ts';
import { apiBase, requestJson } from './local-api.ts';

const args = process.argv.slice(2);
const file = args[0];
const jobFlag = args.indexOf('--job');
const jobId = jobFlag >= 0 ? args[jobFlag + 1] : undefined;
if (jobFlag >= 0 && !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(jobId ?? '')) throw new Error('Invalid job ID');
if (args.length !== (jobFlag >= 0 ? 3 : 1) || (jobFlag >= 0 && jobFlag !== 1)) throw new Error('Usage: agent:import -- <file> [--job <id>]');
if (!file || (await stat(file)).size > 256000) throw new Error('Provide a capture JSON file smaller than 256 KB');
const raw = JSON.parse(await readFile(file, 'utf8'));
// Validate every packet before the first HTTP mutation, including temporal admission checks.
const packets = (Array.isArray(raw) ? raw : [raw]).map(p => admitCapture(p));
if (!packets.length || packets.length > 3) throw new Error('Import between 1 and 3 captures');
if (packets.some(p => p.source.kind !== 'x')) throw new Error('Only inspected live captures can be imported');
if (jobId) {
  const job = await requestJson<Job>(`/api/jobs/${jobId}`);
  if (job.status !== 'collecting') throw new Error('Claim the job as collecting after beginning browser inspection, before importing');
  if (packets.some(p => p.source.account.toLowerCase() !== job.account.toLowerCase() || Date.parse(p.source.capturedAt) < Date.parse(job.createdAt))) throw new Error('Capture does not belong to this job account or collection time');
}
const ids: string[] = [];
for (const { id: _id, revision: _revision, receivedAt: _receivedAt, digest: _digest, location: _location, locationReason: _reason, temporalStatus: _status, independentEvidence: _independent, ...packet } of packets) {
  const result = await requestJson<{ evidence: { id: string; candidate: { title: string } }; duplicate: boolean }>(`/api/captures${jobId ? `?job=${jobId}` : ''}`, { method: 'POST', body: JSON.stringify(packet) });
  ids.push(result.evidence.id);
  console.log(`${result.duplicate ? 'Already captured' : 'Imported'}: ${result.evidence.candidate.title}`);
}
if (jobId) {
  await requestJson(`/api/jobs/${jobId}`, { method: 'PATCH', body: JSON.stringify({ status: 'completed', evidenceIds: [...new Set(ids)] }) });
  console.log('Collection job completed.');
} else console.log(`Imported without a collection job at ${apiBase}.`);
