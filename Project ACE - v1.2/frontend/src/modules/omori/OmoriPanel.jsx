import { useState } from 'react'

const CORES = [
  {
    id: 'core_dynamics',
    label: 'CORE DYNAMICS',
    active: true,
    items: [
      { id: 'seismic',    label: 'SEISMIC ACTIVITIES',              active: true },
      { id: 'faults',     label: 'FAULT LINES AND TECTONIC BOUNDARIES', active: true },
      { id: 'volcanic',   label: 'VOLCANIC ACTIVITIES',            active: true },
      { id: 'geothermal', label: 'GEOTHERMAL AND HYDROTHERMAL RESOURCES', active: false },
      { id: 'gaps',       label: 'HISTORICAL SEISMIC GAPS',       active: false },
    ],
  },
  {
    id: 'post_event',
    label: 'POST-EVENT',
    active: false,
    items: [
      { id: 'aftershocks', label: 'Artçı Deprem Kümeleri',          active: false },
      { id: 'tsunami',     label: 'Tsunami ve Okyanus Uyarıları',   active: false },
      { id: 'liquefaction',label: 'Zemin Sıvılaşması ve Heyelan',   active: false },
      { id: 'deformation', label: 'Sismik Yüzey Deformasyonu',      active: false },
    ],
  },
  {
    id: 'cassandra_ai',
    label: 'CASSANDRA AI',
    active: false,
    items: [
      { id: 'heatmap',     label: 'Sismik Gerilim Isı Haritası',    active: false },
      { id: 'anomalies',   label: 'Risk Anomalileri',               active: false },
      { id: 'signals',     label: 'İstatistiksel Anomali Tespiti',  active: false },
      { id: 'classify',    label: 'Öncü/Artçı Olasılık Sınıflandırması', active: false },
    ],
  },
]

const CORE_ICONS = {
  core_dynamics: '◉',
  post_event:    '◈',
  cassandra_ai:  '✦',
}

export default function OmoriPanel() {
  const [openCore, setOpenCore] = useState('core_dynamics')  // CORE - TURE/FALSE
  const [toggles, setToggles] = useState({
    seismic: true,
    faults:  false,
    volcanic:false,
  })

  const toggle = id => {
    setToggles(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── CORE ICONS — TOP ROW ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {CORES.map(core => (
          <button
            key={core.id}
            onClick={() => setOpenCore(openCore === core.id ? null : core.id)}
            style={{
              flex:          1,
              padding:       '10px 4px',
              borderRadius:  10,
              cursor:        'pointer',
              border:        openCore === core.id
                ? '1px solid rgba(190,174,213,0.5)'
                : '1px solid rgba(0,0,0,0.08)',
              background:    openCore === core.id
                ? 'rgba(190,174,213,0.22)'
                : 'transparent',
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           4,
              transition:    'all 0.15s',
            }}
          >
            <span style={{
              fontSize: 16,
              color: core.active ? '#000000' : 'rgba(0,0,0,0.3)',
            }}>
              {CORE_ICONS[core.id]}
            </span>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: core.active ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.3)',
              textAlign: 'center',
              lineHeight: 1.2,
            }}>
              {core.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── CORE, SUB-CONTENTS ── */}
      <div style={{ flex: 1, overflowY: 'visible' }}>
        {CORES.filter(c => c.id === openCore).map(core => (
          <div key={core.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {core.items.map(item => (
              <ToggleRow
                key={item.id}
                label={item.label}
                enabled={item.active ? (toggles[item.id] ?? false) : false}
                disabled={!item.active}
                onClick={() => item.active && toggle(item.id)}
              />
            ))}
          </div>
        ))}
      </div>

    </div>
  )
}

function ToggleRow({ label, enabled, disabled, onClick }) {
  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      opacity:        disabled ? 0.35 : 1,
    }}>
      <span style={{
        fontSize: 13.5,
        fontWeight: 450,
        color:    '#000000',
        lineHeight: 1.4,
        paddingRight: 8,
      }}>
        {label}
      </span>

      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          width:        34,
          height:       18,
          borderRadius: 10,
          border:       'none',
          padding:      2,
          flexShrink:   0,
          cursor:       disabled ? 'not-allowed' : 'pointer',
          background:   enabled ? 'rgba(80, 60, 120, 0.85)' : 'rgba(0,0,0,0.15)',
          display:      'flex',
          alignItems:   'center',
          justifyContent: enabled ? 'flex-end' : 'flex-start',
          transition:   'background 0.2s',
        }}
      >
        <span style={{
          width:        14,
          height:       14,
          borderRadius: '50%',
          background:   '#FFFFFF',
          display:      'block',
          boxShadow:    '0 1px 2px rgba(0,0,0,0.3)',
        }} />
      </button>
    </div>
  )
}