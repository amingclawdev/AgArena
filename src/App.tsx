import { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, ArrowDownToLine, ArrowRight, Bell, Check, ChevronDown, Clock3, CloudRain, Copy, ExternalLink, Eye, FileImage, Info, Layers3, Leaf, LoaderCircle, MapPin, PanelTop, Radio, RefreshCw, Search, ShieldCheck, Sprout, Wind, X } from 'lucide-react';
import type { Alert, Dashboard, Evidence, Forecast, Job } from './contracts';
import EvidenceMap from './components/EvidenceMap';

type Mode = 'live' | 'demo';
type Filter = 'all' | 'recent' | 'historical' | 'unmapped';
type ForecastResponse = { forecast: Forecast; alerts: Alert[] };
const time = (value: string | null) => value ? new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }) : 'Not established';
const shortTime = (value: string) => new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const regionName = (name: string) => name.replace(', Ontario', '');
const externalUrl = (url: string) => { try { const parsed = new URL(url); return parsed.protocol === 'https:' ? parsed.href : undefined; } catch { return undefined; } };
const label = (value: string) => value.replaceAll('_', ' ');
const metric = (n: number | null | undefined, unit: string) => n == null ? '—' : Math.round(n) + unit;
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) { const payload = await response.json().catch(() => null); throw new Error(payload?.error || 'Request failed (' + response.status + ').'); }
  return response.json() as Promise<T>;
}
function HazardIcon({ hazard, size = 18 }: { hazard: string; size?: number }) {
  if (hazard === 'rain') return <CloudRain size={size} />;
  if (hazard === 'wind' || hazard === 'tornado') return <Wind size={size} />;
  if (hazard === 'field' || hazard === 'birds') return <Sprout size={size} />;
  return <Activity size={size} />;
}
function EvidenceInspector({ item }: { item: Evidence | undefined }) {
  if (!item) return <section className="inspector empty-inspector"><Eye size={27} /><h3>Every report has a story.</h3><p>Select a source report to inspect its location, timing, and evidence.</p></section>;
  const isDemo = item.source.kind === 'demo';
  return <section className="inspector" aria-label="Evidence inspector">
    <div className="section-heading"><span className="eyebrow">EVIDENCE INSPECTOR</span><span className="subtle">Revision {item.revision}</span></div>
    <div className="inspector-title"><span className={'hazard-icon ' + item.candidate.hazard}><HazardIcon hazard={item.candidate.hazard} size={22} /></span><div><span className="source-label">{isDemo ? 'Synthetic scenario' : '@' + item.source.account}</span><h3>{item.candidate.title}</h3></div></div>
    <div className="tag-row"><span className={'tag ' + item.temporalStatus}>{label(item.temporalStatus)}</span><span className="tag neutral">{item.candidate.evidenceClass === 'forecast' ? 'Social outlook' : item.candidate.evidenceClass === 'context' ? 'Field context' : 'Source report'}</span><span className="tag neutral">{item.candidate.severity}</span></div>
    <p className="inspector-summary">{item.candidate.summary}</p>
    <div className="inspector-section"><h4><MapPin size={15} /> Location evidence</h4><strong>{item.location ? item.location.name : 'Unresolved · not mapped'}</strong>{item.candidate.locationQuote && <blockquote>“{item.candidate.locationQuote}”</blockquote>}<p>{item.locationReason}</p></div>
    <div className="inspector-section"><h4><Clock3 size={15} /> Three separate times</h4><dl className="time-list"><div><dt>Published</dt><dd>{time(item.source.publishedAt)}</dd></div><div><dt>Event / observed</dt><dd>{time(item.candidate.observedAt)}</dd></div><div><dt>Captured</dt><dd>{time(item.source.capturedAt)}</dd></div></dl><p>{item.candidate.timeNote}</p></div>
    <div className="inspector-section"><h4><FileImage size={15} /> Image inspection</h4>
      {!item.source.media.length ? <div className="empty-media"><FileImage size={22} /><span>No media in this capture.<small>No visual findings are claimed.</small></span></div> : <div className="media-list">{item.source.media.map((media, index) => <div className="media-item" key={media.url + index}><div><span className="tag neutral">{media.kind}</span><strong>{media.inspected ? 'Inspected by capture agent' : 'Not inspected'}</strong></div>{media.description && <p>{media.description}</p>}{media.inspected && media.observedText && <p className="observed-text">Visible text: {media.observedText}</p>}<a href={externalUrl(media.url)} target="_blank" rel="noopener noreferrer">Open original media <ExternalLink size={12} /></a></div>)}</div>}
      {item.candidate.imageFindings.length > 0 && <ul className="findings">{item.candidate.imageFindings.map((finding, i) => <li key={i}>{finding}</li>)}</ul>}
    </div>
    <details className="source-details"><summary>Read captured source text <ChevronDown size={14} /></summary><p>{item.source.text}</p></details>
    <div className="limitations"><ShieldCheck size={17} /><div><strong>Interpretation, with limits</strong><p>Extracted from a source by {isDemo ? 'a demo fixture' : 'a capture agent'}. This is not independent confirmation or an official warning.</p>{item.candidate.limitations.length > 0 && <ul>{item.candidate.limitations.map((limitation, i) => <li key={i}>{limitation}</li>)}</ul>}</div></div>
    {isDemo ? <div className="synthetic-source"><Info size={14} /> Synthetic evidence · no real source post</div> : <a className="source-link" href={externalUrl(item.source.url)} target="_blank" rel="noopener noreferrer">View original post on X <ExternalLink size={15} /></a>}
  </section>;
}
function Outlook({ result, pending, error, place, threshold, onThreshold, onRetry, onAcknowledge, acknowledgeError }: { result: ForecastResponse | null; pending: boolean; error: string; place: string; threshold: number; onThreshold: (n: number) => void; onRetry: () => void; onAcknowledge: (alert: Alert) => void; acknowledgeError: string }) {
  const f = result?.forecast;
  const values = <T,>(items: T[], get: (item: T) => number | null) => items.map(get).filter((n): n is number => n !== null);
  const hours = f?.hours.slice(0, 24) ?? [];
  const rain = values(hours, h => h.rainProbability); const wind = values(hours, h => h.wind);
  return <section className="outlook" aria-label="Regional outlook">
    <div className="outlook-head"><div><span className="eyebrow">PROVIDER FORECAST</span><h3>Plan the next field day.</h3><p><MapPin size={13} /> {place}</p></div><CloudRain size={36} strokeWidth={1.2} /></div>
    {pending ? <div className="forecast-empty" role="status"><LoaderCircle className="spin" size={21} /><p>Loading regional outlook…</p></div> : error || f?.status === 'unavailable' ? <div className="forecast-empty" role="status"><CloudRain size={27} /><h4>Forecast unavailable</h4><p>{error || f?.error || 'The weather provider could not be reached.'}</p><p>Missing data does not mean conditions are safe.</p><button className="text-button" onClick={onRetry}><RefreshCw size={14} /> Try again</button></div> : f ? <>
      <div className="forecast-meta"><span className={'status-dot ' + (f.status === 'demo' ? 'amber' : '')} />{f.status === 'demo' ? 'Synthetic forecast' : f.status === 'cached' ? 'Cached · may be stale' : 'Live provider data'}<span className="forecast-provider">{f.provider}</span></div>
      <div className="weather-metrics"><div><span>Peak rain chance</span><strong>{metric(rain.length ? Math.max(...rain) : null, '%')}</strong><small>Next {hours.length} available hours</small></div><div><span>Peak wind</span><strong>{metric(wind.length ? Math.max(...wind) : null, '')}<em> km/h</em></strong><small>Provider forecast</small></div></div>
      <div className="hourly" aria-label="Hourly rain probability">{hours.filter((_, i) => i % Math.max(1, Math.ceil(hours.length / 6)) === 0).map(hour => <div key={hour.time}><span>{shortTime(hour.time)}</span><div className="rain-bar-track"><div className="rain-bar" style={{ height: (hour.rainProbability ?? 0) + '%' }} /></div><strong>{metric(hour.rainProbability, '%')}</strong><small>{metric(hour.temperature, '°')}</small></div>)}</div>
      {!hours.length && <p className="forecast-empty">No hourly forecast is available.</p>}
      <p className="forecast-note">{f.note}</p><p className="fetched-time">Fetched {time(f.fetchedAt)} · provider issue time unavailable</p>
      {f.status !== 'demo' && <a className="provider-link" href={externalUrl(f.sourceUrl)} target="_blank" rel="noopener noreferrer">Provider source <ExternalLink size={12} /></a>}
    </> : <p className="forecast-empty">Choose a region to see its outlook.</p>}
    <div className="alerts-section"><div className="section-heading"><h4><Bell size={16} /> Field alerts</h4><span className="subtle">In-app only</span></div><label className="threshold-label" htmlFor="rain-threshold">Rain chance threshold <strong>{threshold}%</strong></label><input id="rain-threshold" type="range" min="10" max="100" step="10" value={threshold} onChange={e => onThreshold(Number(e.target.value))} /><p className="threshold-note">Rules use provider forecasts. Source posts do not trigger storm warnings.</p>
      {acknowledgeError && <p className="inline-error" role="alert">{acknowledgeError}</p>}
      {!pending && result?.alerts.map(alert => <article className={'alert-card ' + (alert.acknowledged ? 'acknowledged' : '')} key={alert.id}><div><HazardIcon hazard={alert.kind} size={16} /><strong>{alert.title}</strong></div><p>{alert.detail}</p><small>{alert.source}{alert.validAt ? ' · ' + time(alert.validAt) : ''}</small><button onClick={() => onAcknowledge(alert)} disabled={alert.acknowledged}>{alert.acknowledged ? <><Check size={13} /> Acknowledged</> : 'Acknowledge'}</button></article>)}
      {!pending && result && !result.alerts.length && <p className="no-alerts">No threshold alerts returned. Keep checking the forecast.</p>}
    </div>
  </section>;
}
export default function App() {
  const [mode, setMode] = useState<Mode>('live');
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true); const [dataError, setDataError] = useState('');
  const [region, setRegion] = useState('huron-perth');
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState<Filter>('all');
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false); const [forecastError, setForecastError] = useState('');
  const [threshold, setThreshold] = useState(60); const [refresh, setRefresh] = useState(0);
  const [activeView, setActiveView] = useState<'map' | 'collection'>('map');
  const [jobBusy, setJobBusy] = useState(false); const [jobError, setJobError] = useState('');
  const [handoffJob, setHandoffJob] = useState<Job | null>(null);
  const [prompt, setPrompt] = useState(''); const [promptError, setPromptError] = useState(''); const [copied, setCopied] = useState(false);
  const [acknowledgeError, setAcknowledgeError] = useState('');
  const modal = useRef<HTMLDialogElement>(null);
  const modeRef = useRef(mode); modeRef.current = mode;
  const selectedPlace = data?.places.find(p => p.id === region);
  const changeMode = (next: Mode) => { if (next === mode) return; setMode(next); setData(null); setForecast(null); setSelectedId(''); setDataError(''); setJobError(''); };
  useEffect(() => {
    const controller = new AbortController(); let first = true;
    const load = async () => {
      if (first) setLoading(true);
      try {
        const next = await request<Dashboard>('/api/dashboard?mode=' + mode, { signal: controller.signal });
        if (controller.signal.aborted) return;
        if (next.mode !== mode) throw new Error('The server returned a different data mode. Refresh to try again.');
        setData(next); setDataError('');
        setSelectedId(id => next.evidence.some(e => e.id === id) ? id : next.evidence[0]?.id ?? '');
      } catch (error) { if (!controller.signal.aborted) setDataError(error instanceof Error ? error.message : 'Evidence could not be loaded.'); }
      finally { if (!controller.signal.aborted) { setLoading(false); first = false; } }
    };
    void load(); const timer = window.setInterval(() => void load(), 15000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [mode, refresh]);
  useEffect(() => {
    const controller = new AbortController();
    if (!selectedPlace) { setForecast(null); setForecastLoading(false); return; }
    setForecastLoading(true); setForecast(null); setForecastError(''); setAcknowledgeError('');
    request<ForecastResponse>('/api/forecast/' + encodeURIComponent(region) + '?mode=' + mode + '&threshold=' + threshold, { signal: controller.signal })
      .then(next => { if ((mode === 'live' && next.forecast.status === 'demo') || (mode === 'demo' && ['live', 'cached'].includes(next.forecast.status))) throw new Error('The provider response does not match the selected data mode.'); if (!controller.signal.aborted) setForecast(next); })
      .catch(error => { if (!controller.signal.aborted) setForecastError(error instanceof Error ? error.message : 'Forecast could not be loaded.'); })
      .finally(() => { if (!controller.signal.aborted) setForecastLoading(false); });
    return () => controller.abort();
  }, [region, mode, threshold, refresh, selectedPlace?.id]);
  useEffect(() => {
    if (!handoffJob) return;
    modal.current?.showModal(); const controller = new AbortController(); setPrompt(''); setPromptError(''); setCopied(false);
    fetch('/api/jobs/' + encodeURIComponent(handoffJob.id) + '/prompt', { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('The handoff could not be loaded. Close this window and try again.');
      return response.text();
    }).then(text => { if (!controller.signal.aborted) setPrompt(text); }).catch(error => { if (!controller.signal.aborted) setPromptError(error.message); });
    return () => { controller.abort(); modal.current?.close(); };
  }, [handoffJob]);
  const selectPlace = useCallback((id: string) => { setRegion(id); setFilter('all'); }, []);
  const selected = data?.evidence.find(e => e.id === selectedId);
  const matches = (data?.evidence ?? []).filter(e => (filter === 'all' || (filter === 'unmapped' ? !e.location : e.temporalStatus === filter)) && (e.candidate.title + ' ' + e.candidate.summary + ' ' + (e.location?.name ?? '') + ' ' + e.source.account).toLowerCase().includes(query.toLowerCase()));
  const queueCapture = async () => {
    if (mode !== 'live' || jobBusy) return;
    setJobBusy(true); setJobError('');
    try {
      const job = await request<Job>('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (modeRef.current === 'live') { setHandoffJob(job); setActiveView('collection'); setRefresh(n => n + 1); }
    } catch (error) { setJobError(error instanceof Error ? error.message : 'Could not queue collection.'); }
    finally { setJobBusy(false); }
  };
  const acknowledge = async (alert: Alert) => {
    const requestMode = mode; setAcknowledgeError('');
    try { await request('/api/alerts/' + encodeURIComponent(alert.id) + '/acknowledge', { method: 'POST' }); if (modeRef.current === requestMode) setForecast(current => current ? { ...current, alerts: current.alerts.map(a => a.id === alert.id ? { ...a, acknowledged: true } : a) } : current); }
    catch { setAcknowledgeError('Acknowledgement was not saved. Please try again.'); }
  };
  return <div className="app-shell">
    <aside className="sidebar"><a className="brand" href="#main"><span className="brand-mark"><Sprout size={23} /></span><span>AgArena<span className="brand-sub">GROUND YOUR NEXT MOVE</span></span></a>
      <div className="workspace-label">YOUR WORKSPACE</div><nav aria-label="Main navigation"><button className={activeView === 'map' ? 'active' : ''} onClick={() => setActiveView('map')}><Layers3 size={18} /> Evidence map</button><button className={activeView === 'collection' ? 'active' : ''} onClick={() => setActiveView('collection')}><ArrowDownToLine size={18} /> Collection<span className="nav-count">{data?.jobs.filter(j => ['waiting_for_agent', 'collecting'].includes(j.status)).length ?? 0}</span></button></nav>
      <div className="sidebar-note"><Leaf size={23} strokeWidth={1.4} /><strong>A little more context.<br />A better field decision.</strong><p>Local reports, clear provenance, and the outlook ahead.</p></div><div className="sidebar-footer"><span className="region-avatar">ON</span><div>Ontario workspace<small>Local preview · v0.1</small></div></div>
    </aside>
    <div className="main-shell"><header className="topbar"><div className="breadcrumb"><PanelTop size={15} /><span>Workspace</span><span>/</span><strong>{activeView === 'map' ? 'Evidence map' : 'Collection'}</strong></div><div className="mode-switch" aria-label="Data mode"><button aria-pressed={mode === 'live'} onClick={() => changeMode('live')} className={mode === 'live' ? 'active' : ''}><span className="status-dot" /> Live</button><button aria-pressed={mode === 'demo'} onClick={() => changeMode('demo')} className={mode === 'demo' ? 'active demo' : ''}>Demo scenario</button></div></header>
      <main id="main"><div className={'mode-banner ' + mode}><Info size={15} /><span>{mode === 'demo' ? 'DEMO SCENARIO · All source reports and forecasts shown here are synthetic. No real weather event is claimed.' : 'LIVE WORKSPACE · Source reports come from your local capture store. Collection requires a host agent; provider forecasts load separately.'}</span></div>
        <div className="page-heading"><div><span className="eyebrow">A CLEARER VIEW FROM THE GROUND</span><h1>{activeView === 'map' ? 'Know what’s happening nearby.' : 'Bring the source into view.'}</h1><p>{activeView === 'map' ? 'Local evidence. Regional outlook. Every claim with its context.' : 'A transparent handoff from your browser to the evidence map.'}</p></div><button className="primary-button" onClick={() => void queueCapture()} disabled={mode === 'demo' || jobBusy}>{jobBusy ? <LoaderCircle className="spin" size={16} /> : <ArrowDownToLine size={16} />} Collect live reports</button></div>
        {jobError && <div className="error-banner" role="alert">{jobError}</div>}
        {dataError && <div className="error-banner" role="alert"><span>{data ? 'Refresh failed; showing the last loaded data. ' : ''}{dataError}</span><button onClick={() => setRefresh(n => n + 1)}>Retry</button></div>}
        {activeView === 'collection' ? <section className="collection-page"><div className="collection-intro"><span className="large-icon"><ArrowDownToLine size={30} /></span><div><h2>Your browser, with an agent beside it.</h2><p>Queue a request for public posts from @{data?.collector.account ?? 'WxOntario1'}. Then give the handoff to your local Computer Use agent. A queued request has not collected any evidence.</p>{mode === 'demo' && <button className="text-button" onClick={() => changeMode('live')}>Switch to live to collect <ArrowRight size={14} /></button>}</div></div><div className="collection-steps"><div><span>01</span><strong>Queue the request</strong><p>Creates a local job waiting for your agent.</p></div><div><span>02</span><strong>Use the agent handoff</strong><p>Your agent reads public source posts and inspects media.</p></div><div><span>03</span><strong>Review admitted evidence</strong><p>Only validated captures appear in the live map and feed.</p></div></div><div className="section-heading"><h3>Local collection jobs</h3><button className="text-button" onClick={() => setRefresh(n => n + 1)}><RefreshCw size={14} /> Refresh status</button></div>{!data?.jobs.length ? <div className="collection-empty"><Clock3 size={25} /><h3>No collection requests yet.</h3><p>Start a live collection to prepare the agent handoff.</p></div> : <div className="jobs-list">{data.jobs.map(job => <article className="job-card" key={job.id}><div className="job-card-heading"><div><strong>@{job.account}</strong><span className={'tag ' + (job.status === 'completed' ? 'recent' : 'neutral')}>{label(job.status)}</span></div><span>{time(job.updatedAt)}</span></div><p>{job.message}</p><div className="job-card-footer"><span>{job.capturedCount} admitted captures · requested limit {job.limit}</span><button className="text-button" onClick={() => setHandoffJob(job)}>Open agent handoff <ArrowRight size={14} /></button></div></article>)}</div>}</section> : <>
        <section className="summary-strip" aria-label="Evidence overview"><div><span className="summary-icon"><Radio size={20} /></span><div><strong>{data?.counts.total ?? '—'}<span>source reports</span></strong><small>{mode === 'demo' ? 'Synthetic demonstration' : 'Admitted to the local store'}</small></div></div><div><span className="summary-icon"><MapPin size={20} /></span><div><strong>{data?.counts.mapped ?? '—'}<span>with location evidence</span></strong><small>Approximate reference areas</small></div></div><div><span className="summary-icon"><Eye size={20} /></span><div><strong>{data?.counts.images ?? '—'}<span>inspected images</span></strong><small>Findings remain interpretations</small></div></div><button className="refresh-status" onClick={() => setRefresh(n => n + 1)} title="Refresh evidence and forecast"><RefreshCw className={loading ? 'spin' : ''} size={15} /><span>{loading ? 'Loading…' : 'Refresh'}<small>{data ? 'As of ' + shortTime(data.serverTime) : 'Awaiting local API'}</small></span></button></section>
        <div className="dashboard-grid"><div className="evidence-workspace"><section className="map-section"><div className="map-toolbar"><div><span className="eyebrow">ONTARIO · REGIONAL CONTEXT</span><h2>The evidence map</h2></div><label className="region-select"><MapPin size={15} /><span className="sr-only">Region</span><select aria-label="Region" value={region} onChange={e => selectPlace(e.target.value)} disabled={!data?.places.length}>{data?.places.map(place => <option key={place.id} value={place.id}>{regionName(place.name)}</option>)}</select><ChevronDown size={14} /></label></div><EvidenceMap places={data?.places ?? []} evidence={data?.evidence ?? []} selectedPlace={selectedPlace} onSelectPlace={selectPlace} /></section>
          <div className="evidence-bottom"><section className="feed" aria-label="Source evidence feed"><div className="section-heading"><div><span className="eyebrow">THE SOURCE FEED</span><h2>Reports, in context.</h2></div><span className="feed-count">{matches.length}</span></div><label className="search-box"><Search size={15} /><span className="sr-only">Search reports</span><input placeholder="Search reports or places" value={query} onChange={e => setQuery(e.target.value)} /></label><div className="filter-row" aria-label="Filter reports">{(['all', 'recent', 'historical', 'unmapped'] as Filter[]).map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)} className={filter === value ? 'active' : ''}>{value === 'all' ? 'All reports' : value[0].toUpperCase() + value.slice(1)}</button>)}</div>
            {loading && !data ? <div className="feed-empty"><LoaderCircle className="spin" size={25} /><h3>Loading evidence…</h3></div> : !matches.length ? <div className="feed-empty"><Sprout size={30} /><h3>{!data && dataError ? 'Evidence unavailable.' : data?.evidence.length ? 'No matching reports.' : 'The next report starts here.'}</h3><p>{!data && dataError ? 'The local evidence service could not be reached. Retry when it is available.' : data?.evidence.length ? 'Try a different search or filter.' : 'Your live evidence store is empty. Collect reports with a local agent, or explore the synthetic scenario.'}</p>{data && !data.evidence.length && mode === 'live' && <button className="text-button" onClick={() => changeMode('demo')}>Explore demo scenario <ArrowRight size={14} /></button>}</div> : <div className="feed-list">{matches.map(item => <button className={'evidence-card ' + (selectedId === item.id ? 'selected' : '')} key={item.id} onClick={() => { setSelectedId(item.id); if (item.location) setRegion(item.location.id); }} aria-pressed={selectedId === item.id}><div className="evidence-card-top"><span className={'hazard-icon ' + item.candidate.hazard}><HazardIcon hazard={item.candidate.hazard} /></span><span className={'temporal-label ' + item.temporalStatus}>{label(item.temporalStatus)}</span><ArrowRight size={14} className="card-arrow" /></div><h3>{item.candidate.title}</h3><p>{item.candidate.summary}</p><div className="evidence-card-bottom"><span><MapPin size={12} />{item.location ? regionName(item.location.name) : 'Location unresolved'}</span><span>{item.source.kind === 'demo' ? 'Synthetic' : '@' + item.source.account}</span></div></button>)}</div>}
          </section><EvidenceInspector item={selected} /></div></div>
          <Outlook result={forecast} pending={forecastLoading} error={forecastError} place={selectedPlace ? regionName(selectedPlace.name) : 'Choose a region'} threshold={threshold} onThreshold={setThreshold} onRetry={() => setRefresh(n => n + 1)} onAcknowledge={alert => void acknowledge(alert)} acknowledgeError={acknowledgeError} />
        </div><footer className="page-footer"><span><ShieldCheck size={13} /> Evidence supports judgment. It does not replace official weather guidance.</span><a href="https://weather.gc.ca/" target="_blank" rel="noopener noreferrer">Environment Canada <ExternalLink size={12} /></a></footer>
      </>}</main>
    </div>
    {handoffJob && <dialog className="handoff-dialog" ref={modal} onCancel={() => setHandoffJob(null)} onClose={() => setHandoffJob(null)} aria-labelledby="handoff-title"><div className="dialog-heading"><span className="eyebrow">HOST-ASSISTED COLLECTION</span><button className="icon-button" autoFocus onClick={() => setHandoffJob(null)} aria-label="Close agent handoff"><X size={20} /></button></div><h2 id="handoff-title">Your agent takes it from here.</h2><p>The request is <strong>{label((data?.jobs.find(j => j.id === handoffJob.id) ?? handoffJob).status)}</strong>. Copy this handoff into your local Computer Use agent. This app has not started browser collection.</p><div className="handoff-state"><Clock3 size={18} /><span>{(data?.jobs.find(j => j.id === handoffJob.id) ?? handoffJob).capturedCount} captures admitted to the live store</span></div>{promptError && <p className="inline-error" role="alert">{promptError}</p>}{!prompt ? !promptError && <p role="status">Loading agent instructions…</p> : <><label htmlFor="agent-prompt">Agent handoff instructions</label><textarea id="agent-prompt" value={prompt} readOnly spellCheck={false} /><button className="primary-button" onClick={async () => { try { await navigator.clipboard.writeText(prompt); setCopied(true); } catch { setPromptError('Clipboard is unavailable. Select and copy the instructions manually.'); } }}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied to clipboard' : 'Copy agent handoff'}</button><p className="copy-hint">Copying prepares the handoff. Job status changes only when the host agent reports progress.</p></>}</dialog>}
  </div>;
}
