// Fictional UI fixtures, unrelated to source posts or observed outcomes.
export const simulationIds = ["wxontario", "justin", "alex", "tom", "doug", "instant", "eccc"] as const;
const scorecards: Record<string, number[]> = {
  Overall: [86.4, 82.7, 75.2, 79.8, 84.1, 71.6, 77.3],
  Rainfall: [88.2, 79.4, 74.8, 81.6, 85.3, 73.1, 80.2],
  Temperature: [81.3, 78.5, 73.6, 76.4, 89.1, 70.8, 84.7],
  "Severe weather": [87.5, 85.2, 82.6, 90.1, 78.4, 84.3, 81.8],
  "Field conditions": [78.6, 75.4, 72.3, 74.8, 83.2, 69.5, 79.1],
};
export function simulatedScores(category: string) {
  const values = scorecards[category] ?? scorecards.Overall;
  const ordered = [...values].sort((a, b) => b - a);
  return Object.fromEntries(simulationIds.map((id, i) => [id, {
    score: values[i],
    rank: ordered.indexOf(values[i]) + 1,
    baseline: Number((values[i] - values[6]).toFixed(1)),
    calibration: [83, 79, 72, 81, 86, 74, 82][i],
    lead: [18, 24, 12, 16, 36, 9, 24][i],
    evaluated: [48, 36, 32, 44, 52, 40, 60][i],
  }]));
}
