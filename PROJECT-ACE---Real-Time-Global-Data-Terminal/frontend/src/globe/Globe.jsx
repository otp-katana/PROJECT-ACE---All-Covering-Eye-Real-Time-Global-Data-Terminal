import { useRef, useEffect, useState } from "react";
import { useGlobe } from "./useGlobe";

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

  let panelLeft = maxX + margin;
  let panelTop = minY;

  if (panelLeft + panelW > window.innerWidth) {
    panelLeft = minX - panelW - margin;
  }
  if (panelTop + panelH > window.innerHeight) {
    panelTop = window.innerHeight - panelH - margin;
  }
  if (panelTop < margin) {
    panelTop = margin;
  }
  if (panelLeft < margin) {
    panelLeft = margin;
  }

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
            title={`${p.place || "Bilinmeyen"} — M${p.mag?.toFixed(1)}`}
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
