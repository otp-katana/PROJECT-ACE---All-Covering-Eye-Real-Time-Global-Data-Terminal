import { COLORS } from "./constants";
import { alertColor } from "./utils";

export default function EventList({ events, magFilter, pulse }) {
  const filtered = events.filter((e) => e.mag >= magFilter);

  return (
    <div
      style={{
        background: COLORS.bgPanel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: "14px 16px",
        flex: 1,
      }}
    >
      {/* Başlık */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.16em",
            color: COLORS.textMuted,
          }}
        >
          RECENT EVENTS — M≥{magFilter.toFixed(1)}
        </div>
        <span style={{ fontSize: 9, color: COLORS.textDim }}>
          {filtered.length} found
        </span>
      </div>

      {/* Liste */}
      <div style={{ overflowY: "auto", maxHeight: 220 }}>
        {filtered.length === 0 ? (
          <div
            style={{ fontSize: 11, color: COLORS.textDim, padding: "8px 0" }}
          >
            No events above M{magFilter.toFixed(1)} threshold.
          </div>
        ) : (
          filtered.slice(0, 14).map((e, i) => (
            <div
              key={e.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 8px",
                marginBottom: 3,
                borderRadius: 5,
                borderLeft: `3px solid ${alertColor(e.mag)}`,
                background:
                  i === 0 && pulse
                    ? "rgba(138, 114, 177, 0.08)"
                    : "transparent",
              }}
            >
              {/* Sol: büyüklük + konum */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    flexShrink: 0,
                    color: alertColor(e.mag),
                    background: `${alertColor(e.mag)}18`,
                    padding: "2px 6px",
                    borderRadius: 3,
                  }}
                >
                  M{e.mag}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: COLORS.text,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {e.zone}
                </span>
              </div>

              {/* Sağ: derinlik + saat */}
              <div
                style={{
                  fontSize: 10,
                  color: COLORS.textDim,
                  flexShrink: 0,
                  marginLeft: 8,
                }}
              >
                {e.depth}km ·{" "}
                {e.ts.toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
