export const COLORS = {
  accent:      '#8A72B1',
  accentDim:   'rgba(138, 114, 177, 0.18)',
  border:      'rgba(138, 114, 177, 0.14)',
  borderMd:    'rgba(138, 114, 177, 0.32)',
  bgRoot:      '#08080f',
  bgPanel:     'rgba(13, 12, 26, 0.85)',
  bgCard:      'rgba(255, 255, 255, 0.03)',
  text:        '#E2E0F0',
  textMuted:   'rgba(226, 224, 240, 0.38)',
  textDim:     'rgba(226, 224, 240, 0.20)',
  green:       '#3DD68C',
  yellow:      '#F5C542',
  orange:      '#F5844A',
  red:         '#EF4444',
}

export const FAULT_ZONES = [
  { name: 'KAF — Marmara Segmenti',        lat: 40.82, lon: 28.95, weight: 0.28 },
  { name: 'Ege Graben — İzmir Bölgesi',    lat: 38.41, lon: 27.12, weight: 0.22 },
  { name: 'DAF — Kahramanmaraş Segmenti',  lat: 37.57, lon: 36.93, weight: 0.22 },
  { name: 'KAF — Düzce Segmenti',          lat: 40.69, lon: 31.17, weight: 0.14 },
  { name: 'Doğu Anadolu — Elazığ',         lat: 38.72, lon: 39.49, weight: 0.08 },
  { name: 'Ege — Yunanistan',              lat: 37.96, lon: 21.82, weight: 0.06 },
]

export const OMORI = {
  c: 0.1,
  p: 1.1,
}

export const MODULES = [
  { id: 'FLIGHTS', icon: '✈', label: 'GLOBAL FLIGHTS' },
  { id: 'SEISMIC', icon: '≋', label: 'SEISMIC ACTIVITY' },
  { id: 'CYBER',   icon: '☠', label: 'CYBER ATTACKS' },
]