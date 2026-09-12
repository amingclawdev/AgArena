import type { Place } from '../src/contracts.ts';
// Deliberately approximate reference extents: neither administrative boundaries nor event footprints.
export const places: Place[] = [
  { id: 'monkton', name: 'Monkton, Ontario', lat: 43.677, lon: -81.087, bounds: [-81.17, 43.61, -81.01, 43.74], precision: 'town', aliases: ['Monkton'] },
  { id: 'huron-perth', name: 'Huron–Perth, Ontario', lat: 43.55, lon: -81.2, bounds: [-81.85, 43.05, -80.75, 44.0], precision: 'region', aliases: ['Huron/Perth', 'Huron-Perth', 'Huron–Perth'] },
  { id: 'huron', name: 'Huron County, Ontario', lat: 43.65, lon: -81.5, bounds: [-81.85, 43.22, -81.05, 44.03], precision: 'region', aliases: ['Huron County'] },
  { id: 'perth', name: 'Perth County, Ontario', lat: 43.5, lon: -81.05, bounds: [-81.4, 43.18, -80.65, 43.84], precision: 'region', aliases: ['Perth County'] },
  { id: 'london', name: 'London, Ontario', lat: 42.9849, lon: -81.2453, bounds: [-81.4, 42.88, -81.1, 43.08], precision: 'town', aliases: ['London, Ontario', 'London Ontario', 'London ON'] },
  { id: 'chatham-kent', name: 'Chatham-Kent, Ontario', lat: 42.4, lon: -82.18, bounds: [-82.65, 42.0, -81.6, 42.75], precision: 'region', aliases: ['Chatham-Kent', 'Chatham Kent', 'Ridgetown'] },
  { id: 'southwest-ontario', name: 'Southwestern Ontario', lat: 42.95, lon: -81.35, bounds: [-83.0, 41.8, -80.25, 44.05], precision: 'region', aliases: ['Southwestern Ontario', 'SW Ontario', 'southwest Ontario'] },
  { id: 'southern-ontario', name: 'Southern Ontario', lat: 43.55, lon: -80.5, bounds: [-83.0, 41.8, -78.0, 44.6], precision: 'region', aliases: ['Southern Ontario', 'S Ontario'] },
];

export function resolvePlace(query: string | null, quote: string | null, text: string) {
  if (!query || !quote) return { location: null, locationReason: 'No explicit place evidence; kept off the map.' };
  const normalize = (s: string) => s.toLowerCase().replace(/#(?=[a-z])/g, '').replace(/\s+/g, ' ').trim();
  if (!quote.trim() || !text.includes(quote)) return { location: null, locationReason: 'Location quotation could not be found in the captured evidence.' };
  const containsPlace = (alias: string) => {
    const escaped = normalize(alias).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`).test(normalize(quote));
  };
  const location = places.find(p => [p.name, p.id, ...p.aliases].some(a => normalize(a) === normalize(query)) && [p.name, ...p.aliases].some(containsPlace));
  return { location: location ?? null, locationReason: location ? `Named ${location.precision}; map shows a reference area, not a confirmed event footprint.` : 'Place is ambiguous or outside the demo gazetteer; kept off the map.' };
}
