import { useState, useEffect } from 'react'
import { COLORS } from './constants'
import { genEvent } from './utils'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import ThreatWidget from './ThreatWidget'
import SeismicChart from './SeismicChart'
import EventList from './EventList'
import OmoriPrediction from './OmoriPrediction'

export default function OmoriDashboard() {
  const [events,       setEvents]       = useState([])
  const [chartData,    setChartData]    = useState([])
  const [magFilter,    setMagFilter]    = useState(3.5)
  const [activeModule, setActiveModule] = useState('SEISMIC')
  const [tick,         setTick]         = useState(0)
  const [pulse,        setPulse]        = useState(false)

  // ── INITIAL DATA ───────────────────────────────────────────────────
  useEffect(() => {
    const initial = Array.from({ length: 20 }, () => {
      const e = genEvent()
      e.ts = new Date(Date.now() - Math.random() * 4 * 3_600_000)
      return e
    }).sort((a, b) => b.ts - a.ts)

    setEvents(initial)

    const chart = Array.from({ length: 28 }, (_, i) => ({
      t:   i,
      mag: +((Math.random() * 3) + 2).toFixed(1),
    }))
    setChartData(chart)
  }, [])

  // ── REAL-TIME SIMULATION ──────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const e = genEvent()

      setPulse(true)
      setTimeout(() => setPulse(false), 600)

      setEvents(prev => [e, ...prev].slice(0, 60))
      setChartData(prev => [...prev.slice(1), { t: prev.length, mag: e.mag }])
      setTick(t => t + 1)
    }, 4500)

    return () => clearInterval(id)
  }, [])

  // ── RENDER ─────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: COLORS.bgRoot,
      color: COLORS.text,
      fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif",
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontSize: 13,
    }}>

      <Navbar tick={tick} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        <Sidebar
          activeModule={activeModule}
          onModuleChange={setActiveModule}
        />

        {/* SEISMIC MODULE */}
        {activeModule === 'SEISMIC' && (
          <main style={{
            flex: 1,
            display: 'flex',
            gap: 10,
            padding: 14,
            overflow: 'auto',
          }}>

            {/* LEFT COLUMN */}
            <div style={{
              width: 335,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>

              {/* PANEL'S TITLE */}
              <div style={{
                background: COLORS.bgPanel,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.14em' }}>
                  SEISMIC ACTIVITY
                </span>
                <span style={{
                  fontSize: 9,
                  letterSpacing: '0.14em',
                  color: COLORS.accent,
                  background: COLORS.accentDim,
                  border: `1px solid ${COLORS.borderMd}`,
                  borderRadius: 3,
                  padding: '3px 8px',
                }}>
                  OMORI ENGINE
                </span>
              </div>

              {/* MAGNITUDE FILTER */}
              <div style={{
                background: COLORS.bgPanel,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                padding: '14px 16px',
              }}>
                <div style={{ fontSize: 10, letterSpacing: '0.16em', color: COLORS.textMuted, marginBottom: 10 }}>
                  MAGNITUDE FILTER
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="9.0"
                  step="0.1"
                  value={magFilter}
                  onChange={e => setMagFilter(+e.target.value)}
                  style={{ width: '100%', accentColor: COLORS.accent }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  color: COLORS.textMuted,
                  marginTop: 6,
                }}>
                  <span>Min: {magFilter.toFixed(1)}</span>
                  <span>Max: 9.0</span>
                </div>
              </div>

              {/* ACTIVE FAULTS / REGIONAL FOCUS */}
              <div style={{
                background: COLORS.bgPanel,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                padding: '14px 16px',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 10,
                  marginBottom: 10,
                  borderBottom: `1px solid ${COLORS.border}`,
                }}>
                  <span style={{ fontSize: 10, letterSpacing: '0.14em', color: COLORS.textMuted }}>
                    ACTIVE FAULTS
                  </span>
                  <span style={{ fontSize: 11, color: COLORS.accent }}>6 MONITORED</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, letterSpacing: '0.14em', color: COLORS.textMuted }}>
                    REGIONAL FOCUS
                  </span>
                  <span style={{ fontSize: 11, color: COLORS.text }}>TURKEY + AEGEAN</span>
                </div>
              </div>

              <SeismicChart chartData={chartData} />

            </div>

            {/* RIGHT COLUMN */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              minWidth: 0,
            }}>

              <ThreatWidget events={events} pulse={pulse} />

              {/* STATISTIC'S CARDS */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: 'EVENTS (24H)',                        value: events.length },
                  { label: `FILTERED M≥${magFilter.toFixed(1)}`, value: events.filter(e => e.mag >= magFilter).length },
                  { label: 'MAX MAG',                             value: events.length ? `M${Math.max(...events.map(e => e.mag))}` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    flex: 1,
                    background: COLORS.bgCard,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 7,
                    padding: '11px 12px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 9, letterSpacing: '0.14em', color: COLORS.textDim, marginBottom: 5 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: COLORS.text }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <OmoriPrediction events={events} />
              <EventList events={events} magFilter={magFilter} pulse={pulse} />

            </div>
          </main>
        )}

        {/* OTHER MODULES */}
        {activeModule !== 'SEISMIC' && (
          <main style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 10,
          }}>
            <div style={{ fontSize: 36, opacity: 0.18 }}>
              {activeModule === 'FLIGHTS' ? '✈' : '☠'}
            </div>
            <div style={{ fontSize: 11, letterSpacing: '0.18em', color: COLORS.textDim }}>
              {activeModule === 'FLIGHTS' ? 'HADLEY MODULE' : 'ARF MODULE'}
            </div>
            <div style={{ fontSize: 10, color: COLORS.textDim, marginTop: 2 }}>
              Not yet deployed
            </div>
          </main>
        )}

      </div>
    </div>
  )
}