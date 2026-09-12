import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import mapWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
// MapLibre resolves its worker relative to import.meta.url; let Vite bundle that entry explicitly.
maplibregl.setWorkerUrl(mapWorkerUrl);
import type { Field } from "../shared/contracts";
import "maplibre-gl/dist/maplibre-gl.css";
export default function FieldMap({
  fields,
  selected,
  onSelect,
}: {
  fields: Field[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const callback = useRef(onSelect);
  callback.current = onSelect;
  const [basemap, setBasemap] = useState<"satellite" | "streets">("satellite");
  const [tileError, setTileError] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!container.current) return;
    try {
      const m = new maplibregl.Map({
        container: container.current,
        style: {
          version: 8,
          sources: {
            satellite: {
              type: "raster",
              tiles: [
                "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              ],
              tileSize: 256,
              maxzoom: 19,
              attribution:
                'Imagery © <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics, and the GIS User Community',
            },
            streets: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              maxzoom: 19,
              attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },
          },
          layers: [
            { id: "satellite", type: "raster", source: "satellite" },
            {
              id: "streets",
              type: "raster",
              source: "streets",
              layout: { visibility: "none" },
            },
          ],
        },
        center: [-81.63, 43.29],
        zoom: 12,
        attributionControl: { compact: true },
      });
      map.current = m;
      m.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "bottom-right",
      );
      m.addControl(
        new maplibregl.ScaleControl({ unit: "metric" }),
        "bottom-left",
      );
      m.on("error", (event) => {
        if (
          "sourceId" in event &&
          (event.sourceId === "satellite" || event.sourceId === "streets")
        )
          setTileError(true);
      });
      m.on("load", () => {
        m.addSource("fields", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        m.addLayer({
          id: "field-fill",
          type: "fill",
          source: "fields",
          paint: {
            "fill-color": [
              "case",
              ["==", ["get", "selected"], true],
              "#e2ac4c",
              "#567366",
            ],
            "fill-opacity": 0.18,
          },
        });
        m.addLayer({
          id: "field-line",
          type: "line",
          source: "fields",
          paint: {
            "line-color": [
              "case",
              ["==", ["get", "selected"], true],
              "#ffd36b",
              "#b2f3d1",
            ],
            "line-width": 3,
          },
        });
        m.on("click", "field-fill", (e) => {
          const id = e.features?.[0]?.properties?.id;
          if (id) callback.current(String(id));
        });
        m.on("mouseenter", "field-fill", () => {
          m.getCanvas().style.cursor = "pointer";
        });
        m.on("mouseleave", "field-fill", () => {
          m.getCanvas().style.cursor = "";
        });
        setReady(true);
      });
      return () => {
        setReady(false);
        m.remove();
        map.current = null;
      };
    } catch {
      setError(true);
    }
  }, []);
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    (m.getSource("fields") as maplibregl.GeoJSONSource).setData({
      type: "FeatureCollection",
      features: fields.map((f) => ({
        type: "Feature",
        properties: { id: f.id, selected: f.id === selected },
        geometry: f.geometry,
      })),
    });
    const f = fields.find((f) => f.id === selected);
    if (f) {
      const bounds = new maplibregl.LngLatBounds();
      f.geometry.coordinates[0].forEach((p) => bounds.extend([p[0], p[1]]));
      m.fitBounds(bounds, { padding: 110, maxZoom: 13.2, duration: 700 });
    }
  }, [ready, fields, selected]);
  useEffect(() => {
    if (!ready || !map.current) return;
    setTileError(false);
    map.current.setLayoutProperty(
      "satellite",
      "visibility",
      basemap === "satellite" ? "visible" : "none",
    );
    map.current.setLayoutProperty(
      "streets",
      "visibility",
      basemap === "streets" ? "visible" : "none",
    );
  }, [ready, basemap]);
  return (
    <>
      <div
        className="map"
        ref={container}
        aria-label="Geographic map with demo field boundaries"
      />
      <div className="basemap-switch" role="group" aria-label="Map layer">
        <button
          type="button"
          aria-pressed={basemap === "satellite"}
          onClick={() => setBasemap("satellite")}
        >
          Satellite
        </button>
        <button
          type="button"
          aria-pressed={basemap === "streets"}
          onClick={() => setBasemap("streets")}
        >
          Streets
        </button>
      </div>
      {tileError && (
        <div className="map-tile-error" role="status">
          Map tiles unavailable. Try the other layer or check your connection.
        </div>
      )}
      {error && (
        <div className="map-error">
          Map unavailable. Use the field list to explore the same evidence.
        </div>
      )}
    </>
  );
}
