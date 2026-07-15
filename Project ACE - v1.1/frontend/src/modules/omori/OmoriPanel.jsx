import { useState } from 'react'

const TABS = [
  { id: 'MONITOR', label: 'MONITOR' },
  { id: 'PREDICT', label: 'PREDICT' },
  { id: 'RISK',    label: 'RISK'    },
]

export default function OmoriPanel() {
  const [activeTab, setActiveTab] = useState('MONITOR')

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      height:        '100%',
    }}>

      {/* ── Sekme menüsü ── */}
      <div style={{
        display:      'flex',
        gap:          4,
        marginBottom: 16,
        borderBottom: '1px solid rgba(232, 213, 239, 0.15)',
        paddingBottom: 12,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex:          1,
              padding:       '6px 0',
              background:    activeTab === tab.id
                ? 'rgba(190, 174, 213, 0.25)'
                : 'transparent',
              border:        activeTab === tab.id
                ? '1px solid rgba(190, 174, 213, 0.45)'
                : '1px solid transparent',
              borderRadius:  6,
              cursor:        'pointer',
              fontSize:      9,
              fontWeight:    700,
              letterSpacing: '0.12em',
              color:         activeTab === tab.id
                ? '#000000'
                : 'rgba(0, 0, 0, 0.4)',
              transition:    'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Sekme içeriği ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'MONITOR' && <MonitorTab />}
        {activeTab === 'PREDICT' && <PredictTab />}
        {activeTab === 'RISK'    && <RiskTab />}
      </div>

    </div>
  )
}

function MonitorTab() {
  const [minMag,  setMinMag]  = useState(2.5)
  const [region,  setRegion]  = useState('GLOBAL')
  const [window_, setWindow]  = useState('24H')
  const [sortBy,  setSortBy]  = useState('TIME')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Büyüklük filtresi ── */}
      <div>
        <div style={{ fontSize: 9, letterSpacing: '0.12em', color: 'rgba(0,0,0,0.45)', marginBottom: 6 }}>
          MIN MAGNITUDE — {minMag.toFixed(1)}
        </div>
        <input
          type="range" min="1.0" max="8.0" step="0.1"
          value={minMag}
          onChange={e => setMinMag(+e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      {/* ── Bölge seçimi ── */}
      <div>
        <div style={{ fontSize: 9, letterSpacing: '0.12em', color: 'rgba(0,0,0,0.45)', marginBottom: 6 }}>
          REGION
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['GLOBAL', 'TURKEY', 'MEDITERRANEAN'].map(r => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              style={{
                flex: 1, padding: '5px 4px', fontSize: 8,
                letterSpacing: '0.06em', fontWeight: 600,
                borderRadius: 4, cursor: 'pointer',
                border: region === r ? '1px solid rgba(190,174,213,0.5)' : '1px solid rgba(0,0,0,0.1)',
                background: region === r ? 'rgba(190,174,213,0.25)' : 'transparent',
                color: '#000000',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Zaman penceresi ── */}
      <div>
        <div style={{ fontSize: 9, letterSpacing: '0.12em', color: 'rgba(0,0,0,0.45)', marginBottom: 6 }}>
          TIME WINDOW
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['1H', '6H', '24H', '7D'].map(w => (
            <button
              key={w}
              onClick={() => setWindow(w)}
              style={{
                flex: 1, padding: '5px 4px', fontSize: 8,
                letterSpacing: '0.06em', fontWeight: 600,
                borderRadius: 4, cursor: 'pointer',
                border: window_ === w ? '1px solid rgba(190,174,213,0.5)' : '1px solid rgba(0,0,0,0.1)',
                background: window_ === w ? 'rgba(190,174,213,0.25)' : 'transparent',
                color: '#000000',
              }}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* ── Sıralama ── */}
      <div>
        <div style={{ fontSize: 9, letterSpacing: '0.12em', color: 'rgba(0,0,0,0.45)', marginBottom: 6 }}>
          SORT BY
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['TIME', 'MAGNITUDE'].map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              style={{
                flex: 1, padding: '5px 4px', fontSize: 8,
                letterSpacing: '0.06em', fontWeight: 600,
                borderRadius: 4, cursor: 'pointer',
                border: sortBy === s ? '1px solid rgba(190,174,213,0.5)' : '1px solid rgba(0,0,0,0.1)',
                background: sortBy === s ? 'rgba(190,174,213,0.25)' : 'transparent',
                color: '#000000',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Sonuç placeholder ── */}
      <div style={{
        marginTop: 8, paddingTop: 12,
        borderTop: '1px solid rgba(0,0,0,0.08)',
        fontSize: 10, color: 'rgba(0,0,0,0.35)', textAlign: 'center',
      }}>
        Filtre: M≥{minMag.toFixed(1)} · {region} · {window_} · {sortBy} sırasıyla
        <br /><br />
        Veri bağlantısı sonraki adımda eklenecek
      </div>

    </div>
  )
}

function PredictTab() {
  return (
    <div style={{ color: 'rgba(0,0,0,0.4)', fontSize: 11, textAlign: 'center', marginTop: 40 }}>
      PREDICT içeriği gelecek
    </div>
  )
}

function RiskTab() {
  return (
    <div style={{ color: 'rgba(0,0,0,0.4)', fontSize: 11, textAlign: 'center', marginTop: 40 }}>
      RISK içeriği gelecek
    </div>
  )
}