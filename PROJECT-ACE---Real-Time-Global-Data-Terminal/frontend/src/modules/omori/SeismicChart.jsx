import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { COLORS } from './constants'

function SeismicTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  return (
    <div style={{
      background: '#0d0c1a',
      border: `1px solid ${COLORS.borderMd}`,
      borderRadius: 6,
      padding: '7px 12px',
      fontSize: 12,
    }}>
      <span style={{ color: COLORS.textMuted }}>Mag </span>
      <span style={{ color: COLORS.accent, fontWeight: 600 }}>{val}</span>
    </div>
  )
}

export default function SeismicChart({ chartData }) {
  return (
    <div style={{
      background: COLORS.bgPanel,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      padding: '14px 16px',
      flex: 1,
    }}>

      {/* Başlık */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.16em', color: COLORS.textMuted }}>
          REAL-TIME SEISMIC FLOW
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: COLORS.green }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: COLORS.green,
            display: 'inline-block',
          }} />
          STREAMING
        </div>
      </div>

      {/* Grafik */}
      <div style={{ height: 165, marginBottom: 4 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="seismicGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={COLORS.accent} stopOpacity={0.35} />
                <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="2 4" stroke="rgba(138, 114, 177, 0.09)" />

            <XAxis
              dataKey="t"
              tick={{ fill: COLORS.textDim, fontSize: 9 }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              domain={[0, 8]}
              ticks={[0, 2, 4, 6, 8]}
              tick={{ fill: COLORS.textDim, fontSize: 9 }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip content={<SeismicTooltip />} />

            <ReferenceLine
              y={4.5}
              stroke="rgba(245, 196, 66, 0.35)"
              strokeDasharray="3 3"
              label={{
                value: 'M4.5',
                position: 'insideTopRight',
                fill: 'rgba(245, 196, 66, 0.5)',
                fontSize: 9,
              }}
            />

            <Area
              type="monotone"
              dataKey="mag"
              stroke={COLORS.accent}
              strokeWidth={1.5}
              fill="url(#seismicGrad)"
              dot={false}
              activeDot={{ r: 4, fill: COLORS.accent, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Alt etiketler */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: COLORS.textDim }}>
        <span>← T-28</span>
        <span>NOW →</span>
      </div>

    </div>
  )
}