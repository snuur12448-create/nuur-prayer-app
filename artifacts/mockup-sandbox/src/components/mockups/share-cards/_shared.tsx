import React from "react";

export const GOLD = "#C9A35F";
export const GOLD_DIM = "rgba(201, 163, 95, 0.7)";
export const CREAM = "#F1E9D2";
export const CREAM_DIM = "rgba(241, 233, 210, 0.78)";

/** Brand mark — small rounded square containing an 8-ray sun, gold on dark. */
export function NuurMark({ size = 30 }: { size?: number }) {
  const r = size * 0.22;
  const cx = size / 2;
  const cy = size / 2;
  const inner = size * 0.18;
  const rayLen = size * 0.16;
  const rays = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x1 = cx + Math.cos(a) * (inner + 2);
    const y1 = cy + Math.sin(a) * (inner + 2);
    const x2 = cx + Math.cos(a) * (inner + 2 + rayLen);
    const y2 = cy + Math.sin(a) * (inner + 2 + rayLen);
    rays.push(
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={GOLD} strokeWidth={1.2} strokeLinecap="round" />
    );
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect
        x={1}
        y={1}
        width={size - 2}
        height={size - 2}
        rx={r}
        ry={r}
        fill="rgba(9, 21, 13, 0.55)"
        stroke={GOLD}
        strokeWidth={1}
      />
      <circle cx={cx} cy={cy} r={inner * 0.55} fill={GOLD} />
      {rays}
    </svg>
  );
}

/** Small 8-point star ornament (two squares rotated 45°). */
export function StarOrnament({ size = 12, color = GOLD }: { size?: number; color?: string }) {
  const c = size / 2;
  const half = size * 0.4;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`translate(${c} ${c})`}>
        <rect x={-half} y={-half} width={half * 2} height={half * 2} fill={color} />
        <rect x={-half} y={-half} width={half * 2} height={half * 2} fill={color} transform="rotate(45)" />
      </g>
    </svg>
  );
}

/** Horizontal line — gold. */
export function GoldLine({ width = 50 }: { width?: number }) {
  return <div style={{ width, height: 1, background: GOLD_DIM }} />;
}

/** Label band: ── · TEXT · ── */
export function LabelBand({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center" }}>
      <GoldLine width={40} />
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.32em",
          color: GOLD,
          textTransform: "uppercase",
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {children}
      </div>
      <GoldLine width={40} />
    </div>
  );
}

/** Divider: ── ✦ ── */
export function StarDivider({ width = 60 }: { width?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
      <GoldLine width={width} />
      <StarOrnament size={11} />
      <GoldLine width={width} />
    </div>
  );
}

/** Brand lockup at the bottom of every card — text only, no icon. */
export function BrandLockup() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          fontSize: 22,
          letterSpacing: "0.55em",
          color: CREAM,
          paddingLeft: "0.55em",
        }}
      >
        NUUR
      </div>
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          letterSpacing: "0.18em",
          color: CREAM_DIM,
          fontWeight: 400,
        }}
      >
        Light for your daily deen
      </div>
    </div>
  );
}

/** Card frame: full-bleed background image + dark vignette + content slot. */
export function CardFrame({
  bgUrl,
  children,
}: {
  bgUrl: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "#0a0a0a",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: 460,
          aspectRatio: "9/13.5",
          borderRadius: 24,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.55)",
          color: CREAM,
          backgroundColor: "#09150D",
        }}
      >
        <img
          src={bgUrl}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {/* subtle vignette for legibility */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, rgba(9,21,13,0) 35%, rgba(9,21,13,0.4) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            padding: "36px 36px 36px 36px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
