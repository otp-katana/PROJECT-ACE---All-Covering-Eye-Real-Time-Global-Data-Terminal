
// ───────────────────────────────────────────────────────────────────────────
// ── PART: 1 ][ OMORI's LAW CONSTANTS ───────────────────────────────────────
// ───────────────────────────────────────────────────────────────────────────
// Parameters for the Omori-Utsu aftershock decay formula: n(t) = K / (c + t)^p.c ...
// ...and p are empirical constants used across all magnitude ranges. Consumed...
// ...by omoriPredict() / omoriIntegrate() in utils.js.
export const OMORI = {
  c: 0.1,
  p: 1.1,
};

