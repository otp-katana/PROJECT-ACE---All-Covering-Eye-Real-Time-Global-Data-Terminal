import { COLORS } from "./constants";
import { omoriPredict, alertColor } from "./utils";

export default function OmoriPrediction({ events }) {
  if (!events.length) return null;

  const mainEvent = events.reduce((a, b) => (a.mag > b.mag ? a : b));
  const prediction = omoriPredict(mainEvent.mag);

  return (
    <div
      style={{
        background: COLORS.bgPanel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: "14px 16px",
      }}
    >
      {/* Başlık */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.16em",
            color: COLORS.textMuted,
          }}
        >
          OMORI LAW — AFTERSHOCK FORECAST
        </div>
        <span style={{ fontSize: 9, color: COLORS.textDim }}>
          n(t) = K/(c+t)^p
        </span>
      </div>

      {/* Ana şok bilgisi */}
      <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 12 }}>
        Based on: <span style={{ color: COLORS.accent }}>M{mainEvent.mag}</span>
        {" · "}
        {mainEvent.zone}
      </div>

      {/* Tahmin ızgarası */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 6,
          marginBottom: 12,
        }}
      >
        {[
          { label: "1h", val: prediction.h1 },
          { label: "6h", val: prediction.h6 },
          { label: "24h", val: prediction.h24 },
          { label: "72h", val: prediction.h72 },
        ].map(({ label, val }) => (
          <div
            key={label}
            style={{
              background: "rgba(138, 114, 177, 0.07)",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              padding: "9px 4px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: COLORS.accent,
                marginBottom: 2,
              }}
            >
              ~{val}
            </div>
            <div
              style={{
                fontSize: 9,
                color: COLORS.textDim,
                letterSpacing: "0.1em",
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Båth + K + güven */}
      <div
        style={{
          borderTop: `1px solid ${COLORS.border}`,
          paddingTop: 10,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 9,
              letterSpacing: "0.12em",
              color: COLORS.textDim,
            }}
          >
            BÅTH MAX AFTERSHOCK
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.orange }}>
            M{prediction.bath}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 9,
              letterSpacing: "0.12em",
              color: COLORS.textDim,
            }}
          >
            OMORI K
          </span>
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>
            {prediction.K}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 9,
              letterSpacing: "0.12em",
              color: COLORS.textDim,
            }}
          >
            MODEL CONFIDENCE
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.green }}>
            {prediction.confidence}%
          </span>
        </div>
      </div>

      {/* Uyarı */}
      <div
        style={{
          marginTop: 10,
          padding: "7px 10px",
          background: "rgba(245, 132, 74, 0.06)",
          border: "1px solid rgba(245, 132, 74, 0.15)",
          borderRadius: 5,
          fontSize: 9,
          color: "rgba(245, 132, 74, 0.7)",
          lineHeight: 1.5,
        }}
      >
        ⚠ Statistical model only. Precise earthquake prediction is not
        scientifically possible. This output supports situational awareness, not
        operational decisions.
      </div>
    </div>
  );
}
