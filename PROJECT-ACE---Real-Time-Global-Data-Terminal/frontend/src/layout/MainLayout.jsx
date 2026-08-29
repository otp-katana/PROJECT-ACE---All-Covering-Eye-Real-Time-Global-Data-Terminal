
// ───────────────────────────────────────────────────────────────────────────
// Contents: PROTOCOLS & LAYOUT CONSTANTS · ROOT COMPONENT — STATE & DATA
//           FETCHING (globe mount, navbar, left sidebar, module panel,
//           point detail panel) · DETAIL ROW HELPER
// ───────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import Globe from "../globe/Globe";
import OmoriPanel from "../modules/omori/OmoriPanel";

// ───────────────────────────────────────────────────────────────────────────
// ── PART: 1 ][ PROTOCOLS & LAYOUT CONSTANTS ────────────────────────────────
// ───────────────────────────────────────────────────────────────────────────
// Defines the six modules shown in the left sidebar. Only OMORI is currently...
// ...wired to a real panel — the rest render a "NOT YET DEPLOYED" placeholder...
// ...until their own modules are built.
const PROTOCOLS = [
  {
    id: "OMORI",
    label: "OMORI",
    sub: "INTERNAL & EXTERNAL PHYSICAL LAYER MODULE",
  },
  
  { id: "LOVELOCK",
    label: "LOVELOCK",
    sub: "PLANETARY POPULATION ECOLOGY DYNAMICS MODULE",
  },

  {
    id: "CURIE",
    label: "CURIE",
    sub: "MAN-MADE ECOLOGICAL DISRUPTION MODULE",
  },

  {
    id: "DOPPLER",
    label: "DOPPLER",
    sub: "GLOBAL LOGISTICS & INFRASTRUCTURE GRID",
  },
  
  {
    id: "LORENZ",
    label: "LORENZ",
    sub: "GLOBAL ATMOSPHERIC DYNAMICS MODULE",
  },
  
  {
    id: "CLARKE",
    label: "CLARKE",
    sub: "EXOSPHERIC ORBITAL TELEMETRY",
  },

  {
    id: "ARF",
    label: "ARF",
    sub: "CASCADE ANALYSIS ENGINE",
  },
];

const NAV_H = 64;
const SIDE_W = 280;
const PANEL_W = 320;

