import AnalystExample from "./AnalystExample";
import AnalystWatch from "./AnalystWatch";
import Leaderboard from "./Leaderboard";
import StormComparison from "./StormComparison";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CloudRain,
  Layers,
  Leaf,
  MapPin,
  ShieldCheck,
  Clock3,
  ChevronRight,
  FlaskConical,
  Wind,
} from "lucide-react";
import type { Brief, Field, Scenario } from "../shared/contracts";
import FieldMap from "./FieldMap";
const times = ["2026-09-12T12:00:00Z", "2026-09-12T15:00:00Z"];
const fmt = (s: string) =>
  new Date(s).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  }) + " UTC";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch("/api" + path, init);
  if (!r.ok)
    throw new Error(
      r.status === 401
        ? "Demo session expired. Reload to begin again."
        : "Unable to load evidence. Try again.",
    );
  return r.json();
}
export default function App() {
  if (window.location.pathname === "/comparison") return <StormComparison />;
  if (window.location.pathname === "/leaderboard") return <Leaderboard />;
  return window.location.pathname === "/examples/monkton" ? (
    <AnalystExample />
  ) : (
    <Workspace />
  );
}
function Workspace() {
  const [tenant, setTenant] = useState("alpha");
  const [session, setSession] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [selected, setSelected] = useState("");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [time, setTime] = useState(times[1]);
  const [scenario, setScenario] = useState<Scenario>("normal");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  useEffect(() => {
    let active = true;
    setSession("");
    setFields([]);
    setSelected("");
    setBrief(null);
    setError("");
    request<{ tenant: string }>("/demo/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenant }),
    })
      .then(() => request<Field[]>("/fields"))
      .then((f) => {
        if (active) {
          setFields(f);
          setSelected(f[0]?.id ?? "");
          setSession(tenant);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [tenant, retry]);
  useEffect(() => {
    if (!session || !selected) return;
    let active = true;
    setBrief(null);
    setError("");
    request<Brief>(
      `/fields/${selected}/brief?asOf=${encodeURIComponent(time)}&scenario=${scenario}`,
    )
      .then((b) => {
        if (active) setBrief(b);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [selected, time, scenario, session]);
  const forecast = brief?.forecast;
  const rain = forecast?.rainMm;
  const total = rain?.reduce((a, b) => a + b, 0);
  const field = fields.find((f) => f.id === selected);
  return (
    <>
      <header className="topbar">
        <a className="brand" href="/" aria-label="AgArena home">
          <span className="brand-mark">
            <Leaf size={23} />
          </span>
          AgArena<span className="wordmark-dot">.</span>
        </a>
        <nav aria-label="Primary">
          <span className="active">Field intelligence</span>
          <a href="#analyst-watch">Analyst watch</a>
          <a href="/comparison">Storm comparison</a>
          <a href="/capture">Live capture</a>
          <a href="/leaderboard">
            Leaderboard <small>Preview</small>
          </a>
        </nav>
        <div className="workspace-name">
          <span className="avatar">{tenant === "alpha" ? "A" : "B"}</span>
          <span>
            {tenant === "alpha" ? "Alder Creek" : "Birch Lane"}
            <small>Demo workspace</small>
          </span>
        </div>
      </header>
      <main>
        <div className="page-heading">
          <div>
            <p className="eyebrow">THE FIELD NOTES / SEPTEMBER 12, 2026</p>
            <h1>A clearer view of what’s ahead.</h1>
            <p className="subtitle">
              Weather context for your fields. Evidence behind every outlook.
            </p>
          </div>
          <span className="demo-label">
            <FlaskConical size={15} /> Synthetic evidence demo
          </span>
        </div>
        <section className="summary" aria-label="Workspace overview">
          <div>
            <span className="summary-icon">
              <Layers />
            </span>
            <p>
              YOUR WORKSPACE
              <strong>
                {fields.length} {fields.length === 1 ? "field" : "fields"}{" "}
                <small>· {fields.reduce((s, f) => s + f.area, 0)} ha</small>
              </strong>
            </p>
          </div>
          <div>
            <span className="summary-icon">
              <CloudRain />
            </span>
            <p>
              OUTLOOK WINDOW<strong>Sep 12–13 · 15:00 UTC</strong>
            </p>
          </div>
          <div>
            <span className="summary-icon">
              <ShieldCheck />
            </span>
            <p>
              EVIDENCE MODE
              <strong>
                Recorded fixture <small>· weather demo</small>
              </strong>
            </p>
          </div>
        </section>
        <div className="workspace-grid">
          <aside className="field-panel">
            <div className="panel-heading">
              <h2>Your fields</h2>
              <span>{fields.length.toString().padStart(2, "0")}</span>
            </div>
            <p className="panel-caption">
              Select a field to explore its outlook.
            </p>
            <div className="field-list">
              {fields.map((f, i) => (
                <button
                  key={f.id}
                  className={
                    "field-card " + (selected === f.id ? "selected" : "")
                  }
                  onClick={() => setSelected(f.id)}
                  aria-pressed={selected === f.id}
                >
                  <div className="field-card-top">
                    <span className="field-number">0{i + 1}</span>
                    <ChevronRight size={17} />
                  </div>
                  <h3>{f.name}</h3>
                  <p>
                    {f.crop} <span>·</span> {f.area} ha
                  </p>
                  <span
                    className={"pill " + (f.id === "south" ? "muted" : "amber")}
                  >
                    {f.id === "south"
                      ? "Local evidence missing"
                      : "Review weather outlook"}
                  </span>
                </button>
              ))}
            </div>
            <div className="field-note">
              <MapPin size={19} />
              <p>
                <strong>Local context. Honest limits.</strong>Field boundaries
                help frame the question. A model grid is not a measurement of
                your field.
              </p>
            </div>
          </aside>
          <section className="map-panel" aria-label="Field workspace">
            <div className="map-heading">
              <div>
                <span className="tiny">STUDY AREA</span>
                <h2>{field?.name ?? "Loading fields…"}</h2>
              </div>
              <span className="map-tag">
                <Layers size={14} /> Field boundaries
              </span>
            </div>
            <FieldMap
              fields={fields}
              selected={selected}
              onSelect={setSelected}
            />
            <div className="map-legend">
              <span className="legend-swatch" /> Selected field{" "}
              <span className="legend-swatch secondary" /> Other fields
            </div>
            <div className="map-disclaimer">
              Real basemap · demo boundaries · imagery is not live
            </div>
          </section>
          <aside className="brief-panel" aria-label="Selected field outlook">
            <div className="panel-heading">
              <h2>Field outlook</h2>
              <span className="tiny">24 H</span>
            </div>
            {error ? (
              <div role="alert" className="error">
                <p>{error}</p>
                <button onClick={() => setRetry((x) => x + 1)}>Retry</button>
              </div>
            ) : !brief ? (
              <p role="status" className="loading">
                Loading field evidence…
              </p>
            ) : (
              <>
                <span
                  className={
                    "pill " + (brief.status === "unknown" ? "muted" : "amber")
                  }
                >
                  {brief.status === "unknown"
                    ? "Unknown · insufficient evidence"
                    : "Model outlook · unvalidated locally"}
                </span>
                <h3 className="outlook-title">{brief.headline}</h3>
                <p className="explanation">{brief.explanation}</p>
                <div className="rain-stat">
                  <CloudRain size={28} />
                  <div>
                    <strong>
                      {total === undefined ? "—" : total.toFixed(1)}{" "}
                      <small>mm</small>
                    </strong>
                    <span>Modelled accumulation · 24-hour window</span>
                  </div>
                </div>
                <div
                  className="rain-chart"
                  aria-label={
                    rain
                      ? "Rainfall forecast in millimetres per three-hour interval"
                      : "No usable rainfall forecast"
                  }
                >
                  {Array.from({ length: 8 }, (_, i) => (
                    <div className="bar-col" key={i}>
                      <span>{rain ? rain[i].toFixed(1) : "—"}</span>
                      <div className="bar-track">
                        <div
                          style={{
                            height: rain
                              ? `${Math.max(rain[i] * 22, 2)}%`
                              : "0%",
                          }}
                        />
                      </div>
                      <small>
                        {["18", "21", "00", "03", "06", "09", "12", "15"][i]}
                      </small>
                    </div>
                  ))}
                </div>
                <p className="chart-caption">
                  3-hour totals · interval ending hour (UTC) · synthetic
                </p>
                <div className="evidence-callout">
                  <Clock3 size={18} />
                  <div>
                    <strong>Field conditions remain unknown</strong>
                    <p>{brief.missing.join(" ")}</p>
                  </div>
                </div>
                <button
                  className="evidence-button"
                  onClick={() => setEvidenceOpen(true)}
                >
                  Inspect the evidence <ArrowUpRight size={17} />
                </button>
              </>
            )}
          </aside>
        </div>
        <section className="replay">
          <div className="replay-title">
            <Clock3 size={20} />
            <div>
              <h2>Replay the evidence</h2>
              <p>See what was available at the decision time.</p>
            </div>
          </div>
          <label>
            DECISION TIME
            <select value={time} onChange={(e) => setTime(e.target.value)}>
              {times.map((t) => (
                <option key={t} value={t}>
                  {fmt(t)}
                </option>
              ))}
            </select>
          </label>
          <label>
            SOURCE SCENARIO
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value as Scenario)}
            >
              <option value="normal">Normal publication</option>
              <option value="missing">Missing forecast</option>
              <option value="stale">Stale forecast</option>
              <option value="withdrawn">Withdrawn source</option>
            </select>
          </label>
          <label>
            DEMO TENANT
            <select
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
              disabled={!session && !error}
            >
              <option value="alpha">Alpha · Alder Creek</option>
              <option value="beta">Beta · Birch Lane</option>
            </select>
          </label>
        </section>
        <AnalystWatch />
        <footer>
          <span>
            <Wind size={14} /> Built for better questions, grounded in evidence.
          </span>
          <span>AgArena / Local prototype 0.1</span>
        </footer>
      </main>
      {evidenceOpen && brief && (
        <div className="dialog-backdrop" onClick={() => setEvidenceOpen(false)}>
          <dialog
            open
            aria-modal="true"
            aria-labelledby="evidence-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setEvidenceOpen(false);
              if (e.key === "Tab") {
                e.preventDefault();
                e.currentTarget.querySelector("button")?.focus();
              }
            }}
          >
            <div className="panel-heading">
              <h2 id="evidence-title">Behind this outlook</h2>
              <button autoFocus onClick={() => setEvidenceOpen(false)}>
                Close
              </button>
            </div>
            <p>Decision time: {fmt(brief.asOf)} · All records are synthetic.</p>
            <p>
              <strong>Rule:</strong> {brief.ruleVersion}. Only evidence
              available and ingested by this time is included. Forecasts older
              than six hours are unusable.
            </p>
            {brief.evidence.map((e) => (
              <article className="evidence-record" key={e.id}>
                <span className="pill muted">
                  {e.type.replaceAll("_", " ")} · {e.quality}
                </span>
                <h3>{e.source}</h3>
                <p>{e.note}</p>
                <dl>
                  <dt>Spatial support</dt>
                  <dd>{e.support}</dd>
                  {e.initializedAt && (
                    <>
                      <dt>Initialized</dt>
                      <dd>{fmt(e.initializedAt)}</dd>
                    </>
                  )}
                  <dt>Issued / reported</dt>
                  <dd>{fmt(e.issuedAt)}</dd>
                  <dt>Available</dt>
                  <dd>{fmt(e.availableAt)}</dd>
                  <dt>Ingested</dt>
                  <dd>{fmt(e.ingestedAt)}</dd>
                  <dt>Valid interval</dt>
                  <dd>
                    {fmt(e.validFrom)} → {fmt(e.validUntil)}
                  </dd>
                  <dt>Evidence ID</dt>
                  <dd>{e.id}</dd>
                </dl>
              </article>
            ))}
            {!brief.evidence.length && (
              <p>No admissible evidence at this decision time.</p>
            )}
          </dialog>
        </div>
      )}
    </>
  );
}
