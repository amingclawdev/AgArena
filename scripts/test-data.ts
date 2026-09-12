import type { Capture } from '../src/contracts.ts';
import { places } from '../server/places.ts';

// Entirely invented test inputs; never presented as actual browser inspection or provider data.
export function testCapture(now = new Date('2026-09-12T18:00:00Z'), postId = '1000000000000000001'): Capture {
  return {
    schemaVersion: 1,
    source: { kind: 'x', url: `https://x.com/WxOntario1/status/${postId}`, account: 'WxOntario1', publishedAt: new Date(now.getTime() - 3600000).toISOString(), capturedAt: now.toISOString(), text: 'Invented test: rain near Monkton, Ontario.', media: [] },
    candidate: { title: 'Invented rain report', summary: 'Synthetic input used only in automated tests.', hazard: 'rain', severity: 'monitor', evidenceClass: 'report', placeQuery: 'Monkton', locationQuote: 'Monkton', observedAt: new Date(now.getTime() - 3600000).toISOString(), timeNote: 'Invented test timestamp.', imageFindings: [], limitations: ['Test fixture, not real evidence.'] },
    analysis: { method: 'computer-use-agent', version: 'synthetic-test-input' },
  };
}
export function testWeather(now = new Date('2026-09-12T18:00:00Z'), count = 49) {
  const start = Math.floor(now.getTime() / 3600000) * 3600;
  return {
    latitude: places[0].lat, longitude: places[0].lon,
    hourly_units: { time: 'unixtime', temperature_2m: '°C', precipitation: 'mm', precipitation_probability: '%', wind_speed_10m: 'km/h' },
    hourly: { time: Array.from({ length: count }, (_, i) => start + i * 3600), temperature_2m: Array<number | null>(count).fill(20), precipitation: Array<number | null>(count).fill(0), precipitation_probability: Array<number | null>(count).fill(10), wind_speed_10m: Array<number | null>(count).fill(12), weather_code: Array<number | null>(count).fill(1) },
  };
}
