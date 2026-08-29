// ───────────────────────────────────────────────────────────────────────────
// Contents: GLOBE COMPONENT · OVERLAP RESOLUTION · SELECTION PANEL
// ───────────────────────────────────────────────────────────────────────────
import { useRef, useEffect, useState } from "react";
import { useGlobe } from "./useGlobe";

// ───────────────────────────────────────────────────────────────────────────
// ── PART: 1 ][ GLOBE COMPONENT ─────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────────────────
// Mounts the Three.js scene (via useGlobe) into a full-height div and renders...
// ...two overlay layers on top of it: the shift+drag selection box, and — when...
// ...a selection contains points — the SelectionPanel showing them declutered.
// unfreezeSignal and resetTrigger are one-way triggers from the parent...
// ...(MainLayout) that call back into useGlobe's imperative controls.
export default function Globe({
  seismicLayers,
  ringsVisible,
  onPointClick,
  unfreezeSignal,
  magnitudeFilter,
  eruptionYearFilter,
  seismicEvents,
  focusRequest,
  resetTrigger,
}) {
  const mountRef = useRef(null);
  const [selectionBox, setSelectionBox] = useState(null);
  const { unfreeze, resetView } = useGlobe(
    mountRef,
    seismicLayers,
    ringsVisible,
    onPointClick,
    magnitudeFilter,
    eruptionYearFilter,
    seismicEvents,
    setSelectionBox,
    focusRequest,
  );

  useEffect(() => {
    if (unfreezeSignal) unfreeze();
  }, [unfreezeSignal]);

  useEffect(() => {
    if (resetTrigger) resetView();
  }, [resetTrigger]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: "100vh",
          position: "relative",
          cursor: "grab",
        }}
      />
      {selectionBox && (
        <div
          style={{
            position: "absolute",
            left: Math.min(selectionBox.x1, selectionBox.x2),
            top: Math.min(selectionBox.y1, selectionBox.y2),
            width: Math.abs(selectionBox.x2 - selectionBox.x1),
            height: Math.abs(selectionBox.y2 - selectionBox.y1),
            border: "1px solid rgba(190,174,213,0.9)",
            background: "rgba(190,174,213,0.15)",
            pointerEvents: "none",
            zIndex: 20,
          }}
        />
      )}

      {selectionBox?.points?.length > 0 && (
        <SelectionPanel box={selectionBox} onPointClick={onPointClick} />
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// ── PART: 2 ][ OVERLAP RESOLUTION ──────────────────────────────────────────
// ───────────────────────────────────────────────────────────────────────────
// Iterative repulsion algorithm: pushes apart any two points closer than...
// ...their combined radius, repeating until stable (or iteration cap). Used by...
// ...SelectionPanel to keep overlapping globe points readable while preserving...
// ...their relative screen layout.
function resolveOverlapsVariable(positions, iterations = 30) {
  const pts = positions.map((p) => ({ ...p }));

  for (let iter = 0; iter < iterations; iter++) {
    let moved = false;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[j].x - pts[i].x;
        const dy = pts[j].y - pts[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        const requiredDist = (pts[i].size + pts[j].size) / 2 + 4;

        if (dist < requiredDist) {
          moved = true;
          const overlap = (requiredDist - dist) / 2;
          const ux = dx / dist;
          const uy = dy / dist;
          pts[i].x -= ux * overlap;
          pts[i].y -= uy * overlap;
          pts[j].x += ux * overlap;
          pts[j].y += uy * overlap;
        }
      }
    }
    if (!moved) break;
  }

  return pts;
}

function clampToViewport(left, top, width, height, margin = 10) {
  let x = left;
  let y = top;

  if (x + width > window.innerWidth) x = left - width - margin * 2;
  if (y + height > window.innerHeight) y = window.innerHeight - height - margin;
  if (y < margin) y = margin;
  if (x < margin) x = margin;

  return { x, y };
}

// ───────────────────────────────────────────────────────────────────────────
// ── PART: 3 ][ SELECTION PANEL ─────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────────────────
// Small floating panel shown after a shift+drag box selection. Projects the...
// ...selected points' screen positions into panel-local space, declutters them...
// ...via resolveOverlapsVariable, and clamps the panel itself to stay within...
// ...the viewport (flips left/up if it would overflow the right/bottom edge).
// Point size scales with magnitude; shape distinguishes seismic (circle)...
// ...from volcanic (rounded square).
function SelectionPanel({ box, onPointClick }) {
  const panelW = 160;
  const panelH = 160;
  const margin = 10;

  const minX = Math.min(box.x1, box.x2),
    maxX = Math.max(box.x1, box.x2);
  const minY = Math.min(box.y1, box.y2),
    maxY = Math.max(box.y1, box.y2);
  const boxW = Math.max(maxX - minX, 1);
  const boxH = Math.max(maxY - minY, 1);

  const { x: panelLeft, y: panelTop } = clampToViewport(
    maxX + margin,
    minY,
    panelW,
    panelH,
    margin,
  );

  const basePointSize = 20;

  const getPointSize = (mag) => {
    const scale = (mag ?? 3) / 5;
    return Math.max(12, Math.min(36, basePointSize * scale));
  };

  const rawPositions = box.points.map((p) => ({
    x: ((p.screenX - minX) / boxW) * panelW,
    y: ((p.screenY - minY) / boxH) * panelH,
    data: p,
    size: getPointSize(p.mag),
  }));

  const resolved = resolveOverlapsVariable(rawPositions);

  return (
    <div
      style={{
        position: "absolute",
        left: panelLeft,
        top: panelTop,
        width: panelW,
        height: panelH,
        background: "rgba(249, 232, 255, 0.85)",
        backdropFilter: "blur(12px)",
        border: "2px solid rgba(232, 213, 239, 0.6)",
        borderRadius: 12,
        zIndex: 25,
        overflow: "hidden",
      }}
    >
      {resolved.map((pt, i) => {
        const p = pt.data;
        const isVolcanic = p.type === "volcanic";
        const size = pt.size;
        const clampedX = Math.max(size / 2, Math.min(panelW - size / 2, pt.x));
        const clampedY = Math.max(size / 2, Math.min(panelH - size / 2, pt.y));

        return (
          <div
            key={i}
            onClick={() => onPointClick?.(p)}
            title={`${p.place || "Unknown"} — M${p.mag?.toFixed(1)}`}
            style={{
              position: "absolute",
              left: clampedX,
              top: clampedY,
              width: size,
              height: size,
              borderRadius: isVolcanic ? "3px" : "50%",
              background: isVolcanic ? "#E8D5EF" : "#FFFFFF",
              border: "1px solid rgba(80,60,120,0.6)",
              cursor: "pointer",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 4px rgba(190,174,213,0.8)",
            }}
          />
        );
      })}
    </div>
  );
}
