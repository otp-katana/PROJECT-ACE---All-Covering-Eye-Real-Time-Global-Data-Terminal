import { FAULT_ZONES, OMORI } from "./constants";

// ── Bölüm 1: Veri üreticiler ──────────────────────────────────────────────

export function gutenbergRichter(mMin = 2.0, mMax = 7.8) {
  const b = 1.0;
  const r = Math.random();
  const m =
    mMin - Math.log10(1 - r * (1 - Math.pow(10, -b * (mMax - mMin)))) / b;
  return +Math.min(Math.max(m, mMin), mMax).toFixed(1);
}

function weightedRandom(arr) {
  const total = arr.reduce((s, z) => s + z.weight, 0);
  let r = Math.random() * total;
  for (const z of arr) {
    r -= z.weight;
    if (r <= 0) return z;
  }
  return arr[arr.length - 1];
}

export function genEvent() {
  const zone = weightedRandom(FAULT_ZONES);
  const mag = gutenbergRichter(2.0, 7.2);
  const depth = +Math.max(1, Math.abs(Math.random() * 28 + 4)).toFixed(1);
  return {
    id: `ev_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    mag,
    depth,
    lat: +(zone.lat + (Math.random() - 0.5) * 1.2).toFixed(3),
    lon: +(zone.lon + (Math.random() - 0.5) * 1.2).toFixed(3),
    zone: zone.name,
    ts: new Date(),
  };
}

// ── Bölüm 2: Alert rengi ve etiketi ──────────────────────────────────────

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

// ── Bölüm 3: Omori Yasası ─────────────────────────────────────────────────

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
