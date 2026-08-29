import { FAULT_ZONES, OMORI } from "./constants";

// ── PART: 1 ][ ALERT COLORS & LABEL ────────────────────────────────────────
// ───────────────────────────────────────────────────────────────────────────
// Maps a magnitude value to a UI color/label. Independent of data source...
// ...works with both mock and live (USGS) event data. Not currently wired...
// ...into the active panel, kept for future use (e.g. highlighting critical...
// ...events in the detail panel or event log).
export function alertColor(mag) {
  if (mag < 4.0) return "#3DD68C";
  if (mag < 5.5) return "#F5C542";
  if (mag < 7.0) return "#F5844A";
  return "#EF4444";
}

export function alertLabel(mag) {
  if (mag < 4.0) return "LOW";
  if (mag < 5.5) return "MODERATE";
  if (mag < 7.0) return "HIGH";
  return "CRITICAL";
}

// ── PART: 2 ][ OMORI's LAW ─────────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────────────────
// Numerical integration of the Omori-Utsu aftershock decay law...
// ...(n(t) = K / (c + t)^p) plus Båth's Law for expected max aftershock...
// magnitude. Takes a real event magnitude and returns predicted aftershock...
// ...counts over several time windows. Not yet connected to the detail panel...
// ...planned for a future "statistical anomaly detection" feature.
function omoriIntegrate(t1, t2, K) {
  const { c, p } = OMORI;
  const n = 200;
  const dt = (t2 - t1) / n;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const t = t1 + (i + 0.5) * dt;
    sum += K / Math.pow(c + t, p);
  }
  return +(sum * dt).toFixed(1);
}

export function omoriPredict(mag) {
  const K = Math.pow(10, mag - 4.0);
  return {
    h1: omoriIntegrate(0, 1, K),
    h6: omoriIntegrate(0, 6, K),
    h24: omoriIntegrate(0, 24, K),
    h72: omoriIntegrate(0, 72, K),
    bath: +(mag - 1.2).toFixed(1),
    confidence: Math.min(
      88,
      Math.max(28, Math.round(((mag - 2.5) / 5.5) * 100)),
    ),
    K: +K.toFixed(4),
  };
}
