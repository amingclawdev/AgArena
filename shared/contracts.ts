import { z } from "zod";
import type { Polygon } from "geojson";
export const scenarioSchema = z.enum([
  "normal",
  "missing",
  "stale",
  "withdrawn",
]);
export type Scenario = z.infer<typeof scenarioSchema>;
export const querySchema = z.object({
  asOf: z.iso.datetime().default("2026-09-12T15:00:00Z"),
  scenario: scenarioSchema.default("normal"),
});
export type Field = {
  id: string;
  name: string;
  crop: string;
  area: number;
  geometry: Polygon;
};
export type Evidence = {
  id: string;
  type: "forecast" | "field_observation";
  source: string;
  support: string;
  issuedAt: string;
  availableAt: string;
  ingestedAt: string;
  validFrom: string;
  validUntil: string;
  quality: "fresh" | "stale";
  note: string;
  initializedAt?: string;
  rainMm?: number[];
  temperatureK?: number[];
};
export type Brief = {
  field: Field;
  asOf: string;
  status: "outlook" | "unknown";
  localStatus: "unknown";
  forecast: Evidence | null;
  observation: Evidence | null;
  evidence: Evidence[];
  headline: string;
  explanation: string;
  missing: string[];
  ruleVersion: string;
  synthetic: true;
};
