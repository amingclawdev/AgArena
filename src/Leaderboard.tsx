import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  Columns3,
  Filter,
  Leaf,
  MapPin,
  Search,
  ShieldCheck,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { analysts } from "../shared/analyst-watch";
import "./leaderboard.css";
import { simulatedScores } from "../shared/simulated-scores";
const categories = [
  "Overall",
  "Rainfall",
  "Temperature",
  "Severe weather",
  "Field conditions",
];
const metrics = [
  {
    id: "score",
    name: "Arena score",
    description:
      "Demo score on a 0–100 scale, assigned for this visual prototype. It is not calculated from forecasts. A real scoring method is still to be selected.",
  },
  {
    id: "baseline",
    name: "vs. baseline",
    description:
      "Demo Arena score minus the fictional Environment Canada score, in points. Zero marks the demo reference. No real agency comparison is implied.",
  },
  {
    id: "calibration",
    name: "Calibration",
    description:
      "Illustrative calibration score out of 100. Values are invented, not estimated from forecast probabilities and outcomes.",
  },
  {
    id: "lead",
    name: "Lead time",
    description:
      "Illustrative hours of advance notice. These values do not measure the timing of any source post.",
  },
  {
    id: "evaluated",
    name: "Evaluated",
    description:
      "Invented counts of synthetic cases for the scorecard preview. No real forecasts have been evaluated.",
  },
];
type Source = {
  id: string;
  name: string;
  handle: string;
  specialty: string;
  kind: "analyst" | "agency";
  url: string;
};
const roster: Source[] = [
  ...analysts
    .map((a) => ({
      id: a.id,
      name: a.name,
      handle: `@${a.handle}`,
      specialty: a.specialty,
      kind: "analyst" as const,
      url: `https://x.com/${a.handle}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
  {
    id: "eccc",
    name: "Environment Canada",
    handle: "ECCC · Canada",
    specialty: "Official forecasts and warnings for Canadian locations",
    kind: "agency",
    url: "https://weather.gc.ca/",
  },
];
export default function Leaderboard() {
  useEffect(() => {
    document.title = "AgArena · Forecast leaderboard";
  }, []);
  const [category, setCategory] = useState("Overall");
  const [simulation, setSimulation] = useState(true);
  const scores = simulatedScores(category);
  const [group, setGroup] = useState("all");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(true);
  const [region, setRegion] = useState("Southern Ontario");
  const [period, setPeriod] = useState("Last 30 days");
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [columns, setColumns] = useState(metrics.map((m) => m.id));
  const [selected, setSelected] = useState<Source | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
  }, [selected]);
  const ordered = simulation ? [...roster].sort((a, b) => scores[a.id].rank - scores[b.id].rank) : roster;
  const visible = ordered.filter(
    (s) =>
      (group === "all" || s.kind === group) &&
      `${s.name} ${s.handle}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  const activeMetrics = metrics.filter((m) => columns.includes(m.id));
  function reset() {
    setQuery("");
    setGroup("all");
    setRegion("Southern Ontario");
    setPeriod("Last 30 days");
    setCategory("Overall");
  }
  return (
    <div className="league-shell">
      <header className="league-header">
        <a className="brand" href="/" aria-label="AgArena home">
          <span className="brand-mark">
            <Leaf size={22} />
          </span>
          AgArena<span className="wordmark-dot">.</span>
        </a>
        <nav aria-label="Primary">
          <a href="/">Field intelligence</a>
          <a href="/comparison">Storm comparison</a>
          <a href="/leaderboard" aria-current="page">
            Leaderboard
          </a>
        </nav>
        <span className="league-preview">
          <span /> {simulation ? "Simulated scoring" : "Design preview"}
        </span>
      </header>
      <main className="league-main">
        <div className="league-hero">
          <div>
            <p className="league-eyebrow">THE FORECAST LEAGUE</p>
            <div className="league-title">
              <h1>Forecast Arena</h1>
              <span>
                <Trophy size={16} /> {category}
              </span>
            </div>
            <p className="league-description">
              A clearer picture of who sees what’s coming.
            </p>
            <p className="league-subtitle">
              Compare weather forecasters against each other—and the official
              baseline.
            </p>
          </div>
          <div className="league-season">
            <span>FOUNDING ROSTER</span>
            <strong>
              Ontario <span>’26</span>
            </strong>
            <small>
              <MapPin size={12} /> Starting where the evidence is.
            </small>
          </div>
        </div>
        <div className="league-stats">
          <span>
            <Users size={15} /> <strong>6</strong> community voices
          </span>
          <span>
            <ShieldCheck size={15} /> <strong>1</strong> official baseline
          </span>
          <span className="league-pending-dot">
            <i /> {simulation ? "Fictional scorecard · no real evaluations" : "Rankings not yet calculated"}
          </span>
        </div>
        <div className="league-simulation-banner">
          <div><strong>{simulation ? "Simulated scoring" : "Scoring preview paused"}</strong>
          <p>Real source names. Fictional ranks and values, including the agency baseline. These are not measured analyst results.</p></div>
          <button aria-pressed={simulation} onClick={() => setSimulation(!simulation)}>{simulation ? "Hide demo scores" : "Show demo scores"}</button>
        </div>
        <div
          className="league-categories"
          role="group"
          aria-label="Forecast category"
        >
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
            >
              {c === "Overall" && <Trophy size={14} />} {c}
            </button>
          ))}
        </div>
        <div className="league-toolbar">
          <button
            className="league-filter-toggle"
            onClick={() => setFilters(!filters)}
            aria-expanded={filters}
            aria-controls="league-filters"
          >
            <Filter size={14} />
            {filters ? "Hide filters" : "Show filters"}
          </button>
          <div className="league-tools">
            <div
              className="league-segment"
              role="group"
              aria-label="Source type"
            >
              {[
                { id: "all", name: "All sources" },
                { id: "analyst", name: "Analysts" },
                { id: "agency", name: "Agencies" },
              ].map((g) => (
                <button
                  key={g.id}
                  aria-pressed={group === g.id}
                  onClick={() => setGroup(g.id)}
                >
                  {g.name}
                </button>
              ))}
            </div>
            <label className="league-search">
              <Search size={15} />
              <input
                aria-label="Search forecasters"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a forecaster"
              />
              {query && (
                <button aria-label="Clear search" onClick={() => setQuery("")}>
                  <X size={12} />
                </button>
              )}
            </label>
            <div className="league-columns">
              <button
                aria-label="Choose metric columns"
                aria-expanded={columnsOpen}
                onClick={() => setColumnsOpen(!columnsOpen)}
              >
                <Columns3 size={16} />
              </button>
              {columnsOpen && (
                <div className="league-column-menu">
                  <strong>Visible metrics</strong>
                  {metrics.map((m) => (
                    <label key={m.id}>
                      <input
                        type="checkbox"
                        checked={columns.includes(m.id)}
                        onChange={() =>
                          setColumns((cols) =>
                            cols.includes(m.id)
                              ? cols.filter((c) => c !== m.id)
                              : [...cols, m.id],
                          )
                        }
                      />
                      {m.name}
                    </label>
                  ))}
                  <button onClick={() => setColumnsOpen(false)}>
                    <Check size={12} /> Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {filters && (
          <div className="league-filters" id="league-filters">
            <label>
              Region
              <div>
                <MapPin size={13} />
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option>Southern Ontario</option>
                  <option>Greater Toronto Area</option>
                  <option>Huron–Perth</option>
                </select>
              </div>
            </label>
            <label>
              Evaluation window
              <div>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>All time</option>
                </select>
              </div>
            </label>
            <span className="league-scope-note">
              Region and window are preview only; demo values do not change.
            </span>
            <button onClick={reset}>Reset</button>
          </div>
        )}
        <div className="league-table-top">
          <span>
            {category} <span>/</span> {region} <span>/</span> {period}
          </span>
          <small>
            {visible.length} sources shown · {simulation ? "simulated score, highest first" : "analysts A–Z, agency reference last"}
          </small>
        </div>
        <div
          className="league-table-scroll"
          role="region"
          aria-label="Forecaster leaderboard"
          tabIndex={0}
        >
          <table className="league-table">
            <thead>
              <tr>
                <th scope="col" className="league-rank">
                  Rank
                </th>
                <th scope="col">Forecaster</th>
                {activeMetrics.map((m) => (
                  <th scope="col" key={m.id}>
                    <span>
                      {m.name}
                      <button
                        aria-label={`About ${m.name}`}
                        title={m.description}
                        onClick={() => {
                          const el = document.getElementById(`metric-${m.id}`);
                          if (el instanceof HTMLDetailsElement) {
                            el.open = true;
                            el.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }
                        }}
                      >
                        <CircleHelp size={12} />
                      </button>
                    </span>
                  </th>
                ))}
                <th scope="col">
                  <span className="league-sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s, index) => (
                <tr
                  key={s.id}
                  className={s.kind === "agency" ? "league-agency-row" : ""}
                >
                  <td className="league-rank">
                    <span aria-label={simulation ? `Simulated rank ${scores[s.id].rank}` : "Not ranked"}>{simulation ? scores[s.id].rank : "—"}</span>
                    <small>{simulation ? "DEMO" : s.kind === "agency" ? "REF" : "NR"}</small>
                  </td>
                  <td>
                    <button
                      className="league-source-button"
                      onClick={() => setSelected(s)}
                    >
                      <span
                        className={`league-source-avatar league-avatar-${index % 4}`}
                      >
                        {s.kind === "agency" ? (
                          <ShieldCheck size={20} />
                        ) : (
                          s.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                        )}
                      </span>
                      <span>
                        <strong>
                          {s.name}
                          {s.kind === "agency" && <em>BASELINE</em>}
                        </strong>
                        <small>
                          {s.handle} <span>·</span>{" "}
                          {s.kind === "agency"
                            ? "Official agency"
                            : "Community source"}
                        </small>
                      </span>
                    </button>
                  </td>
                  {activeMetrics.map((m) => (
                    <td
                      key={m.id}
                      className={`league-metric-cell league-metric-${m.id}`}
                    >
                      <span className={`league-metric-value ${simulation && m.id === "baseline" ? scores[s.id].baseline < 0 ? "league-negative" : "league-positive" : ""}`}>
                        {!simulation ? "—" : m.id === "score" ? scores[s.id].score.toFixed(1)
                          : m.id === "baseline" ? `${scores[s.id].baseline > 0 ? "+" : ""}${scores[s.id].baseline.toFixed(1)}`
                          : m.id === "calibration" ? `${scores[s.id].calibration}/100`
                          : m.id === "lead" ? `${scores[s.id].lead} h`
                          : scores[s.id].evaluated}
                      </span>
                      {m.id === "score" ? <span className={`league-score-track ${simulation ? "league-score-filled" : ""}`} aria-hidden="true">
                        {simulation && <i style={{ width: `${scores[s.id].score}%` }} />}
                      </span> : <small>{!simulation ? "Not evaluated" : m.id === "baseline" ? s.kind === "agency" ? "Demo reference" : "demo points" : m.id === "evaluated" ? "synthetic cases" : "simulated"}</small>}

                    </td>
                  ))}
                  <td>
                    <button
                      className="league-row-open"
                      onClick={() => setSelected(s)}
                      aria-label={`View ${s.name}`}
                    >
                      <ArrowUpRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan={activeMetrics.length + 3}>
                    <div className="league-empty">
                      <Search size={24} />
                      <h3>No forecasters found</h3>
                      <p>Try another name or source type.</p>
                      <button
                        onClick={() => {
                          setQuery("");
                          setGroup("all");
                        }}
                      >
                        Clear search & source filter
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="league-table-foot">
          <span>
            <span className="league-small-dot" /> {simulation ? "SIMULATED · all ranks and metrics are fictional" : "UI preview · scores and ranks are pending"}
          </span>
          <a href="/#analyst-watch">
            Explore the source evidence <ArrowUpRight size={13} />
          </a>
        </div>
        <section className="league-bottom">
          <div className="league-why">
            <p className="league-eyebrow">EVIDENCE BEFORE REPUTATION</p>
            <h2>A forecast earns its place.</h2>
            <p>
              This is a simulated scorecard. The roster is real; all displayed scores and ranks are fictional. Performance has not been evaluated. An observation or a shared
              storm photo is not automatically a scored forecast.
            </p>
            <a href="/#analyst-watch">
              Meet the founding sources <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="league-definitions">
            <h3>
              On the scorecard <span>PROPOSED</span>
            </h3>
            {metrics.map((m) => (
              <details key={m.id} id={`metric-${m.id}`}>
                <summary>
                  {m.name}
                  <ChevronDown size={13} />
                </summary>
                <p>{m.description}</p>
              </details>
            ))}
          </div>
        </section>
        <div className="league-footer">
          <span>
            <Leaf size={14} /> Grounded in evidence. Open to better forecasts.
          </span>
          <span>AgArena / Forecast league preview</span>
        </div>
      </main>
      <dialog
        className="league-dialog"
        ref={dialog}
        onClose={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        {selected && (
          <div>
            <button
              className="league-dialog-close"
              onClick={() => dialog.current?.close()}
              aria-label="Close source details"
            >
              <X size={18} />
            </button>
            <span className="league-eyebrow">
              {selected.kind === "agency"
                ? "OFFICIAL BASELINE"
                : "FOUNDING SOURCE"}
            </span>
            <h2>{selected.name}</h2>
            <span className="league-dialog-handle">{selected.handle}</span>
            <p>{selected.specialty}</p>
            <div className="league-dialog-status">
              <ShieldCheck size={18} />
              <div>
                <strong>{simulation ? `Simulated rank #${scores[selected.id].rank} · ${scores[selected.id].score.toFixed(1)} / 100` : "Not evaluated"}</strong>
                <p>
                  All demo ranks, scores and comparisons are fictional fixtures. This source has not been evaluated. The linked evidence is independent of this mock scorecard.
                </p>
              </div>
            </div>
            <a href={selected.url} target="_blank" rel="noreferrer">
              Open source profile <ArrowUpRight size={15} />
            </a>
            <a href="/#analyst-watch">
              Read the current evidence <ArrowUpRight size={15} />
            </a>
          </div>
        )}
      </dialog>
    </div>
  );
}
