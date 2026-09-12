import type { CaseId } from "./analyst-watch";
import { officialCapture } from "./official-capture";
export type OfficialBaseline = {
  agency: "Environment and Climate Change Canada";
  product: "forecast" | "warning" | "unavailable";
  provenance: "captured" | "indexed" | "missing";
  issued: string;
  coverage: string;
  message: string;
  analystView: string;
  comparison: string;
  limitation: string;
  sourceUrl: string;
};
const agency = "Environment and Climate Change Canada" as const;
const currentUrl =
  "https://weather.gc.ca/en/location/index.html?coords=43.655%2C-79.383";
export const officialBaselines: Record<CaseId, OfficialBaseline> = {
  weekend: {
    agency,
    product: "forecast",
    provenance: "captured",
    issued: "Sep 12, 2026 · 11:00 am EDT (15:00 UTC)",
    coverage: "Toronto city forecast · September 12 daytime and night",
    message:
      "High 26°C with mixed sun and cloud; humidex 31. Tonight: 40% chance of showers and a thunderstorm risk, with a low of 20°C.",
    analystView:
      "WxOntario: warm and mostly dry by day, isolated shower/storm risk. Gillham: low late-day shower risk increasing overnight.",
    comparison:
      "Broad agreement on warmth and the daytime/overnight distinction. ECCC supplies a city temperature and overnight precipitation probability; the analysts add regional context. A city probability cannot be treated as the percentage of fields that receive rain.",
    limitation:
      "ECCC’s 11 am update is later than the selected analyst posts. This compares messages for an overlapping window, not equal lead times or forecast accuracy. The 40% is an overnight value, not a daytime storm probability.",
    sourceUrl: officialCapture.sourceUrl,
  },
  sep9: {
    agency,
    product: "forecast",
    provenance: "indexed",
    issued: "Sep 8, 2026 · 5:00 am EDT (from indexed page)",
    coverage: "Toronto city forecast · September 9",
    message:
      "The indexed ECCC forecast calls for showers beginning in the morning, afternoon thunderstorm risk and a high of 27°C. Southwest wind 20 km/h, gusting to 40.",
    analystView:
      "Gillham expects periods of rain or thunderstorms. Instant Weather describes a conditional isolated severe-storm risk, mainly gusts and heavy rain, during 1–7 pm.",
    comparison:
      "Rain and thunderstorm language overlaps. Instant Weather adds a conditional severity assessment and narrower timing window. Routine forecast wind gusts are not a ceiling on thunderstorm gusts.",
    limitation:
      "Only an indexed copy of the historical official page was located; the original URL now updates. Revision history is unverified. This is a provisional comparison, not proof of additional warning lead time.",
    sourceUrl:
      "https://www.weather.gc.ca/en/location/index.html?coords=43.655%2C-79.383",
  },
  outbreak: {
    agency,
    product: "warning",
    provenance: "indexed",
    issued: "Sep 2, 2026 · 4:24 pm EDT (from indexed bulletin)",
    coverage:
      "Toronto, Newmarket–Georgina, Vaughan–Richmond Hill–Markham, and Guelph–Erin–Southern Wellington",
    message:
      "The indexed ECCC bulletin continued a yellow severe-thunderstorm warning for the listed areas. At 4:23 pm it described a line of storms from King City through Caledon to Orangeville.",
    analystView:
      "Instant Weather’s regional outlook described destructive wind, hail and possible tornadoes. The other selected posts document the event afterward.",
    comparison:
      "An operational warning and an earlier regional outlook serve different time windows. This bulletin covers part of the outbreak region; it cannot establish what warning covered Monkton or Tavistock.",
    limitation:
      "The original bulletin now reports no active warning. Its indexed historical content is retained here as limited evidence. Neither issue time for the analyst article nor a complete agency warning sequence is available, so no lead-time winner is shown.",
    sourceUrl:
      "https://ecalertme.weather.gc.ca/warning-latest_en.php?alert_code=STW&alert_id=92741&m_id=455209&ualert_id=19761",
  },
  monkton: {
    agency,
    product: "unavailable",
    provenance: "missing",
    issued: "Historical forecast/warning not captured",
    coverage: "Monkton · September 2, 2026",
    message:
      "A location- and time-matched ECCC forecast or warning has not been verified for this case.",
    analystView:
      "WxOntario and Justin M share post-event damage and satellite analysis. The NTP survey independently classifies the Monkton event as an EF1 tornado.",
    comparison:
      "The agency-versus-analyst forecast comparison remains open. NTP’s research survey provides an outcome reference; it is not an ECCC forecast or warning.",
    limitation:
      "Missing archived evidence does not mean that no warning was issued. The Toronto outbreak bulletin must not be assigned to the Monkton polygon.",
    sourceUrl: "https://weather.gc.ca/index_e.html?layers=alert",
  },
};
export function baselineStatus(b: OfficialBaseline) {
  if (b.provenance === "missing") return "Historical baseline missing";
  if (b.provenance === "indexed") return "Provisional · indexed history";
  return "Official forecast · captured snapshot";
}
