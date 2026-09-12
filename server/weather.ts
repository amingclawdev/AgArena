import { z } from 'zod';
import type { Alert, Forecast, ForecastHour, Place } from '../src/contracts.ts';
import { Store } from './store.ts';

const nullable = z.number().finite().nullable();
const weatherResponse = z.object({
  latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180),
  hourly_units: z.object({ temperature_2m: z.literal('°C'), precipitation: z.literal('mm'), precipitation_probability: z.literal('%'), wind_speed_10m: z.literal('km/h'), time: z.literal('unixtime') }),
  hourly: z.object({ time: z.array(z.number().int().nonnegative().max(8640000000000)), temperature_2m: z.array(nullable), precipitation: z.array(nullable), precipitation_probability: z.array(nullable), wind_speed_10m: z.array(nullable), weather_code: z.array(nullable) }),
});
export function normalizeForecast(raw: unknown, place: Place, now = new Date()): Forecast {
  const data = weatherResponse.parse(raw);
  if (Math.abs(data.latitude - place.lat) > 1 || Math.abs(data.longitude - place.lon) > 1) throw new Error('Forecast coordinates do not match the requested region');
  const h = data.hourly;
  if (Object.values(h).some(a => a.length !== h.time.length) || h.time.length < 24) throw new Error('Incomplete hourly forecast');
  const hours: ForecastHour[] = h.time.map((t, i) => ({ time: new Date(t * 1000).toISOString(), temperature: h.temperature_2m[i], precipitation: h.precipitation[i], rainProbability: h.precipitation_probability[i], wind: h.wind_speed_10m[i], code: h.weather_code[i] }));
  if (hours.some(h => h.rainProbability !== null && (h.rainProbability < 0 || h.rainProbability > 100))) throw new Error('Invalid probability');
  if (hours.some(h => (h.precipitation !== null && h.precipitation < 0) || (h.wind !== null && h.wind < 0))) throw new Error('Invalid weather values');
  if (hours.some(h => h.temperature !== null && (h.temperature < -100 || h.temperature > 70))) throw new Error('Invalid temperature');
  const weatherCodes = new Set([0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99]);
  if (hours.some(h => h.code !== null && !weatherCodes.has(h.code))) throw new Error('Invalid weather code');
  if (h.time.some((t, i) => i > 0 && t - h.time[i - 1] !== 3600)) throw new Error('Nonconsecutive forecast hours');
  const hourStart = Math.floor(now.getTime() / 3600000) * 3600000;
  const future = hours.filter(h => Date.parse(h.time) >= hourStart);
  if (future.length < 24 || Date.parse(future[0].time) !== hourStart) throw new Error('Forecast does not cover the next 24 hours');
  const partial = future.slice(0, 24).some(h => Object.values(h).some(v => v === null));
  return { status: 'live', provider: 'Open-Meteo', sourceUrl: 'https://open-meteo.com/en/docs', fetchedAt: now.toISOString(), issuedAt: null, locationId: place.id, latitude: data.latitude, longitude: data.longitude, hours: future.slice(0, 48), note: 'Regional model guidance at a reference point. Model issue time is not supplied by this endpoint; retrieval time is shown. Rain chance is the provider probability of >0.1 mm in the preceding hour.' + (partial ? ' Some hourly inputs are missing; this is a partial outlook.' : '') };
}
const inflight = new WeakMap<Store, Map<string, Promise<Forecast>>>();
export async function getForecast(place: Place, store: Store, fetcher: typeof fetch = fetch, now = new Date()): Promise<Forecast> {
  const cached = store.forecast(place.id);
  const age = cached?.fetchedAt ? now.getTime() - Date.parse(cached.fetchedAt) : Infinity;
  const hourStart = Math.floor(now.getTime() / 3600000) * 3600000;
  const cachedHours = cached?.hours.filter(h => Date.parse(h.time) >= hourStart) ?? [];
  if (cached?.status === 'live' && age >= 0 && age < 15 * 60000 && cachedHours.length >= 24 && Date.parse(cachedHours[0].time) === hourStart) return { ...cached, hours: cachedHours, status: 'cached' };
  let requests = inflight.get(store);
  if (!requests) { requests = new Map(); inflight.set(store, requests); }
  if (requests.has(place.id)) return requests.get(place.id)!;
  const request = (async (): Promise<Forecast> => {
    await Promise.resolve(); // Register the request before even a synchronous provider failure.
    try {
      const params = new URLSearchParams({ latitude: String(place.lat), longitude: String(place.lon), hourly: 'temperature_2m,precipitation,precipitation_probability,wind_speed_10m,weather_code', forecast_hours: '49', timezone: 'UTC', timeformat: 'unixtime', wind_speed_unit: 'kmh' });
      const response = await fetcher(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error(`Provider HTTP ${response.status}`);
      const forecast = normalizeForecast(await response.json(), place, now); store.saveForecast(forecast); return forecast;
    } catch (error) {
      return { status: 'unavailable', provider: 'Open-Meteo', sourceUrl: 'https://open-meteo.com/en/docs', fetchedAt: cached?.fetchedAt ?? null, issuedAt: null, locationId: place.id, latitude: place.lat, longitude: place.lon, hours: [], error: error instanceof Error ? error.message : 'Provider unavailable', note: 'Current guidance is unavailable. No low-risk conclusion can be drawn from missing weather data.' };
    } finally { requests.delete(place.id); }
  })();
  requests.set(place.id, request); return request;
}
export function makeAlerts(f: Forecast, threshold = 60): Alert[] {
  const prefix = f.status === 'demo' ? 'demo-' : '';
  if (f.status === 'unavailable' || f.hours.length < 24) return [{ id: `unknown-${f.locationId}`, title: 'Weather guidance unavailable', detail: 'Check the provider before planning field work. Missing data does not mean low risk.', kind: 'unknown', source: f.sourceUrl, validAt: null, acknowledged: false }];
  const next = f.hours.slice(0, 24);
  const rain = next.find(h => h.rainProbability !== null && h.rainProbability >= threshold);
  const wind = next.find(h => h.wind !== null && h.wind >= 35);
  const missing = next.some(h => Object.values(h).some(v => v === null));
  const alerts: Alert[] = [];
  if (rain) alerts.push({ id: `${f.status === 'demo' ? 'demo-' : ''}rain-${f.locationId}-${rain.time}-${threshold}`, title: 'Rain may interrupt field plans', detail: `${rain.rainProbability}% provider rain chance for the hour ending at the time below meets your ${threshold}% watch threshold. Review the forecast before a field visit.`, kind: 'rain', source: f.sourceUrl, validAt: rain.time, acknowledged: false });
  if (wind) alerts.push({ id: `${prefix}wind-${f.locationId}-${wind.time}`, title: 'Wind deserves a closer look', detail: `Regional model wind reaches ${wind.wind} km/h, above the demo 35 km/h watch threshold. This is a planning prompt, not a field measurement.`, kind: 'wind', source: f.sourceUrl, validAt: wind.time, acknowledged: false });
  if (missing) alerts.push({ id: `${prefix}partial-${f.locationId}`, title: 'Some weather inputs are missing', detail: 'Hourly weather values are incomplete. The outlook cannot establish a clear window.', kind: 'unknown', source: f.sourceUrl, validAt: null, acknowledged: false });
  if (!alerts.length) alerts.push({ id: `${prefix}info-${f.locationId}-${next[0].time}`, title: 'No configured weather threshold crossed', detail: `The next 24 hourly values are below your ${threshold}% rain and demo 35 km/h wind thresholds. This does not assess all hazards or field conditions.`, kind: 'info', source: f.sourceUrl, validAt: next[0].time, acknowledged: false });
  return alerts;
}
export function demoForecast(place: Place): Forecast {
  const start = Date.parse('2026-09-12T18:00:00Z');
  return { status: 'demo', provider: 'Synthetic scenario', sourceUrl: 'https://github.com/amingclawdev/AgArena', fetchedAt: new Date(start).toISOString(), issuedAt: null, locationId: place.id, latitude: place.lat, longitude: place.lon, note: 'Invented values for a repeatable demonstration. These are not current weather or a forecast from a provider.', hours: Array.from({ length: 48 }, (_, i) => ({ time: new Date(start + i * 3600000).toISOString(), temperature: Math.round(20 + 5 * Math.sin(i / 4)), precipitation: i > 5 && i < 11 ? 1.8 : 0, rainProbability: i > 5 && i < 11 ? 76 : 12, wind: i > 4 && i < 8 ? 37 : 16, code: i > 5 && i < 11 ? 61 : 2 })) };
}
