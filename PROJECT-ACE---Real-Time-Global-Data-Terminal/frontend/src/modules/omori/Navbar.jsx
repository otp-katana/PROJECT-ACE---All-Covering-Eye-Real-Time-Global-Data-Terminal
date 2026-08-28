import { COLORS } from "./constants";

export default function Navbar({ tick }) {
  return (
    <nav
      style={{
        height: 52,
        borderBottom: `1px solid ${COLORS.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: "rgba(10, 9, 20, 0.97)",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: COLORS.text,
          }}
        >
          PROJECT ACE
        </span>
        <span
          style={{
            fontSize: 9,
            letterSpacing: "0.16em",
            color: COLORS.textDim,
          }}
        >
          GLOBAL DASHBOARD v1.2
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {tick > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 10,
              letterSpacing: "0.12em",
              color: COLORS.green,
              background: "rgba(61, 214, 140, 0.08)",
              border: "1px solid rgba(61, 214, 140, 0.22)",
              borderRadius: 3,
              padding: "3px 9px",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: COLORS.green,
                display: "inline-block",
              }}
            />
            LIVE
          </div>
        )}

        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: COLORS.accentDim,
            border: `1px solid ${COLORS.borderMd}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: COLORS.accent,
          }}
        >
          ACE
        </div>
      </div>
    </nav>
  );
}
