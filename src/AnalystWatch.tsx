import { useState } from "react";
import OfficialBaseline from "./OfficialBaseline";
import { ArrowUpRight, Users, MapPin, GitCompareArrows } from "lucide-react";
import {
  analysts,
  cases,
  caseInsights,
  comparablePairs,
  reviewedOn,
  type CaseId,
} from "../shared/analyst-watch";
const date = (value: string) =>
  new Date(`${value}T12:00:00Z`).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
export default function AnalystWatch() {
  const [caseId, setCaseId] = useState<CaseId>("weekend");
  const [author, setAuthor] = useState("all");
  const [forecastsOnly, setForecastsOnly] = useState(false);
  const active = cases.find((c) => c.id === caseId)!;
  const records = caseInsights(caseId, author, forecastsOnly);
  const allRecords = caseInsights(caseId);
  const pairCount = comparablePairs(allRecords).length;
  function selectCase(id: CaseId) {
    setCaseId(id);
    setAuthor("all");
    setForecastsOnly(false);
  }
  return (
    <section
      className="analyst-watch"
      id="analyst-watch"
      aria-labelledby="analyst-watch-title"
    >
      <div className="watch-heading">
        <div>
          <p className="eyebrow">PUBLIC SOURCES / SOUTHERN ONTARIO</p>
          <h2 id="analyst-watch-title">
            <Users size={23} /> Analyst watch
          </h2>
          <p>
            Five voices alongside WxOntario. Compare the place, timing, and
            evidence behind each claim.
          </p>
        </div>
        <a href="/comparison">Compare storm insights ↗</a>
        <span className="watch-snapshot">
          Reviewed {date(reviewedOn)}
          <small>Curated snapshot · no live feed</small>
        </span>
      </div>
      <p className="watch-scope">
        Regional context, not a forecast for the selected field. These
        public-source case studies are independent of the synthetic replay
        controls above.
      </p>
      <div
        className="watch-case-tabs"
        role="group"
        aria-label="Analyst case studies"
      >
        {cases.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={caseId === c.id}
            onClick={() => selectCase(c.id)}
          >
            <small>{c.date}</small>
            {c.title}
          </button>
        ))}
      </div>
      <div className="watch-comparison" aria-live="polite">
        <div className="watch-comparison-intro">
          <span className="pill muted">
            <GitCompareArrows size={13} />{" "}
            {pairCount ? "Comparable forecast pair" : "Evidence context"}
          </span>
          <h3>{active.question}</h3>
          <p>{active.relevance}</p>
          {caseId === "monkton" && (
            <a className="watch-map-link" href="/examples/monkton">
              <MapPin size={16} /> Open satellite image & polygon{" "}
              <ArrowUpRight size={15} />
            </a>
          )}
        </div>
        <div className="watch-comparison-notes">
          <div>
            <strong>{pairCount ? "Where they align" : "What we have"}</strong>
            <p>{active.agreement}</p>
          </div>
          <div>
            <strong>
              {pairCount ? "What differs" : "What stays separate"}
            </strong>
            <p>{active.difference}</p>
          </div>
          <small>
            AgArena’s manual comparison of all sources in this case. No accuracy
            score or combined probability.
          </small>
        </div>
      </div>
      <OfficialBaseline caseId={caseId} />
      <div className="watch-toolbar">
        <strong>
          {records.length} source {records.length === 1 ? "note" : "notes"}
        </strong>
        <label>
          Analyst{" "}
          <select
            aria-label="Filter analyst"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          >
            <option value="all">All analysts in this case</option>
            {analysts
              .filter((a) => allRecords.some((i) => i.analystId === a.id))
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </select>
        </label>
        <label className="watch-check">
          <input
            type="checkbox"
            checked={forecastsOnly}
            onChange={(e) => setForecastsOnly(e.target.checked)}
          />{" "}
          Forecasts only
        </label>
      </div>
      <div className="watch-insights" aria-live="polite">
        {records.map((i) => {
          const a = analysts.find((a) => a.id === i.analystId)!;
          return (
            <article className="watch-insight" key={i.id}>
              <div className="watch-author">
                <span className="watch-initials" aria-hidden="true">
                  {a.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div>
                  <h4>{a.name}</h4>
                  <a
                    href={`https://x.com/${a.handle}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    @{a.handle}
                  </a>
                </div>
                <span
                  className={`pill ${i.kind === "forecast" ? "muted" : "amber"}`}
                >
                  {i.kind === "analysis"
                    ? "Post-event analysis"
                    : i.kind === "observation"
                      ? "Observation"
                      : "Forecast"}
                </span>
              </div>
              <p className="watch-insight-summary">{i.summary}</p>
              <dl>
                <div>
                  <dt>Applies to</dt>
                  <dd>
                    {date(i.eventOn)} · {i.window}
                  </dd>
                </div>
                <div>
                  <dt>Coverage</dt>
                  <dd>{i.scope}</dd>
                </div>
                <div>
                  <dt>Published</dt>
                  <dd>{date(i.publishedOn)} · date precision</dd>
                </div>
              </dl>
              <p className="watch-caveat">{i.caveat}</p>
              <a
                className="watch-original"
                href={i.url}
                target="_blank"
                rel="noreferrer"
              >
                Read original source <ArrowUpRight size={14} />
              </a>
            </article>
          );
        })}
        {!records.length && (
          <p className="watch-empty">
            No forecasts match this selection. This case contains post-event
            evidence; turn off “Forecasts only” to see it.
          </p>
        )}
      </div>
      <details className="watch-shortlist">
        <summary>
          Meet the five additional analysts{" "}
          <span>Connections & selection rationale</span>
        </summary>
        <p className="watch-network-note">
          A provisional shortlist from WxOntario’s public conversation network.
          X required login to view following lists, so mutual follows are
          unverified. Three direct interactions were checked; two candidates
          have adjacent, indexed connections. This is a relevance shortlist, not
          a ranking of forecasting skill.
        </p>
        <div className="watch-analysts">
          {analysts
            .filter((a) => a.id !== "wxontario")
            .map((a) => (
              <article key={a.id}>
                <a
                  className="watch-profile"
                  href={`https://x.com/${a.handle}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <strong>{a.name}</strong>
                  <span>@{a.handle} ↗</span>
                </a>
                <p>{a.specialty}</p>
                <span className="pill muted">
                  {a.connectionEvidence === "direct"
                    ? "Direct public interaction"
                    : "Adjacent · indexed connection"}
                </span>
                <p className="watch-connection">{a.connection}</p>
                <a href={a.connectionUrl} target="_blank" rel="noreferrer">
                  Connection evidence ↗
                </a>
              </article>
            ))}
        </div>
      </details>
    </section>
  );
}
