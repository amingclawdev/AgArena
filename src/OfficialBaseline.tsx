import { ShieldCheck, ArrowUpRight } from "lucide-react";
import {
  officialBaselines,
  baselineStatus,
} from "../shared/official-baselines";
import { officialCapture } from "../shared/official-capture";
import { analystExample } from "../shared/analyst-example";
import type { CaseId } from "../shared/analyst-watch";
export default function OfficialBaseline({ caseId }: { caseId: CaseId }) {
  const baseline = officialBaselines[caseId];
  const download =
    "data:application/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(officialCapture, null, 2));
  return (
    <section
      className="official-baseline"
      aria-label="Official agency baseline"
    >
      <div className="official-heading">
        <div>
          <p className="eyebrow">STATUS QUO / OFFICIAL AGENCY</p>
          <h3>
            <ShieldCheck size={20} /> Environment Canada baseline
          </h3>
        </div>
        <span
          className={`pill ${baseline.provenance === "captured" ? "muted" : "amber"}`}
        >
          {baselineStatus(baseline)}
        </span>
      </div>
      <div className="official-columns">
        <div>
          <h4>Agency message</h4>
          <p>{baseline.message}</p>
          <dl>
            <dt>Issued</dt>
            <dd>{baseline.issued}</dd>
            <dt>Coverage</dt>
            <dd>{baseline.coverage}</dd>
          </dl>
        </div>
        <div>
          <h4>Analyst message</h4>
          <p>{baseline.analystView}</p>
          <h4 className="official-delta">What the comparison tells us</h4>
          <p>{baseline.comparison}</p>
        </div>
      </div>
      <p className="official-limitation">{baseline.limitation}</p>
      <div className="official-links">
        <a href={baseline.sourceUrl} target="_blank" rel="noreferrer">
          {baseline.provenance === "captured"
            ? "Official page (updates over time)"
            : baseline.provenance === "indexed"
              ? "Original URL (may show newer status)"
              : "Current ECCC alerts (not historical evidence)"}{" "}
          <ArrowUpRight size={13} />
        </a>
        {baseline.provenance === "captured" && (
          <a href={download} download="eccc-toronto-2026-09-12-snapshot.json">
            Download captured excerpt ↓
          </a>
        )}
        {caseId === "monkton" && (
          <a href={analystExample.surveyUrl} target="_blank" rel="noreferrer">
            NTP outcome reference ↗
          </a>
        )}
      </div>
      <details className="official-method">
        <summary>How we choose the official baseline</summary>
        <p>
          For these Ontario cases we use ECCC. The{" "}
          <a
            href="https://weather.metoffice.gov.uk/guides/warnings"
            target="_blank"
            rel="noreferrer"
          >
            Met Office warning service covers the UK
          </a>
          ; its UK warnings are not Ontario evidence. Future UK cases can use
          that baseline.
        </p>
        <p>
          Compare the same place, valid period, variable and issue-time cutoff.
          Keep warnings, forecasts and observed outcomes distinct. These
          reviewed snapshots do not update automatically or enter the synthetic
          field replay.
        </p>
        {baseline.provenance === "captured" && (
          <p>
            Retrieved{" "}
            {new Date(officialCapture.retrievedAt).toLocaleString("en-CA", {
              timeZone: "UTC",
            })}{" "}
            UTC. The download preserves the excerpt, issue time, source URL and
            source-document hash.
          </p>
        )}
      </details>
    </section>
  );
}
