import type { Feature, Polygon } from "geojson";
export const analystExample = {
  id: "monkton-2026-09-02",
  place: "West of Monkton, Ontario",
  eventAt: "2026-09-02T21:06:00Z",
  reviewedOn: "2026-09-12",
  postUrl: "https://x.com/WxOntario1/status/2098570326980321314",
  imageUrl:
    "https://pbs.twimg.com/media/HR-elyyawAAZvju?format=webp&name=medium",
  surveyUrl:
    "https://www.uwo.ca/ntp/blog/2026/an_additional_tornado_and_downburst_in_sw_on_on_sep_2.html",
  surveyMapUrl: "https://www.uwo.ca/ntp/img/MonktonSurveyMap.png",
  points: [
    { name: "Track start", coordinates: [-81.2014, 43.6092] },
    { name: "Track end", coordinates: [-81.1412, 43.6111] },
    { name: "Worst damage", coordinates: [-81.1507, 43.6122] },
  ],
} as const;
// A rectangular area of interest, not a reconstructed damage path. This local
// equirectangular padding approximation is appropriate for this small Ontario extent.
export function locationEnvelope(): Feature<Polygon> {
  const points = analystExample.points.map((p) => p.coordinates);
  const latitude = points.reduce((sum, p) => sum + p[1], 0) / points.length;
  const dy = 500 / 111320,
    dx = 500 / (111320 * Math.cos((latitude * Math.PI) / 180));
  const west = Math.min(...points.map((p) => p[0])) - dx,
    east = Math.max(...points.map((p) => p[0])) + dx;
  const south = Math.min(...points.map((p) => p[1])) - dy,
    north = Math.max(...points.map((p) => p[1])) + dy;
  return {
    type: "Feature",
    properties: {
      id: analystExample.id,
      label: "Approximate location envelope",
      geometryRole: "area_of_interest",
      paddingMetres: 500,
      method:
        "bounds of three NTP survey coordinates plus approximate 500 m padding",
      notOfficialDamageBoundary: true,
      eventAt: analystExample.eventAt,
      source: analystExample.surveyUrl,
      analystPost: analystExample.postUrl,
    },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [west, south],
          [east, south],
          [east, north],
          [west, north],
          [west, south],
        ],
      ],
    },
  };
}
