import { useEffect, useRef, useState } from "react";
import OfficialBaseline from "./OfficialBaseline";
import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  analystExample as example,
  locationEnvelope,
} from "../shared/analyst-example";
import { ArrowUpRight, Leaf, MapPin, Layers } from "lucide-react";
maplibregl.setWorkerUrl(workerUrl);
export default function AnalystExample() {
  const target = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapError, setMapError] = useState("");
  const [imageError, setImageError] = useState(false);
  const polygon = locationEnvelope();
  function fit() {
    const m = map.current;
    if (!m) return;
    const bounds = new maplibregl.LngLatBounds();
    polygon.geometry.coordinates[0].forEach((p) => bounds.extend([p[0], p[1]]));
    m.fitBounds(bounds, { padding: 65, duration: 500 });
  }
  useEffect(() => {
    if (!target.current) return;
    let m: maplibregl.Map;
    try {
      m = new maplibregl.Map({
        container: target.current,
        center: [-81.1713, 43.6107],
        zoom: 12,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              maxzoom: 19,
              attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
            },
          },
          layers: [{ id: "base", type: "raster", source: "osm" }],
        },
      });
      map.current = m;
      m.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "bottom-right",
      );
      m.on("error", () =>
        setMapError(
          "Some map tiles could not load. The source links and survey coordinates remain available.",
        ),
      );
      m.on("load", () => {
        m.addSource("event-area", {
          type: "geojson",
          data: locationEnvelope(),
        });
        m.addLayer({
          id: "event-fill",
          type: "fill",
          source: "event-area",
          paint: { "fill-color": "#b3732f", "fill-opacity": 0.18 },
        });
        m.addLayer({
          id: "event-boundary",
          type: "line",
          source: "event-area",
          paint: {
            "line-color": "#935921",
            "line-width": 3,
            "line-dasharray": [3, 2],
          },
        });
        example.points.forEach((point, i) => {
          const el = document.createElement("button");
          el.className = "event-marker";
          el.textContent = String(i + 1);
          el.setAttribute("aria-label", point.name);
          new maplibregl.Marker({ element: el })
            .setLngLat([...point.coordinates])
            .setPopup(
              new maplibregl.Popup().setText(
                `${point.name}: ${point.coordinates[1]} N, ${Math.abs(point.coordinates[0])} W · NTP survey`,
              ),
            )
            .addTo(m);
        });
        fit();
      });
    } catch {
      setMapError(
        "Map unavailable. Use the coordinate list and NTP survey map below.",
      );
      return;
    }
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);
  const geojsonUrl =
    "data:application/geo+json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(polygon, null, 2));
  return (
    <>
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">
            <Leaf size={23} />
          </span>
          AgArena<span className="wordmark-dot">.</span>
        </a>
        <a href="/#analyst-watch">← Analyst watch</a>
        <span className="demo-label">Real event · historical example</span>
      </header>
      <main className="analyst-page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">
              ANALYST SIGNAL → NAMED PLACE → MAPPED EVIDENCE
            </p>
            <h1>From a weather post to a place.</h1>
            <p className="subtitle">
              One manually reviewed example from @WxOntario1. No live social
              feed.
            </p>
          </div>
        </div>
        <section className="event-summary">
          <span className="pill amber">September 2, 2026 · 17:06 EDT</span>
          <h2>
            <MapPin size={21} /> {example.place}
          </h2>
          <p>
            A satellite interpretation shared by WxOntario points to crop damage
            near Monkton. NTP’s separate survey confirms an EF1 tornado and
            supplies the location coordinates used here.
          </p>
        </section>
        <div className="analyst-grid">
          <section className="analyst-source">
            <p className="eyebrow">01 / SOURCE IMAGE</p>
            <h2>WxOntario’s shared satellite analysis</h2>
            <p className="source-byline">
              Posted by @WxOntario1 · attachment credits @JustinMWeather
            </p>
            <a href={example.postUrl} target="_blank" rel="noreferrer">
              {!imageError ? (
                <img
                  className="analyst-image"
                  src={example.imageUrl}
                  alt="Justin M's annotated satellite analysis west of Monkton, shared by WxOntario, showing crop markings and destroyed grain bins."
                  onError={() => setImageError(true)}
                />
              ) : (
                <p>
                  Image unavailable here. Open the original post to inspect it.
                </p>
              )}
            </a>
            <a
              className="source-link"
              href={example.postUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open original X post <ArrowUpRight size={15} />
            </a>
            <p className="source-note">
              The image is an analyst interpretation, not a georeferenced
              raster. We matched its named place and event to the NTP survey; we
              did not infer an exact footprint from its pixels.
            </p>
          </section>
          <section className="analyst-location">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">02 / RESOLVED LOCATION</p>
                <h2>Monkton area of interest</h2>
              </div>
              <button onClick={fit}>
                <Layers size={14} /> Fit polygon
              </button>
            </div>
            <div
              className="event-map"
              ref={target}
              aria-label="Monkton map with approximate location polygon"
            />
            {mapError && <p role="status">{mapError}</p>}
            <div className="event-legend">
              <span /> Dashed polygon: approximate location envelope
            </div>
            <p className="source-note">
              <strong>How it was drawn:</strong> bounds of NTP’s start, end, and
              worst-damage coordinates, padded by approximately 500 m on each
              side. This is not NTP’s damage boundary, a warning area, or a farm
              boundary.
            </p>
            <ol className="coordinate-list">
              {example.points.map((p) => (
                <li key={p.name}>
                  <strong>{p.name}</strong>
                  <span>
                    {p.coordinates[1]}° N, {Math.abs(p.coordinates[0])}° W
                  </span>
                </li>
              ))}
            </ol>
            <div className="event-links">
              <a href={example.surveyUrl} target="_blank" rel="noreferrer">
                NTP event report ↗
              </a>
              <a href={example.surveyMapUrl} target="_blank" rel="noreferrer">
                Official survey map ↗
              </a>
              <a href={geojsonUrl} download="monkton-area-of-interest.geojson">
                Download polygon ↓
              </a>
            </div>
          </section>
        </div>
        <OfficialBaseline caseId="monkton" />
        <div className="event-footer">
          <strong>Evidence chain</strong>
          <span>
            WxOntario post → Justin M satellite annotation → NTP Monkton survey
            → derived location polygon
          </span>
          <p>
            Historical case study, reviewed September 12, 2026. This does not
            show current weather or establish forecasting skill. No private demo
            fields are overlaid.
          </p>
        </div>
      </main>
    </>
  );
}
