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

/** Subtle mosque silhouette with two domes + minaret. */
function MosqueSilhouette({ side = "right" }: { side?: "left" | "right" }) {
  const flip = side === "left" ? "scaleX(-1)" : "none";
  return (
    <svg
      width={220}
      height={120}
      viewBox="0 0 220 120"
      style={{ display: "block", transform: flip }}
    >
      <g fill="rgba(6, 14, 9, 0.85)">
        {/* far dome */}
        <path d="M40,120 L40,80 Q40,55 60,55 Q80,55 80,80 L80,120 Z" />
        {/* main dome */}
        <path d="M85,120 L85,70 Q85,40 115,40 Q145,40 145,70 L145,120 Z" />
        {/* tip */}
        <rect x="113" y="28" width="4" height="16" />
        {/* minaret */}
        <rect x="160" y="40" width="8" height="80" />
        <path d="M160,40 L168,40 L164,30 Z" />
        {/* base wall */}
        <rect x="20" y="100" width="200" height="20" />
      </g>
    </svg>
  );
}

/** Subtle decorative leaf cluster. */
function LeafCluster() {
  return (
    <svg width={140} height={200} viewBox="0 0 140 200" style={{ display: "block" }}>
      <g fill="rgba(6, 14, 9, 0.75)" stroke="rgba(20, 40, 28, 0.6)" strokeWidth={0.5}>
        <path d="M70,200 Q60,160 90,140 Q110,160 100,200 Z" />
        <path d="M55,200 Q40,140 75,110 Q100,140 90,200 Z" />
        <path d="M85,200 Q90,150 120,130 Q130,170 115,200 Z" />
        <path d="M40,200 Q30,170 55,150 Q70,180 60,200 Z" />
      </g>
    </svg>
  );
}

interface CardFrameProps {
  /** "warm" puts a sun-glow center; "rise" puts the glow at lower-left like sunrise. */
  glow?: "warm" | "rise";
  /** Optional silhouette decoration corner. */
  decor?: "mosque-right" | "mosque-leaves" | "leaves-right" | "none";
  children: React.ReactNode;
}

/** Card frame: deep-green canvas with procedural sun-glow + silhouettes. */
export function CardFrame({ glow = "warm", decor = "mosque-right", children }: CardFrameProps) {
  const glowStyle =
    glow === "rise"
      ? "radial-gradient(circle at 18% 60%, rgba(255, 178, 90, 0.32) 0%, rgba(201, 147, 58, 0.12) 22%, rgba(9, 21, 13, 0) 55%)"
      : "radial-gradient(circle at 50% 38%, rgba(255, 200, 110, 0.30) 0%, rgba(201, 147, 58, 0.12) 25%, rgba(9, 21, 13, 0) 60%)";

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
          background:
            "linear-gradient(180deg, #0B1812 0%, #0A1610 45%, #07110B 100%)",
        }}
      >
        {/* Sun glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: glowStyle,
            pointerEvents: "none",
          }}
        />
        {/* Decor silhouettes */}
        {(decor === "mosque-right" || decor === "mosque-leaves") && (
          <div style={{ position: "absolute", right: -10, bottom: 0, opacity: 0.95, pointerEvents: "none" }}>
            <MosqueSilhouette side="right" />
          </div>
        )}
        {(decor === "leaves-right" || decor === "mosque-leaves") && (
          <div style={{ position: "absolute", right: -20, bottom: -10, opacity: 0.9, pointerEvents: "none" }}>
            <LeafCluster />
          </div>
        )}
        {decor === "mosque-leaves" && (
          <div style={{ position: "absolute", left: -10, bottom: 0, opacity: 0.95, pointerEvents: "none" }}>
            <MosqueSilhouette side="left" />
          </div>
        )}
        {/* Vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, rgba(9,21,13,0) 40%, rgba(4,10,7,0.55) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            padding: "36px 36px 32px 36px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
