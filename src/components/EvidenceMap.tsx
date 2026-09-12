import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { GeoJSONSource } from 'maplibre-gl';
import type { Evidence, Place } from '../contracts';

type Props = { places: Place[]; evidence: Evidence[]; selectedPlace: Place | undefined; onSelectPlace: (id: string) => void };
export default function EvidenceMap({ evidence, selectedPlace, onSelectPlace }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    if (!container.current) return;
    let instance: maplibregl.Map;
    try {
      instance = new maplibregl.Map({
        container: container.current,
        center: [-81.2, 43.55], zoom: 7.6,
        style: { version: 8, sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors' } },
          layers: [{ id: 'base', type: 'raster', source: 'osm', paint: { 'raster-saturation': -0.85, 'raster-opacity': 0.75 } }] },
      });
      map.current = instance;
      instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
      instance.on('error', () => setUnavailable(true));
      instance.on('load', () => {
        instance.addSource('reference', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        instance.addLayer({ id: 'reference-fill', type: 'fill', source: 'reference', paint: { 'fill-color': '#41755d', 'fill-opacity': 0.09 } });
        instance.addLayer({ id: 'reference-outline', type: 'line', source: 'reference', paint: { 'line-color': '#41755d', 'line-width': 2, 'line-dasharray': [3, 2] } });
        setReady(true);
      });
    } catch { setUnavailable(true); }
    return () => { markers.current.forEach(m => m.remove()); map.current?.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    if (!ready || !map.current) return;
    const source = map.current.getSource('reference') as GeoJSONSource;
    if (selectedPlace) {
      const [w, s, e, n] = selectedPlace.bounds;
      source.setData({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[[w, s], [e, s], [e, n], [w, n], [w, s]]] } }] });
      map.current.fitBounds([[w, s], [e, n]], { padding: 70, duration: 700, maxZoom: selectedPlace.precision === 'town' ? 10 : 8.8 });
    }
  }, [ready, selectedPlace]);
  useEffect(() => {
    if (!ready || !map.current) return;
    markers.current.forEach(marker => marker.remove());
    const groups = new Map<string, { place: Place; count: number }>();
    evidence.forEach(item => {
      if (!item.location) return;
      const group = groups.get(item.location.id);
      groups.set(item.location.id, { place: item.location, count: (group?.count ?? 0) + 1 });
    });
    markers.current = [...groups.values()].map(({ place, count }) => {
      const element = document.createElement('button');
      element.className = 'map-pin' + (selectedPlace?.id === place.id ? ' selected' : '');
      element.type = 'button'; element.textContent = String(count);
      element.title = place.name + ': ' + count + ' source reports; approximate reference location';
      element.setAttribute('aria-label', element.title);
      element.addEventListener('click', () => onSelectPlace(place.id));
      return new maplibregl.Marker({ element }).setLngLat([place.lon, place.lat]).addTo(map.current!);
    });
  }, [ready, evidence, selectedPlace, onSelectPlace]);
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(() => map.current?.resize());
    observer.observe(container.current); return () => observer.disconnect();
  }, []);
  return <div className="map-frame">
    <div ref={container} className="map-canvas" role="region" aria-label="Ontario evidence reference map" />
    <div className="map-caption"><span className="reference-line" /> Approximate reference extent <span className="caption-break">· not a storm footprint</span></div>
    {unavailable && <div className="map-unavailable" role="status">Base map unavailable. Region and evidence details remain available below.</div>}
    <div className="map-key"><span className="map-dot" /> Named source locations <span className="map-key-note">Unknown locations stay off the map</span></div>
  </div>;
}
