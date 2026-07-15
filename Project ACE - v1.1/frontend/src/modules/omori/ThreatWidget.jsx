import { COLORS } from './constants'
import { alertColor, alertLabel } from './utils'

export default function ThreatWidget({ events, pulse }) {
  const maxMag    = events.length ? Math.max(...events.map(e => e.mag)) : 0
  const lastEvent = events[0] ?? null

  const threatIdx = Math.min(100, Math.round(
    events.slice(0, 12).reduce((s, e) => s + Math.pow(10, e.mag - 4.2), 0) * 8
  ))

  return (
    <div style={{
      background: COLORS.bgPanel,
      border: `1px solid ${COLORS.borderMd}`,
      borderRadius: 8,
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>

        {/* Sol: tehdit seviyesi */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: COLORS.textDim, marginBottom: 5 }}>
            THREAT LEVEL
          </div>

          <div style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '0.08em',
            marginBottom: 10,
            color: alertColor(maxMag),
            transition: 'color 0.6s',
          }}>
            {alertLabel(maxMag)}
          </div>

          {/* Progress bar */}
          <div style={{
            height: 3,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.06)',
            marginBottom: 6,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              borderRadius: 2,
              width: `${threatIdx}%`,
              background: alertColor(maxMag),
              transition: 'width 0.9s ease, background 0.6s',
            }} />
          </div>

          <div style={{ fontSize: 10, color: COLORS.textDim }}>
            Threat Index: {threatIdx}%
          </div>
        </div>

        {/* Sağ: son olay */}
        {lastEvent && (
          <div style={{ textAlign: 'right', paddingLeft: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.12em', color: COLORS.textDim, marginBottom: 4 }}>
              LAST EVENT
            </div>
            <div style={{
              fontSize: 18,
              fontWeight: 700,
              color: alertColor(lastEvent.mag),
              transition: 'color 0.3s',
            }}>
              M{lastEvent.mag}
            </div>
            <div style={{ fontSize: 9, color: COLORS.textDim, marginTop: 2 }}>
              {lastEvent.depth}km depth
            </div>
          </div>
        )}

      </div>
    </div>
  )
}