// ───────────────────────────────────────────────────────────────────────────
// ── PART: 2 ][ ROOT COMPONENT — STATE & DATA FETCHING ──────────────────────
// ───────────────────────────────────────────────────────────────────────────
// Owns all shared state for the dashboard (active module, toggles, filters,
// selection, camera focus requests) and centralizes the seismic data poll...
// ...(60s interval, USGS live feed) so both the globe and the OMORI panel...
// ...consume a single source of truth. See useGlobe.js for how these props...
// ...drive the 3D scene.
export default function MainLayout() {
  const [active, setActive] = useState(null);
  const [isLive, setIsLive] = useState(true);
  const [omoriToggles, setOmoriToggles] = useState({
    seismic: true,
    faults: false,
    volcanic: false,
  });
  const [ringsVisible, setRingsVisible] = useState(true);
  const [resetCounter, setResetCounter] = useState(0);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [focusRequest, setFocusRequest] = useState(null);
  const toggleOmori = (id) =>
    setOmoriToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  const [seismicEvents, setSeismicEvents] = useState([]);
  const [magnitudeFilter, setMagnitudeFilter] = useState(1.0);
  const [eruptionYearFilter, setEruptionYearFilter] = useState(-10000);

  useEffect(() => {
    let cancelled = false;

    const fetchEvents = () => {
      fetch("http://localhost:8000/api/omori/events", { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled) {
            setSeismicEvents(data);
            setIsLive(true);
          }
        })
        .catch((err) => {
          console.error("USGS fetch failed:", err);
          if (!cancelled) setIsLive(false);
        });
    };

    fetchEvents();
    const intervalId = setInterval(fetchEvents, 60000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#08080f",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 13,
        color: "#FFFFFF",
      }}
    >

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* ── SUB: GLOBE MOUNT ─────────────────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* Fullscreen background layer hosting the Three.js globe. All other... */}
      {/* ...UI floats above it via absolute positioning. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      >
        <Globe
          seismicLayers={omoriToggles}
          ringsVisible={ringsVisible}
          onPointClick={(data) => setSelectedPoint(data)}
          unfreezeSignal={selectedPoint === null}
          magnitudeFilter={magnitudeFilter}
          eruptionYearFilter={eruptionYearFilter}
          seismicEvents={seismicEvents}
          focusRequest={focusRequest}
          resetTrigger={resetCounter}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* ── SUB: NAVBAR ──────────────────────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* Top bar: menu icon (unwired — reserved for future sidebar controls),... */}
      {/* ...orbital ring toggle, reset view, notification icon (unwired), and... */}
      {/* ...the live/offline connection indicator. */}
      <nav
        style={{
          position: "absolute",
          top: 24,
          left: SIDE_W + 62,
          right: 24,
          height: NAV_H,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          background: "rgba(249, 232, 255, 0.55)",
          backdropFilter: "blur(24px)",
          border: "2px solid rgba(232, 213, 239, 0.45)",
          borderRadius: 16,
          margin: "0 8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            style={{
              background: "transparent",
              border: "none",
              color: "rgb(0, 0, 0)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: 4,
            }}
          >
            <span
              style={{
                display: "block",
                width: 20,
                height: 2,
                background: "currentColor",
                borderRadius: 2,
              }}
            />
            <span
              style={{
                display: "block",
                width: 20,
                height: 2,
                background: "currentColor",
                borderRadius: 2,
              }}
            />
            <span
              style={{
                display: "block",
                width: 20,
                height: 2,
                background: "currentColor",
                borderRadius: 2,
              }}
            />
          </button>
        </div>

        <button
          onClick={() => setRingsVisible((v) => !v)}
          title="Orbital Rings (On/Off)"
          style={{
            background: ringsVisible ? "rgba(190,174,213,0.3)" : "transparent",
            border: "1px solid rgba(190,174,213,0.5)",
            borderRadius: 4,
            color: "#000000",
            fontSize: 14,
            cursor: "pointer",
            padding: "4px 8px",
            display: "flex",
            alignItems: "center",
          }}
        >
          ⌬
        </button>

        <button
          onClick={() => setResetCounter((c) => c + 1)}
          title="Reset View (On/Off)"
          style={{
            background: "transparent",
            border: "1px solid rgba(190,174,213,0.5)",
            borderRadius: 4,
            color: "#000000",
            fontSize: 14,
            cursor: "pointer",
            padding: "4px 8px",
            display: "flex",
            alignItems: "center",
          }}
        >
          ↺
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.85)",
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: "3px 0",
            }}
          >
            <svg
              xmlns="http://w3.org"
              viewBox="0 0 24 24"
              width="38"
              height="20"
              fill="none"
              stroke="#000000"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 9,
              letterSpacing: "0.12em",
              color: "rgb(0, 0, 0)",
              border: "1px solid rgb(0, 0, 0)",
              borderRadius: 3,
              padding: "3px 8px",
              marginRight: 12,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: isLive ? "#ffffff" : "#000000",
                display: "inline-block",
              }}
            />
            {isLive ? "LIVE" : "OFFLINE"}
          </div>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* ── SUB: LEFT SIDEBAR — MODULE LIST ──────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* Renders PROTOCOLS as selectable buttons; clicking one opens the... */}
      {/* ...module panel below. */}
      <aside
        style={{
          position: "absolute",
          top: 24,
          bottom: 24,
          left: 24,
          width: SIDE_W + 24,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "16px 0",
          gap: 4,
          background: "rgba(249, 232, 255, 0.55)",
          backdropFilter: "blur(24px)",
          border: "2px solid rgba(232, 213, 239, 0.45)",
          borderRadius: 16,
          margin: 0,
        }}
      >
        <div
          style={{
            padding: "0 16px 16px",
            borderBottom: "1px solid rgba(232, 213, 239, 0.22)",
            marginBottom: 8,
            width: "100%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "#000000",
              marginBottom: 3,
            }}
          >
            PROJECT ACE
          </div>
          <div
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              marginTop: 8,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "rgba(0, 0, 0, 1)",
            }}
          >
            REAL-TIME GLOBAL DATA TERMINAL
          </div>
          <div
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              marginTop: 3,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "rgba(0, 0, 0, 1)",
            }}
          >
            【v1.2】
          </div>
        </div>
        {PROTOCOLS.map((p) => (
          <button
            key={p.id}
            title={p.label}
            onClick={() => setActive(active === p.id ? null : p.id)}
            style={{
              width: 250,
              height: 44,
              borderRadius: 8,
              border:
                active === p.id
                  ? "1px solid rgb(190, 174, 213)"
                  : "1px solid transparent",
              background:
                active === p.id ? "rgba(190, 174, 213, 0.3)" : "transparent",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              transition: "all 0.15s",
            }}
          >
            <span
              style={{
                fontSize: 20,
                letterSpacing: "0.03em",
                color: active === p.id ? "#000000" : "rgb(0, 0, 0)",
                fontWeight: 600,
              }}
            >
              {p.id.slice(0, 9)}
            </span>
          </button>
        ))}
      </aside>

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* ── SUB: MODULE PANEL ────────────────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* Opens when a protocol is selected. Renders OmoriPanel for OMORI;... */}
      {/* ...shows a placeholder for all other (not yet deployed) modules. */}
      {active && (
        <aside
          style={{
            position: "absolute",
            top: NAV_H + 38,
            left: SIDE_W + 62,
            width: SIDE_W + 240,
            bottom: 24,
            zIndex: 50,
            background: "rgba(249, 232, 255, 0.55)",
            backdropFilter: "blur(5px)",
            border: "2px solid rgba(232, 213, 239, 0.45)",
            borderRadius: 16,
            margin: "0 8px",
            overflowY: "visible",
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: "1px solid rgba(232, 213, 239, 0.22)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  color: "#000000",
                }}
              >
                {PROTOCOLS.find((p) => p.id === active)?.label}
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: "#0000008f",
                  marginTop: 5,
                }}
              >
                {PROTOCOLS.find((p) => p.id === active)?.sub.toUpperCase()}
              </div>
            </div>
            <button
              onClick={() => setActive(null)}
              style={{
                background: "transparent",
                border: "1px solid rgb(190, 174, 213)",
                borderRadius: 4,
                color: "rgba(255,255,255,0.35)",
                fontSize: 12,
                padding: "3px 7px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          {active === "OMORI" && (
            <OmoriPanel
              toggles={omoriToggles}
              onToggle={toggleOmori}
              magnitudeFilter={magnitudeFilter}
              onMagnitudeChange={setMagnitudeFilter}
              onEruptionYearChange={setEruptionYearFilter}
              seismicEvents={seismicEvents}
              onFocusRequest={(point) =>
                setFocusRequest({ ...point, _ts: Date.now() })
              }
            />
          )}

          {active !== "OMORI" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                marginTop: 60,
                color: "rgba(232,213,239,0.25)",
                fontSize: 10,
              }}
            >
              <span style={{ letterSpacing: "0.16em" }}>NOT YET DEPLOYED</span>
            </div>
          )}
        </aside>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* ── SUB: POINT DETAIL PANEL ──────────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* Fixed panel on the right, shown when a globe point (seismic or... */}
      {/* ...volcanic) is selected via click or the event log. Renders... */}
      {/* ...different fields depending on point type. */}
      {selectedPoint && (
        <aside
          style={{
            position: "absolute",
            top: NAV_H + 38,
            right: 24,
            width: SIDE_W + 240,
            bottom: 24,
            zIndex: 50,
            background: "rgba(249, 232, 255, 0.55)",
            backdropFilter: "blur(5px)",
            border: "2px solid rgba(232, 213, 239, 0.45)",
            borderRadius: 16,
            margin: "0 8px",
            overflowY: "visible",
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: "1px solid rgba(232, 213, 239, 0.22)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  color: "#000000",
                }}
              >
                {selectedPoint.type === "seismic"
                  ? "SEISMIC EVENT"
                  : "VOLCANIC ACTIVITY"}
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: "#0000008f",
                  marginTop: 5,
                }}
              >
                DETAIL
              </div>
            </div>
            <button
              onClick={() => setSelectedPoint(null)}
              style={{
                background: "transparent",
                border: "1px solid rgb(190, 174, 213)",
                borderRadius: 4,
                color: "rgba(255,255,255,0.35)",
                fontSize: 12,
                padding: "3px 7px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {selectedPoint.place && (
              <DetailRow label="LOCATION" value={selectedPoint.place} />
            )}
            <DetailRow label="LATITUDE" value={selectedPoint.lat.toFixed(2)} />
            <DetailRow label="LONGITUDE" value={selectedPoint.lon.toFixed(2)} />
            <DetailRow
              label="MAGNITUDE"
              value={`M${selectedPoint.mag.toFixed(1)}`}
            />

            {selectedPoint.type === "seismic" && (
              <>
                {selectedPoint.depth != null && (
                  <DetailRow
                    label="DEPTH"
                    value={`${selectedPoint.depth.toFixed(1)} km`}
                  />
                )}
                {selectedPoint.time && (
                  <DetailRow
                    label="TIME"
                    value={new Date(Number(selectedPoint.time)).toLocaleString(
                      "tr-TR",
                    )}
                  />
                )}
                {selectedPoint.felt != null && (
                  <DetailRow
                    label="FELT REPORTS"
                    value={String(selectedPoint.felt)}
                  />
                )}
                {selectedPoint.tsunami === 1 && (
                  <DetailRow label="TSUNAMI RISK" value="YES" />
                )}
              </>
            )}

            {selectedPoint.type === "volcanic" &&
              selectedPoint.lastEruption != null && (
                <DetailRow
                  label="LAST ERUPTION"
                  value={
                    selectedPoint.lastEruption <= 0
                      ? `${Math.abs(selectedPoint.lastEruption)} BC`
                      : `${selectedPoint.lastEruption} AD`
                  }
                />
              )}
          </div>
        </aside>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// ── PART: 3 ][ DETAIL ROW HELPER ───────────────────────────────────────────
// ───────────────────────────────────────────────────────────────────────────
// Small label/value row used throughout the point detail panel.
function DetailRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: "1px solid rgba(232, 213, 239, 0.15)",
      }}
    >
      <span
        style={{
          fontSize: 10,
          letterSpacing: "0.12em",
          color: "#0000008f",
          fontWeight: 700,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#000000" }}>
        {value}
      </span>
    </div>
  );
}
