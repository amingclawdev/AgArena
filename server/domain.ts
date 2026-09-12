import type { Brief, Evidence, Field, Scenario } from "../shared/contracts.js";
const polygon = (x: number, y: number): Field["geometry"] => ({
  type: "Polygon",
  coordinates: [
    [
      [x, y],
      [x + 0.012, y + 0.002],
      [x + 0.01, y + 0.012],
      [x - 0.002, y + 0.009],
      [x, y],
    ],
  ],
});
const fields: (Field & { tenant: string })[] = [
  {
    id: "north",
    name: "North field",
    crop: "Corn",
    area: 42,
    tenant: "alpha",
    geometry: polygon(-81.638, 43.293),
  },
  {
    id: "south",
    name: "South meadow",
    crop: "Soybeans",
    area: 28,
    tenant: "alpha",
    geometry: polygon(-81.619, 43.277),
  },
  {
    id: "birch",
    name: "Birch field",
    crop: "Winter wheat",
    area: 35,
    tenant: "beta",
    geometry: polygon(-81.66, 43.3),
  },
];
export function listFields(tenant: string): Field[] {
  return fields
    .filter((f) => f.tenant === tenant)
    .map(({ tenant: _, ...f }) => f);
}
const cycles: Evidence[] = [
  {
    id: "forecast-06",
    type: "forecast",
    source: "Synthetic regional forecast / cycle 06",
    support: "3 km model grid",
    initializedAt: "2026-09-12T06:00:00Z",
    issuedAt: "2026-09-12T09:00:00Z",
    availableAt: "2026-09-12T09:15:00Z",
    ingestedAt: "2026-09-12T09:20:00Z",
    validFrom: "2026-09-12T15:00:00Z",
    validUntil: "2026-09-13T15:00:00Z",
    quality: "fresh",
    rainMm: [0, 0, 0.3, 0.8, 1.1, 0.3, 0, 0],
    note: "Deterministic rainfall accumulation. These values are not probabilities and do not measure this field.",
  },
  {
    id: "forecast-12",
    type: "forecast",
    source: "Synthetic regional forecast / cycle 12",
    support: "3 km model grid",
    initializedAt: "2026-09-12T12:00:00Z",
    issuedAt: "2026-09-12T12:30:00Z",
    availableAt: "2026-09-12T14:00:00Z",
    ingestedAt: "2026-09-12T14:10:00Z",
    validFrom: "2026-09-12T15:00:00Z",
    validUntil: "2026-09-13T15:00:00Z",
    quality: "fresh",
    rainMm: [0.1, 0.4, 1.2, 2.8, 3.2, 1.4, 0.6, 0.1],
    note: "Delayed-publication fixture: initialized at 12:00 but not ingested until 14:10 UTC. Excluded from earlier replay.",
  },
];
const observation: Evidence = {
  id: "observation-north",
  type: "field_observation",
  source: "Synthetic grower report",
  support: "Field report · North field",
  issuedAt: "2026-09-10T10:00:00Z",
  availableAt: "2026-09-10T10:00:00Z",
  ingestedAt: "2026-09-10T10:05:00Z",
  validFrom: "2026-09-10T09:00:00Z",
  validUntil: "2026-09-10T10:00:00Z",
  quality: "stale",
  note: "Dry ground reported two days earlier. This unreviewed report cannot establish current field conditions.",
};
export function getBrief(
  tenant: string,
  id: string,
  asOf: string,
  scenario: Scenario,
): Brief | null {
  const field = listFields(tenant).find((f) => f.id === id);
  if (!field) return null;
  const cutoff = Date.parse(asOf);
  const available = (e: Evidence) =>
    Date.parse(e.availableAt) <= cutoff &&
    Date.parse(e.ingestedAt) <= cutoff &&
    Date.parse(e.issuedAt) <= cutoff;
  const candidate = cycles.filter(available).at(-1);
  const stale =
    !!candidate &&
    (cutoff - Date.parse(candidate.issuedAt) > 6 * 3600000 ||
      cutoff >= Date.parse(candidate.validUntil));
  const forecast =
    scenario === "normal" && candidate && !stale ? candidate : null;
  const obs = id === "north" && available(observation) ? observation : null;
  const evidence: Evidence[] = [
    ...(scenario === "normal" && candidate
      ? [
          {
            ...candidate,
            quality: stale ? ("stale" as const) : ("fresh" as const),
          },
        ]
      : []),
    ...(obs ? [obs] : []),
  ];
  const reason =
    scenario === "withdrawn"
      ? "The source has been withdrawn. Its forecast cannot support this outlook."
      : scenario === "stale" || stale
        ? "The forecast is too old for this decision. An updated source is needed."
        : "No forecast was available and ingested at this decision time.";
  return {
    field,
    asOf,
    status: forecast ? "outlook" : "unknown",
    localStatus: "unknown",
    forecast,
    observation: obs,
    evidence,
    headline: forecast
      ? "Rain may change your plans."
      : "An updated view is needed.",
    explanation: forecast
      ? "Review the modelled rainfall before planning a field visit. The regional outlook is context; recent conditions in this field have not been verified."
      : reason,
    missing: [
      obs
        ? "The last field report is stale."
        : "No recent field report is available.",
      "Add a recent observation before drawing local conclusions.",
    ],
    ruleVersion: "fixture-evidence-v1",
    synthetic: true,
  };
}
