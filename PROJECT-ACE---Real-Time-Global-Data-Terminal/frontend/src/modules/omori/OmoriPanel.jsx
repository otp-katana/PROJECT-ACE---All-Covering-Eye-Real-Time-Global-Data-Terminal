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

export default function OmoriPanel({ toggles, onToggle, magnitudeFilter, onMagnitudeChange, eruptionYearFilter, onEruptionYearChange, seismicEvents }) {
  const [openCore, setOpenCore] = useState('core_dynamics')
  const [expandedItems, setExpandedItems] = useState({})

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
            {core.items.map(item => {
              const isExpandable = item.id === 'seismic' || item.id === 'volcanic'
              return (
                <div key={item.id}>
                  <ToggleRow
                    label={item.label}
                    enabled={item.active ? (toggles[item.id] ?? false) : false}
                    disabled={!item.active}
                    onClick={() => item.active && onToggle(item.id)}
                    onLabelClick={() => isExpandable && setExpandedItems(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                    expandable={isExpandable}
                    expanded={!!expandedItems[item.id]}
                  />
                  {item.id === 'seismic' && expandedItems.seismic && (
                    <>
                      <MagnitudeSlider value={magnitudeFilter} onChange={onMagnitudeChange} />
                      <EventLog events={seismicEvents?.filter(e => e.mag >= magnitudeFilter).sort((a, b) => Number(b.time) - Number(a.time))} />
                    </>
                  )}
                  {item.id === 'volcanic' && expandedItems.volcanic && (
                    <EruptionYearSlider value={eruptionYearFilter} onChange={onEruptionYearChange} />
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

    </div>
  )
}

function ToggleRow({ label, enabled, disabled, onClick, onLabelClick, expandable, expanded }) {
  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      opacity:        disabled ? 0.35 : 1,
    }}>
        <div
        onClick={expandable ? onLabelClick : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: expandable ? 'pointer' : 'default',
          flex: 1,
        }}
      >
        <span style={{
          fontSize: 13.5,
          fontWeight: 700,
          letterSpacing: '0.03em',
          color:    '#ffffff',
          lineHeight: 1.4,
        }}>
          {label}
        </span>
        {expandable && (
          <span style={{
            fontSize: 10,
            color: 'rgba(255, 255, 255, 0.64)',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            display: 'inline-block',
          }}>
            ▶
          </span>
        )}
      </div>

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

function MagnitudeSlider({ value, onChange }) {
  return (
    <div style={{
      padding: '10px 4px 4px',
      marginBottom: 4,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
        color: 'rgba(0,0,0,0.55)', marginBottom: 6,
      }}>
        <span>MIN MAGNITUDE</span>
        <span>M{value.toFixed(1)}+</span>
      </div>
      <input
        type="range"
        min="1.0"
        max="7.0"
        step="0.1"
        value={value}
        onChange={e => onChange(+e.target.value)}
        style={{ width: '100%', accentColor: 'rgba(80,60,120,0.85)' }}
      />
    </div>
  )
}

function EruptionYearSlider({ value, onChange }) {
  const label = value <= 0 ? `MÖ ${Math.abs(value)}` : `MS ${value}`
  return (
    <div style={{
      padding: '10px 4px 4px',
      marginBottom: 4,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
        color: 'rgba(0,0,0,0.55)', marginBottom: 6,
      }}>
        <span>SON AKTİVİTE</span>
        <span>{value <= -10000 ? 'TÜMÜ' : `${label}+`}</span>
      </div>
      <input
        type="range"
        min="-10000"
        max="2026"
        step="10"
        value={value}
        onChange={e => onChange(+e.target.value)}
        style={{ width: '100%', accentColor: 'rgba(80,60,120,0.85)' }}
      />
    </div>
  )
}

function EventLog({ events }) {
  return (
    <div style={{
      marginTop: 8,
      maxHeight: 140,
      overflowY: 'auto',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: 8,
      padding: '6px 8px',
    }}>
      {(!events || events.length === 0) && (
        <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.35)', padding: '4px 2px' }}>
          Veri bekleniyor...
        </div>
      )}
      {events?.map((e, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '5px 2px',
          borderBottom: i < events.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
          fontSize: 10.5,
        }}>
          <span style={{ color: '#000000', fontWeight: 700 }}>M{e.mag.toFixed(1)}</span>
          <span style={{ color: 'rgba(0,0,0,0.6)', flex: 1, margin: '0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {e.place || 'Bilinmeyen konum'}
          </span>
          <span style={{ color: 'rgba(0,0,0,0.4)', fontSize: 9 }}>
            {timeAgo(e.time)}
          </span>
        </div>
      ))}
    </div>
  )
}

function timeAgo(timeStr) {
  if (!timeStr) return ''
  const diffMs = Date.now() - Number(timeStr)
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'şimdi'
  if (mins < 60) return `${mins} dk önce`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} sa önce`
  return `${Math.floor(hours / 24)} gün önce`
}