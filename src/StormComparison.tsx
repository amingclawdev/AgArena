import { useEffect, useState } from "react";
import { ArrowUpRight, Leaf, ShieldCheck, MapPin, Clock3 } from "lucide-react";
import { analysts, insights, type CaseId } from "../shared/analyst-watch";
import { officialBaselines, baselineStatus } from "../shared/official-baselines";
import "./leaderboard.css";
import "./storm-comparison.css";

const events: { id: CaseId; label: string; title: string }[] = [
  { id: "outbreak", label: "Sep 2 · Ontario outbreak", title: "One storm. Different perspectives." },
  { id: "sep9", label: "Sep 9 · GTA storms", title: "Rain, risk and the forecast window." },
  { id: "monkton", label: "Sep 2 · Monkton", title: "From satellite evidence to a place." },
];
export default function StormComparison() {
  const [event, setEvent] = useState<CaseId>("outbreak");
  const [forecastsOnly, setForecastsOnly] = useState(false);
  const [author, setAuthor] = useState("all");
  useEffect(() => { document.title = "AgArena · Storm comparison"; }, []);
  const baseline = officialBaselines[event];
  const selected = events.find(e => e.id === event)!;
  const records = insights.filter(i => i.caseId === event || (event === "outbreak" && i.caseId === "monkton"));
  const visible = analysts.filter(a => author === "all" || a.id === author).filter(a => !forecastsOnly || records.some(i => i.analystId === a.id && i.kind === "forecast"));
  return <div className="league-shell storm-shell">
    <header className="league-header">
      <a className="brand" href="/"><span className="brand-mark"><Leaf size={22}/></span>AgArena<span className="wordmark-dot">.</span></a>
      <nav aria-label="Primary"><a href="/">Field intelligence</a><a href="/leaderboard">Leaderboard</a><a href="/comparison" aria-current="page">Storm comparison</a></nav>
      <span className="league-preview">Historical evidence</span>
    </header>
    <main className="league-main">
      <p className="league-eyebrow">THE STORM DESK / SEPTEMBER 2026</p>
      <h1 className="storm-title">{selected.title}</h1>
      <p className="storm-intro">Compare the hazard, the place and the time horizon behind each analyst’s insight with the official agency message.</p>
      <div className="league-categories" role="group" aria-label="Storm event">{events.map(e => <button key={e.id} aria-pressed={event === e.id} onClick={() => {setEvent(e.id); setAuthor("all");}}>{e.label}</button>)}</div>
      <div className="storm-summary">
        <article><ShieldCheck size={19}/><strong>Environment Canada</strong><p>Ontario’s official baseline. Historical bulletin evidence is provisional or missing, as labeled below.</p></article>
        <article><MapPin size={19}/><strong>Match the geography</strong><p>{event === "outbreak" ? "The selected GTA-area warning does not establish coverage at Monkton or Tavistock." : baseline.coverage}</p></article>
        <article><Clock3 size={19}/><strong>Horizon ≠ lead time</strong><p>A forecast’s valid window is shown separately from publication. Incomplete timestamps prevent a lead-time winner.</p></article>
      </div>
      <div className="storm-controls">
        <label>Analyst <select value={author} onChange={e => setAuthor(e.target.value)}><option value="all">All six sources</option>{analysts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
        <label className="storm-checkbox"><input type="checkbox" checked={forecastsOnly} onChange={e => setForecastsOnly(e.target.checked)}/> Forecasts only</label>
        <span>Official baseline stays visible · no simulated scores</span>
      </div>
      <div className="storm-table-wrap" role="region" aria-label="Storm insight comparison" tabIndex={0}>
        <table className="storm-table"><caption>{selected.label} · source messages, not accuracy rankings</caption>
          <thead><tr><th scope="col">Source / evidence</th><th scope="col">Severity & insight</th><th scope="col">Affected location / scope</th><th scope="col">Publication & time horizon</th><th scope="col">Comparison with status quo</th></tr></thead>
          <tbody>
            <tr className="storm-official"><th scope="row"><ShieldCheck size={20}/><strong>Environment Canada</strong><span className="storm-tag">OFFICIAL BASELINE</span><small>{baselineStatus(baseline)}</small><a href={baseline.sourceUrl} target="_blank" rel="noreferrer">Official URL ↗</a></th><td>{baseline.message}</td><td>{baseline.coverage}</td><td><strong>{baseline.issued}</strong><p>{baseline.product === "warning" ? "Operational warning during the event. Expiry and full warning sequence not captured." : baseline.product === "forecast" ? "Valid for September 9; exact local hazard onset is not specified." : "Matched issue time and valid period unavailable."}</p></td><td>{baseline.limitation}</td></tr>
            {visible.map(a => {
              const item = records.find(i => i.analystId === a.id);
              return <tr key={a.id}><th scope="row"><strong>{a.name}</strong><small>@{a.handle}</small><span className={`storm-tag ${item?.kind === "forecast" ? "storm-forecast" : ""}`}>{item ? item.kind === "forecast" ? "FORECAST" : "POST-EVENT " + item.kind.toUpperCase() : "EVIDENCE GAP"}</span>{item && <a href={item.url} target="_blank" rel="noreferrer">Read source <ArrowUpRight size={12}/></a>}</th>
                {!item ? <td colSpan={4}><strong>No reviewed insight for this event.</strong><p>This source has not been assigned a claim or score. Missing evidence does not mean they did not forecast the storm.</p></td> : <>
                  <td>{item.summary}</td><td>{item.scope}{item.caseId === "monkton" && <a className="storm-map-link" href="/examples/monkton">Satellite & location polygon ↗</a>}</td>
                  <td><strong>Published {item.publishedOn}</strong><small>Exact publication time unverified</small><p><b>Valid / observed:</b> {item.window}</p><small>Event: {item.eventOn}</small></td>
                  <td><span className="storm-verdict">{item.kind !== "forecast" ? "Context only · not a prediction" : event === "sep9" ? "Overlapping outlook · provisional" : "Different product & window"}</span><p>{item.kind !== "forecast" ? "Published after the event. This cannot demonstrate advance warning or forecast superiority." : event === "sep9" ? baseline.comparison : "A regional hazard outlook and a local operational warning describe different stages. Their severity labels are not a shared scale."}</p><small>{item.caveat}</small></td>
                </>}
              </tr>;
            })}
            {!visible.length && <tr><td colSpan={5}>No reviewed forecast matches this selection. Turn off Forecasts only to see post-event evidence and gaps.</td></tr>}
          </tbody>
        </table>
      </div>
      <section className="storm-takeaway"><div><p className="league-eyebrow">WHAT WE CAN SAY</p><h2>Compare the message before the score.</h2><p>{baseline.comparison}</p></div><div><h3>Why not the Met Office?</h3><p>For this Ontario event, Environment Canada is the relevant official agency. The <a href="https://weather.metoffice.gov.uk/guides/warnings" target="_blank" rel="noreferrer">Met Office’s UK warning service</a> belongs alongside a UK event, rather than as an Ontario warning baseline.</p><p>Curated September 12 snapshot. No live alerts, complete warning archive or verified performance scores. The leaderboard’s fictional scores are independent of this evidence.</p></div></section>
      <div className="league-footer"><a href="/#analyst-watch">Explore all source notes ↗</a><a href="/leaderboard">Return to Forecast Arena ↗</a></div>
    </main>
  </div>;
}
