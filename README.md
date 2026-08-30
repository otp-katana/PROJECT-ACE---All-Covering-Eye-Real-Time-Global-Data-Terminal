# Project ACE

**A modular, real-time global event monitoring and visualization platform.**

Project ACE renders live natural and human-made events — earthquakes, volcanic activity, and (in the future) atmospheric, ecological, logistical, orbital, and cyber events — on an interactive 3D globe. It is built as a civilian, transparent alternative to closed intelligence-visualization systems: the same category of tool, aimed at public benefit rather than private or military advantage.

---

## Table of Contents

- [Philosophy](#philosophy)
- [Architecture](#architecture)
- [Modules](#modules)
- [Tech Stack](#tech-stack)
- [The Globe](#the-globe)
- [Scientific Models](#scientific-models)
- [Data Sources](#data-sources)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [Known Limitations & Roadmap](#known-limitations--roadmap)
- [Engineering Notes](#engineering-notes)
- [Contributing](#contributing)
- [License](#license)

---

## Philosophy

Project ACE takes inspiration from systems like Palantir Gotham and Palantir's Horus Eye — real-time, multi-source situational-awareness platforms. The difference is intent: those systems are closed, commercial, and frequently built for defense or intelligence clients. Project ACE is built in the open, for civilian and humanitarian use, starting with a domain that affects millions of people directly and cannot be prevented: earthquakes.

Two principles run through every design decision in this codebase:

**Scientific honesty.** Earthquake prediction is not scientifically possible. Project ACE never claims to predict earthquakes. Where statistical models are used (Omori's Law, Båth's Law — see below), they are framed as *statistical anomaly detection* and aftershock forecasting, not prophecy. Every forward-looking number the system will eventually surface is meant to carry that caveat visibly, not bury it in a tooltip.

**"No data" is not "inactive."** Where a data source doesn't report a value — an unknown volcanic eruption date, for example — the system treats that as *unknown*, not as *false*. A volcano with no recorded eruption year stays visible by default rather than being silently hidden, because hiding it would assert something the data doesn't support.

---

## Architecture

Project ACE is a **modular monolith**, not a microservice architecture. This was a deliberate choice:

- Each protocol (module) grows independently but ships together — there's no operational benefit yet to splitting deployment.
- Microservice infrastructure overhead (service discovery, inter-service auth, distributed tracing) is unjustified at this stage.
- A single, well-organized codebase is easier to test, debug, and reason about while the system — and the person building it — is still growing.
- The internal module boundaries (`protocols/<module>/`) are already drawn as if each *could* become a service later, without paying that cost now.

The frontend and backend are fully decoupled — communication happens exclusively over a JSON HTTP API. The 3D globe is not a decoration; it is the primary interface. Every module attaches to the globe as a *layer*, not as a separate page or view.

---

## Modules

Six (plus) modules are planned, each eventually strengthened by its own machine learning layer:

| Module | Domain | Status |
|---|---|---|
| **OMORI** | Seismic activity — earthquakes, volcanoes, fault lines | 🟢 Active, live data |
| **LOVELOCK** | Planetary population ecology dynamics | ⚪ Planned |
| **CURIE** | Man-made ecological disruption | ⚪ Planned |
| **DOPPLER** | Global logistics & infrastructure grid | ⚪ Planned |
| **LORENZ** | Global atmospheric dynamics | ⚪ Planned |
| **CLARKE** | Exospheric orbital telemetry | ⚪ Planned |
| **ARF** | Cascade analysis engine (cyber/systemic risk) | ⚪ Planned |

Only OMORI is wired to a real panel today. The rest render a "NOT YET DEPLOYED" placeholder in the UI — the sidebar and layout already account for all of them, so adding a module means building its panel and its globe layer, not restructuring the app.

---

## Tech Stack

### Frontend
```
Node.js         — runtime (build-time only, not needed in production)
Vite            — dev server & bundler
React           — UI library
three.js        — 3D scene, WebGL rendering
d3-geo          — geographic projection math
topojson-client — parses world-atlas topology into GeoJSON
world-atlas     — country boundary data (50m resolution)
```

### Backend
```
Python 3.12
FastAPI    — web framework
uvicorn    — ASGI server
httpx      — async HTTP client (external API calls)
pydantic   — request/response schema validation
```

No database is in use yet. Live data is fetched from external sources on each request/poll rather than persisted — see [Known Limitations](#known-limitations--roadmap).

---

## The Globe

The globe is the center of the application, not an ornament. Its behavior:

```
No module selected   → plain globe: continent outlines + orbital rings only
OMORI active          → seismic/volcanic points and fault lines overlay the surface
(future modules)      → their own data layers overlay the same globe
```

### Rendering layers (`useGlobe.js`)
1. **Solid inner sphere** — dark fill, gives the globe depth
2. **Wireframe sphere** — bright, semi-transparent outer shell
3. **Continents** — world-atlas boundaries, fetched async and drawn as `THREE.Line` geometry
4. **Orbital rings** — three independently-rotating torus rings with glow and node accents (toggleable from the navbar)
5. **Data layers** — per-module point/line groups (seismic, volcanic, faults), empty and hidden until their module is toggled on

### Interaction model
```
Left click + drag      → rotate the globe
Right click            → pause / resume auto-rotation
Scroll                 → zoom (clamped range)
Shift + left drag      → open a selection box (only while the globe is stationary)
Click a point          → freezes rotation, opens the detail panel
Click the same point   → closes the detail panel, resumes prior rotation state
```

### Multi-select & decluttering
Dragging a selection box (Shift + drag) captures every visible point inside it — correctly excluding points hidden on the far side of the globe (checked via a camera-relative dot product, not a full raycast, for performance) — and displays them in a small floating panel. Overlapping points are pushed apart by an iterative repulsion algorithm while preserving their relative screen layout, so a cluster of nearby earthquakes remains individually clickable instead of visually merging into one dot.

### Camera navigation & feedback
Clicking an entry in the live event log animates the globe to that point, adjusting the camera's zoom distance if it's currently too close or too far to keep the target on-screen. On arrival, the target point pulses (color and opacity shift, no geometry scaling — this keeps the effect readable even when many points are clustered) and the globe's wireframe, glow halo, and continent lines briefly brighten together in a staggered "breath" animation, giving the navigation a clear sense of arrival.

### Known technical pitfalls (documented so they aren't rediscovered)
- **Group vs. child position:** `Object3D.getWorldPosition()` on a `THREE.Group` returns the group's own origin, *not* the position of meshes placed inside it. Points are structured as `Group → [core mesh, halo meshes]`, so world-position queries (used for selection-box hit testing) must target `pointGroup.children[0]`, not `pointGroup` itself.
- **Euler vs. quaternion rotation:** Quaternion-based camera navigation is mathematically more robust (no pole singularities) but broke predictably when mixed with the existing Euler-angle manual drag-rotation — after an automated navigation, dragging would spin the globe unpredictably. The simpler, well-understood Euler approach was kept deliberately over the "more correct" one, because system stability outweighed marginal precision at the poles.
- **`depthWrite: false` on transparent layers:** Without it, semi-transparent point halos silently occlude the continent outlines and other geometry behind them.

---

## Scientific Models

### Omori's Law (1894) — aftershock decay
```
n(t) = K / (c + t)^p
```
Predicts the rate of aftershocks over time following a mainshock. `K` derives from the mainshock's magnitude; `c` and `p` are empirical constants. Implemented via numerical integration in `utils.js` (`omoriPredict`, 200-step trapezoidal integration).

### Båth's Law (1965) — expected maximum aftershock
```
M_max_aftershock ≈ M_mainshock − 1.2
```

### Gutenberg–Richter relation — magnitude–frequency distribution
```
log10(N) = a − b·M     (b ≈ 1.0)
```

These formulas are implemented but **not yet connected to the live detail panel** — see roadmap. When they are, the output will always be labeled as statistical estimation, consistent with the project's scientific-honesty principle above.

---

## Data Sources

| Source | Provides | Access |
|---|---|---|
| **USGS** (`all_day.geojson` feed) | Global earthquakes, all magnitudes, refreshed ~every 60s | Public, no key required |
| **Smithsonian Global Volcanism Program** (live WFS/GeoServer) | ~1,200 Holocene-era volcanoes worldwide | Public, undocumented for third-party use — field mapping was reverse-engineered by inspecting a live response |
| **world-atlas** (npm package) | Country boundaries, 50m resolution | Bundled static data |

Fault line data is currently **mock** (a handful of major, well-known fault systems with approximate coordinates) — see [Known Limitations](#known-limitations--roadmap) for why real fault-line integration was deliberately deferred rather than approximated.

---

## Getting Started

### Prerequisites
- Node.js (recent LTS)
- Python 3.12+

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API docs available at `http://localhost:8000/docs`.

By default, CORS allows requests from `http://localhost:5173` (Vite's default port). To use a different frontend port, set the `FRONTEND_ORIGIN` environment variable before starting the server.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

Both servers must be running simultaneously for the app to show live data; if the backend is unreachable, the frontend falls back to an `OFFLINE` indicator rather than failing silently.

---

## Project Structure

```
frontend/
└── src/
    ├── globe/
    │   ├── useGlobe.js      — Three.js scene, all globe logic (custom hook)
    │   └── Globe.jsx        — mount point, selection-box UI, multi-select panel
    ├── layout/
    │   └── MainLayout.jsx   — navbar, sidebar, module panel, detail panel
    ├── modules/
    │   └── omori/
    │       ├── OmoriPanel.jsx   — active module panel (toggles, filters, live log)
    │       ├── constants.js     — Omori's Law constants
    │       └── utils.js         — alert color/label helpers, Omori's Law math
    ├── App.jsx
    ├── main.jsx
    └── index.css

backend/
└── app/
    ├── main.py                     — FastAPI app, CORS, router mounting
    └── protocols/
        └── omori/
            ├── router.py           — HTTP endpoints
            ├── service.py          — orchestration layer (source selection/merging)
            ├── schemas.py          — shared Pydantic response model
            └── providers/
                ├── usgs.py         — earthquake data provider
                └── gvp.py          — volcano data provider
```

The backend's `protocols/` directory is scaffolded for all planned modules (each with its own `providers/`, `repositories/`, `ml/`, `tests/` subfolders), even though only OMORI is implemented — this structure exists so future modules follow an established pattern rather than inventing a new one each time.

---

## Design System

```css
--bg-root:     #08080f
--bg-panel:    rgba(13, 12, 26, 0.85)
--accent:      #AAA5B9   /* primary accent — neutral lavender */
--accent-bar:  #BEAED5   /* bars, toggles, orbital rings */
--detail:      #E8D5EF   /* fine details, nodes, continent lines */
--text:        #FFFFFF
--text-muted:  #E8D5EF
```

Fault lines use a deliberately distinct amber tone (`#E8A853`) rather than a shade within the core lavender palette, so they remain visually distinguishable from seismic/volcanic point layers when multiple layers are active simultaneously.

Panels use a consistent frosted-glass treatment (`backdrop-filter: blur`, semi-transparent lavender background) so the globe remains partially visible behind every UI surface — reinforcing that the globe, not the panels, is the primary view.

---

## Known Limitations & Roadmap

Documented honestly rather than hidden, in the same spirit as the project's scientific-integrity principle:

- **Render performance at scale.** With ~1,200 volcano points and a full day of earthquakes rendered as individual meshes, mid-range GPUs show minor stutter when a layer first populates. `InstancedMesh` batching is the planned fix — not yet implemented.
- **Volcano count isn't meaningfully filterable.** Volcanoes with an unknown eruption year remain visible by design (see philosophy above), which means the eruption-year filter can't reduce the on-screen count as much as it visually appears to promise. This is an intentional tradeoff between data honesty and decluttering, still under consideration.
- **Fault lines are mock data.** Real fault-line datasets (e.g. GEM's Global Active Faults) exist, but integrating them with fabricated precision would contradict this project's commitment to not presenting invented data as real — so this was deliberately deferred rather than shipped as a "close enough" approximation. The current fault lines are clearly a small, illustrative set of major, well-known systems (North Anatolian, San Andreas, Himalayan Front, etc.), not a claim of completeness.
- **Single-source seismic data.** Only USGS is integrated; the architecture (`service.py`'s orchestration layer) is intentionally left as a thin pass-through so a second source (EMSC, AFAD, Kandilli) can be merged in later without restructuring the router or providers.
- **No persistence layer.** All data is fetched live on each request; nothing is stored. A time-series database (for historical analysis, and to eventually power the Omori's Law forecasting panel with real recent-event context) is planned but not started.
- **Omori/Båth calculations are implemented but unconnected.** The math exists in `utils.js` and is scientifically sound; it has not yet been wired into the live detail panel.
- **Menu icon and notification icon are currently unwired.** They're reserved for a planned sidebar redesign (a persistent, panel-independent summary area — the direct descendant of an early prototype's static "monitored faults" sidebar widget) and a future alerting feature, respectively.

---

## Engineering Notes

A few non-obvious lessons from building this, kept here so they aren't relearned the hard way:

- **A missing destructured prop can silently kill a render loop.** Several debugging sessions traced back to a function receiving a prop that was never destructured in its parameter list (`onPointClick`, `resetTrigger`, `isDragging` all caused this at different points) — this throws a `ReferenceError` inside a `requestAnimationFrame` loop, which can present as a blank black screen with no obvious console trace if the error occurs mid-frame.
- **Browser caching can produce false "online" states.** Without `cache: 'no-store'` on `fetch()` calls, a live/offline indicator could report a stale "success" even when the backend was down, because the browser silently served a cached response.
- **Shared material references enable cheap batch effects.** All continent outline segments share a single `LineBasicMaterial` instance — animating that one material's color/opacity affects every continent line simultaneously, at effectively no extra render cost.

---

## Contributing

Contributions are welcome — bug reports, small fixes, and well-scoped feature discussions are all useful, especially given how young this project is.

Before opening a pull request:
- **Open an issue first** for anything beyond a small fix, so the approach can be discussed before code is written. This is especially true for new modules or globe-interaction changes — the architecture notes above exist so new work fits the existing patterns rather than working around them.
- **Follow the existing code documentation style.** Files are organized into numbered `PART` sections (and `SUB` sections for larger blocks) with a short explanatory comment above each — see any file under `frontend/src/` for the pattern. New code should follow the same structure rather than introducing a different convention.
- **Keep scientific claims honest.** Any feature that presents a prediction, forecast, or risk estimate must be clearly labeled as statistical/model output, not fact — consistent with the [Philosophy](#philosophy) section above.
- **Test both servers together** before submitting — the frontend degrades to an `OFFLINE` state gracefully, but changes should be verified against a live backend, not just the UI in isolation.

See `CONTRIBUTING.md` for setup details and PR conventions.

---

## License

Project ACE's data — public earthquake and volcano data from USGS and the Smithsonian Institution — is freely available to anyone; this project's contribution is the visualization and integration layer built on top of it.

The intent behind releasing this project publicly is to demonstrate its engineering and invite scrutiny, learning, and collaboration — not to hand over unrestricted commercial or redistribution rights. License terms reflecting that intent are being finalized; check back here or the repository's `LICENSE` file for the current terms before reuse.

---

## Acknowledgments

- **USGS** — Earthquake Hazards Program, for open, real-time seismic data
- **Smithsonian Institution** — Global Volcanism Program, for open volcanic activity data
- **world-atlas / topojson** — for openly licensed geographic boundary data
