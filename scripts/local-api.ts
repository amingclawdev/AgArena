export const apiBase = process.env.AGARENA_API_URL ?? 'http://127.0.0.1:8787';
const url = new URL(apiBase);
if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('AGARENA_API_URL must be a local HTTP origin');
export async function requestJson<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${url.origin}${path}`, { ...init, redirect: 'error', signal: AbortSignal.timeout(10000), headers: { 'Content-Type': 'application/json', ...init?.headers } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? `API HTTP ${response.status}`);
  return result as T;
}
