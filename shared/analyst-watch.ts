/** Manually reviewed public-source snapshot. No live ingestion or skill ratings. */
export type Analyst = {
  id: string;
  name: string;
  handle: string;
  specialty: string;
  connection: string;
  connectionUrl: string;
  connectionEvidence: "direct" | "indexed" | "adjacent";
  mutualFollow: "unverified";
};
export const reviewedOn = "2026-09-12";
export const analysts: Analyst[] = [
  {
    id: "wxontario",
    name: "WxOntario",
    handle: "WxOntario1",
    specialty: "Southern Ontario weather and agricultural context",
    connection: "Starting account selected by you.",
    connectionUrl: "https://x.com/WxOntario1",
    connectionEvidence: "direct",
    mutualFollow: "unverified",
  },
  {
    id: "justin",
    name: "Justin M",
    handle: "JustinMWeather",
    specialty: "Satellite interpretation and local damage observations",
    connection:
      "Quotes WxOntario’s Monkton report; WxOntario credits their collaboration.",
    connectionUrl: "https://x.com/JustinMWeather/status/2098068876953080204",
    connectionEvidence: "direct",
    mutualFollow: "unverified",
  },
  {
    id: "alex",
    name: "Alex Todd",
    handle: "wkdwxON",
    specialty: "Storm-chase video with named locations and times",
    connection:
      "Quotes WxOntario’s Tavistock update alongside his own timelapse.",
    connectionUrl: "https://x.com/wkdwxON/status/2096625571639808379",
    connectionEvidence: "direct",
    mutualFollow: "unverified",
  },
  {
    id: "tom",
    name: "Tom Stef",
    handle: "vaughanweather",
    specialty: "Storm imagery and damage-pattern interpretation",
    connection:
      "Replies directly in WxOntario’s Monkton grain-bin thread; the original reply was checked.",
    connectionUrl: "https://x.com/vaughanweather/status/2097375211582546408",
    connectionEvidence: "direct",
    mutualFollow: "unverified",
  },
  {
    id: "doug",
    name: "Doug Gillham",
    handle: "gtaweather1",
    specialty: "GTA forecasts with explicit daytime and overnight timing",
    connection:
      "Adjacent candidate: tagged with WxOntario in an indexed Tom Stef storm thread. A direct relationship is not established.",
    connectionUrl: "https://www.sotwe.com/vaughanweather",
    connectionEvidence: "adjacent",
    mutualFollow: "unverified",
  },
  {
    id: "instant",
    name: "Instant Weather Ontario",
    handle: "IWeatherON",
    specialty: "Regional hazard forecasts; selected forecasts by Brennen Perry",
    connection:
      "Adjacent candidate: Alex Todd’s indexed feed shares both Instant Weather and WxOntario’s Tavistock coverage.",
    connectionUrl: "https://www.sotwe.com/wkdwxon",
    connectionEvidence: "adjacent",
    mutualFollow: "unverified",
  },
];
export type CaseId = "weekend" | "sep9" | "outbreak" | "monkton";
export type Insight = {
  id: string;
  analystId: string;
  caseId: CaseId;
  kind: "forecast" | "observation" | "analysis";
  publishedOn: string;
  eventOn: string;
  window: string;
  scope: string;
  /** Manually checked overlap; absence means no forecast-comparison eligibility. */
  comparisonKey?: string;
  summary: string;
  caveat: string;
  url: string;
  sourceFamily: string;
};
export const insights: Insight[] = [
  {
    id: "wx-saturday",
    analystId: "wxontario",
    caseId: "weekend",
    kind: "forecast",
    publishedOn: "2026-09-12",
    eventOn: "2026-09-12",
    window: "Saturday daytime",
    scope: "Southern Ontario; includes the GTA",
    comparisonKey: "gta-sep12-day",
    summary:
      "Warm afternoon, with temperatures in the mid-to-upper 20s. An isolated shower or storm is possible, but most places are expected to stay dry.",
    caveat:
      "Broad regional forecast; does not specify rainfall at a field or cover Saturday night.",
    url: "https://x.com/WxOntario1/status/2098752722715451504",
    sourceFamily: "wx-sep12",
  },
  {
    id: "doug-saturday",
    analystId: "doug",
    caseId: "weekend",
    kind: "forecast",
    publishedOn: "2026-09-11",
    eventOn: "2026-09-12",
    window: "Saturday daytime, then overnight",
    scope: "GTA",
    comparisonKey: "gta-sep12-day",
    summary:
      "A warmer, breezy Saturday with mixed sun and cloud; a low shower risk late in the day increases overnight.",
    caveat:
      "The overnight shower risk extends beyond WxOntario’s daytime forecast; that is not a direct disagreement.",
    url: "https://x.com/gtaweather1/status/2098368911875957104",
    sourceFamily: "doug-sep11",
  },
  {
    id: "doug-sep9",
    analystId: "doug",
    caseId: "sep9",
    kind: "forecast",
    publishedOn: "2026-09-08",
    eventOn: "2026-09-09",
    window: "Wednesday; timing not quantified",
    scope: "GTA, especially near and south of Highway 401",
    comparisonKey: "gta-sep9-rain",
    summary:
      "Warm, very humid Wednesday with sunny breaks and a couple of periods of rain or thunderstorms.",
    caveat: "No severity rating or field-level rainfall total is supplied.",
    url: "https://x.com/gtaweather1/status/2097292063209410798",
    sourceFamily: "doug-sep8",
  },
  {
    id: "instant-sep9",
    analystId: "instant",
    caseId: "sep9",
    kind: "forecast",
    publishedOn: "2026-09-08",
    eventOn: "2026-09-09",
    window: "Wednesday, 1–7 pm local",
    scope: "Southwestern Ontario and Golden Horseshoe, including GTA",
    comparisonKey: "gta-sep9-rain",
    summary:
      "Brennen Perry describes a conditional, isolated severe-storm risk, mainly damaging gusts and heavy rain. Limited clearing after morning rain could constrain development.",
    caveat:
      "More clearing could increase the risk. This conditional severity detail cannot be inferred from Gillham’s general rain forecast.",
    url: "https://x.com/IWeatherON/status/2097467276618350806",
    sourceFamily: "instant-sep8",
  },
  {
    id: "instant-outbreak",
    analystId: "instant",
    caseId: "outbreak",
    kind: "forecast",
    publishedOn: "2026-09-02",
    eventOn: "2026-09-02",
    window: "Wednesday afternoon and evening",
    scope: "Lake Huron → London/Kitchener → GTA",
    summary:
      "Brennen Perry identifies a significant severe-weather risk with destructive wind, large hail and possible tornadoes. Storm-development timing and whether cells remain isolated are central uncertainties.",
    caveat:
      "Article date is verified; publication time and edit history are not. No precise lead time or forecast score is claimed.",
    url: "https://instantweatherinc.com/article/ontario/2026/9/2/thunderstorm",
    sourceFamily: "instant-sep2",
  },
  {
    id: "tom-outbreak",
    analystId: "tom",
    caseId: "outbreak",
    kind: "observation",
    publishedOn: "2026-09-03",
    eventOn: "2026-09-02",
    window: "Previous day’s storm chase",
    scope: "Southwestern Ontario; exact location not stated",
    summary:
      "Shares video stills from the previous day’s Southwestern Ontario storm chase.",
    caveat:
      "Useful visual context, but not a forecast or a geolocated damage measurement.",
    url: "https://x.com/vaughanweather/status/2095549619484721601",
    sourceFamily: "tom-chase-sep2",
  },
  {
    id: "alex-outbreak",
    analystId: "alex",
    caseId: "outbreak",
    kind: "observation",
    publishedOn: "2026-09-03",
    eventOn: "2026-09-02",
    window: "Approximately 5:20–5:25 pm local",
    scope: "Looking north at Tavistock from Mapleview Side Road and Oxford 59",
    summary:
      "Provides storm video with a viewing direction, road intersection and approximate time, and requests a radar comparison.",
    caveat:
      "The observer’s location is not a tornado path. Posted after the event and excluded from prediction comparisons.",
    url: "https://x.com/wkdwxON/status/2095523725508510011",
    sourceFamily: "alex-tavistock-video",
  },
  {
    id: "justin-monkton",
    analystId: "justin",
    caseId: "monkton",
    kind: "analysis",
    publishedOn: "2026-09-10",
    eventOn: "2026-09-02",
    window: "Post-event satellite review",
    scope: "West of Monkton",
    summary:
      "Interprets satellite crop and damage patterns as a possible tornado track, with a suspected nearby downburst, while quoting WxOntario’s earlier report.",
    caveat:
      "Analyst interpretation. The nearby downburst hypothesis is not established by the Monkton tornado survey used in this app.",
    url: "https://x.com/JustinMWeather/status/2098068876953080204",
    sourceFamily: "monkton-shared-evidence",
  },
  {
    id: "wx-monkton",
    analystId: "wxontario",
    caseId: "monkton",
    kind: "analysis",
    publishedOn: "2026-09-11",
    eventOn: "2026-09-02",
    window: "Post-event collaboration and survey follow-up",
    scope: "West of Monkton",
    summary:
      "Credits Noah Terpstra and Justin M for the evidence chain that helped document the Monkton event, subsequently confirmed by NTP.",
    caveat:
      "Shares underlying material with Justin’s analysis. Two posts do not constitute two independent confirmations or advance predictions.",
    url: "https://x.com/WxOntario1/status/2098570326980321314",
    sourceFamily: "monkton-shared-evidence",
  },
];
export const cases: {
  id: CaseId;
  title: string;
  date: string;
  question: string;
  agreement: string;
  difference: string;
  relevance: string;
}[] = [
  {
    id: "weekend",
    title: "Weekend outlook",
    date: "Sep 12",
    question: "Mostly dry Saturday in the GTA?",
    agreement:
      "Both forecasts allow a largely dry, warm daytime period with a limited shower risk.",
    difference:
      "Gillham extends into Saturday night and raises the shower chance then. WxOntario covers a wider region and the daytime period. Compare their GTA daytime overlap only.",
    relevance:
      "Regional context for outdoor work. Neither source establishes soil trafficability or conditions on the selected demo field.",
  },
  {
    id: "sep9",
    title: "Showers & storms",
    date: "Sep 9",
    question: "Rain and thunderstorms across the GTA?",
    agreement:
      "Both forecasts anticipate rain or thunderstorms on September 9 in overlapping GTA coverage.",
    difference:
      "Instant Weather adds a conditional severity forecast and a 1–7 pm window; Gillham gives a broader daily outlook. Agreement on rain does not imply agreement on storm severity.",
    relevance:
      "Historical comparison of timing and hazard language; no measured rainfall or outcome score has been attached.",
  },
  {
    id: "outbreak",
    title: "Storm outbreak",
    date: "Sep 2",
    question: "What was forecast, and what was documented later?",
    agreement:
      "One reviewed advance-looking forecast plus two later visual reports. There is no pair of comparable forecasts in this case yet.",
    difference:
      "The Tavistock video and Southwestern Ontario stills are observations published after the event. They must not increase a forecast consensus count.",
    relevance:
      "Wind and hail were relevant to crops and farm structures. These regional posts do not establish damage to any demo field.",
  },
  {
    id: "monkton",
    title: "Monkton evidence",
    date: "Sep 2",
    question: "How does a shared satellite interpretation resolve to a place?",
    agreement:
      "Justin M and WxOntario describe the same evidence chain. This is shared post-event analysis, not forecast agreement.",
    difference:
      "NTP survey coordinates support the mapped tornado location. They do not validate every nearby damage interpretation in the shared image.",
    relevance:
      "The existing map shows a derived area of interest around published survey points, not an official damage footprint.",
  },
];
export function caseInsights(
  caseId: CaseId,
  analystId = "all",
  forecastsOnly = false,
): Insight[] {
  return insights.filter(
    (i) =>
      i.caseId === caseId &&
      (analystId === "all" || i.analystId === analystId) &&
      (!forecastsOnly || i.kind === "forecast"),
  );
}
/** Only forecasts with a reviewed spatial/time overlap may be paired; never use post-event evidence. */
export function comparablePairs(records: Insight[]): [Insight, Insight][] {
  const pairs: [Insight, Insight][] = [];
  for (let a = 0; a < records.length; a++)
    for (let b = a + 1; b < records.length; b++) {
      const x = records[a],
        y = records[b];
      if (
        x.kind === "forecast" &&
        y.kind === "forecast" &&
        x.analystId !== y.analystId &&
        x.sourceFamily !== y.sourceFamily &&
        x.caseId === y.caseId &&
        x.eventOn === y.eventOn &&
        x.comparisonKey &&
        x.comparisonKey === y.comparisonKey
      )
        pairs.push([x, y]);
    }
  return pairs;
}
