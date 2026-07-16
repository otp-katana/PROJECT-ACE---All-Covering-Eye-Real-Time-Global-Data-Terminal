import { COLORS, MODULES, FAULT_ZONES } from './constants'

export default function Sidebar({ activeModule, onModuleChange }) {
  return (
    <aside style={{
      width: 205,
      borderRight: `1px solid ${COLORS.border}`,
      background: 'rgba(10, 9, 20, 0.9)',
      padding: '22px 0',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* TITLE */}
      <div style={{ padding: '0 20px', marginBottom: 26 }}>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.14em', marginBottom: 2, color: COLORS.text }}>
          PROJECT ACE
        </div>
        <div style={{ fontSize: 9, letterSpacing: '0.12em', color: COLORS.textDim }}>
          Global dashboard v0.1
        </div>
      </div>

      {/* MODULE LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '0 10px' }}>
        {MODULES.map(m => (
          <button
            key={m.id}
            onClick={() => onModuleChange(m.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              width: '100%',
              border: activeModule === m.id
                ? `1px solid ${COLORS.borderMd}`
                : '1px solid transparent',
              borderRadius: 6,
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.12em',
              color: activeModule === m.id ? COLORS.accent : COLORS.textMuted,
              background: activeModule === m.id ? COLORS.accentDim : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>
              {m.icon}
            </span>
            {m.label}
          </button>
        ))}
      </div>

      {/* FAULT STATUS */}
      <div style={{ marginTop: 'auto', padding: '16px 14px 0' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.14em', color: COLORS.textDim, marginBottom: 8 }}>
          MONITORED FAULTS
        </div>
        {FAULT_ZONES.slice(0, 4).map(z => (
          <div key={z.name} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
            <span style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              flexShrink: 0,
              background: z.weight > 0.2 ? COLORS.orange : z.weight > 0.14 ? COLORS.yellow : COLORS.green,
            }} />
            <span style={{ fontSize: 9, color: COLORS.textMuted, lineHeight: 1.3 }}>
              {z.name.split('—')[0].trim()}
            </span>
          </div>
        ))}
      </div>

    </aside>
  )
}