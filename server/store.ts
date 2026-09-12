import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Evidence, Job, Forecast } from '../src/contracts.ts';
import { canonicalJson } from './evidence.ts';

export class Store {
  db: DatabaseSync;
  constructor(path = 'data/agarena.sqlite') {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS evidence(id TEXT PRIMARY KEY, data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS revisions(id TEXT, revision INTEGER, data TEXT NOT NULL, PRIMARY KEY(id, revision)); CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY, data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS cache(id TEXT PRIMARY KEY, data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS acknowledgements(id TEXT PRIMARY KEY);`);
    this.db.exec('CREATE TABLE IF NOT EXISTS job_captures(job_id TEXT, evidence_id TEXT, PRIMARY KEY(job_id, evidence_id));');
  }
  evidence(): Evidence[] { return this.db.prepare('SELECT data FROM evidence ORDER BY rowid DESC').all().map(r => JSON.parse(r.data as string)); }
  ingest(e: Evidence, jobId?: string) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const row = this.db.prepare('SELECT data FROM evidence WHERE id=?').get(e.id);
      if (row) {
        const prev = JSON.parse(row.data as string) as Evidence;
        // A repeated browser read is not an independent observation. Changes append a revision.
        const { capturedAt: _a, ...oldSource } = prev.source;
        const { capturedAt: _b, ...newSource } = e.source;
        if (canonicalJson({ source: oldSource, candidate: prev.candidate, analysis: prev.analysis }) === canonicalJson({ source: newSource, candidate: e.candidate, analysis: e.analysis })) {
          if (jobId) this.linkCapture(jobId, e.id);
          this.db.exec('COMMIT'); return { evidence: prev, duplicate: true };
        }
        e.revision = prev.revision + 1;
      }
      const data = JSON.stringify(e);
      this.db.prepare('INSERT OR REPLACE INTO evidence VALUES(?,?)').run(e.id, data);
      this.db.prepare('INSERT INTO revisions VALUES(?,?,?)').run(e.id, e.revision, data);
      if (jobId) this.linkCapture(jobId, e.id);
      this.db.exec('COMMIT'); return { evidence: e, duplicate: false };
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  private linkCapture(jobId: string, evidenceId: string) { this.db.prepare('INSERT OR IGNORE INTO job_captures VALUES(?,?)').run(jobId, evidenceId); }
  jobEvidence(jobId: string): string[] { return this.db.prepare('SELECT evidence_id FROM job_captures WHERE job_id=?').all(jobId).map(r => r.evidence_id as string); }
  revisions(id: string): Evidence[] { return this.db.prepare('SELECT data FROM revisions WHERE id=? ORDER BY revision').all(id).map(r => JSON.parse(r.data as string)); }
  jobs(): Job[] { return this.db.prepare('SELECT data FROM jobs ORDER BY rowid DESC LIMIT 30').all().map(r => JSON.parse(r.data as string)); }
  saveJob(j: Job) { this.db.prepare('INSERT OR REPLACE INTO jobs VALUES(?,?)').run(j.id, JSON.stringify(j)); return j; }
  forecast(id: string): Forecast | null { const r = this.db.prepare('SELECT data FROM cache WHERE id=?').get(id); return r ? JSON.parse(r.data as string) : null; }
  saveForecast(f: Forecast) { this.db.prepare('INSERT OR REPLACE INTO cache VALUES(?,?)').run(f.locationId, JSON.stringify(f)); }
  acknowledge(id: string) { this.db.prepare('INSERT OR IGNORE INTO acknowledgements VALUES(?)').run(id); }
  acknowledged(id: string) { return Boolean(this.db.prepare('SELECT id FROM acknowledgements WHERE id=?').get(id)); }
  close() { this.db.close(); }
}
