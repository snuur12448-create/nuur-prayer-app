import { Bell } from "lucide-react";

const APP_BG = "#0A1F12";
const APP_TEXT_DIM = "#7A9986";

// Maghrib palette — ember sunset over deep blue
const SKY_TOP = "#1A0F22";
const SKY_MID = "#3D1830";
const SKY_HORIZON = "#7A2818";
const EMBER = "#E07A2A";
const EMBER_BRIGHT = "#FFB055";
const EMBER_DIM = "#9C4A1F";
const STAR = "#F4E4C5";
const FILIGREE = "#C9933A";

const PRAYER = {
  name: "Maghrib",
  arabic: "المغرب",
  time: "5:42 PM",
  remaining: "23m left",
  windowProgress: 0.62,
  windowEnd: { name: "Isha", time: "7:08 PM" },
};

export function CelestialArc() {
  // Arc geometry — semicircle from horizon to horizon
  const W = 358;
  const H = 90;
  const ARC_R = 220;
  const CX = W / 2;
  const CY = H + 130;

  // Marker position along the arc — angle from -π (left) to 0 (right)
  const t = PRAYER.windowProgress;
  const angle = Math.PI + t * Math.PI;
  const markerX = CX + ARC_R * Math.cos(angle);
  const markerY = CY + ARC_R * Math.sin(angle);

  return (
    <div
      style={{
        backgroundColor: APP_BG,
        minHeight: "100vh",
        padding: "44px 16px 24px",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#E8F1EA",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Hint label so it's clear this is the next-prayer card */}
      <div
        style={{
          fontSize: 10,
          letterSpacing: 1.6,
          fontWeight: 700,
          color: APP_TEXT_DIM,
          textTransform: "uppercase",
          padding: "0 6px 12px",
        }}
      >
        Hero — Next Prayer
      </div>

      {/* ── CELESTIAL ARC CARD ──────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          borderRadius: 18,
          overflow: "hidden",
          background: `linear-gradient(180deg, ${SKY_TOP} 0%, ${SKY_MID} 55%, ${SKY_HORIZON} 100%)`,
          border: `1px solid ${EMBER_DIM}55`,
          boxShadow: `
            0 18px 40px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.06),
            inset 0 -40px 60px rgba(122, 40, 24, 0.35)
          `,
          padding: "20px 22px 18px",
        }}
      >
        {/* Soft horizon glow at the bottom — sunset ember */}
        <div
          style={{
            position: "absolute",
            left: -40,
            right: -40,
            bottom: -60,
            height: 140,
            background: `radial-gradient(ellipse at 50% 100%, ${EMBER}55 0%, ${EMBER}00 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Tiny scattered stars (subtle, no big star clichés) */}
        <Stars />

        {/* ── ARC SVG ────────────────────────────────────────── */}
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          style={{ display: "block", marginTop: 4, overflow: "visible" }}
        >
          <defs>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={STAR} stopOpacity="0.18" />
              <stop offset={`${t * 100}%`} stopColor={EMBER_BRIGHT} stopOpacity="0.95" />
              <stop offset={`${Math.min(t * 100 + 1, 100)}%`} stopColor={STAR} stopOpacity="0.18" />
              <stop offset="100%" stopColor={STAR} stopOpacity="0.18" />
            </linearGradient>
            <radialGradient id="markerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={EMBER_BRIGHT} stopOpacity="1" />
              <stop offset="40%" stopColor={EMBER} stopOpacity="0.6" />
              <stop offset="100%" stopColor={EMBER} stopOpacity="0" />
            </radialGradient>
            <filter id="markerBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          {/* Faint full arc — the unwalked path */}
          <path
            d={`M ${CX - ARC_R} ${CY} A ${ARC_R} ${ARC_R} 0 0 1 ${CX + ARC_R} ${CY}`}
            stroke={`${STAR}33`}
            strokeWidth={1}
            fill="none"
          />
          {/* Glowing arc — the walked + current path */}
          <path
            d={`M ${CX - ARC_R} ${CY} A ${ARC_R} ${ARC_R} 0 0 1 ${markerX} ${markerY}`}
            stroke="url(#arcGrad)"
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
          />

          {/* Horizon-end marks: tiny crescents at the two ends */}
          <text x={CX - ARC_R - 6} y={H - 6} fontSize={10} fill={`${STAR}77`} textAnchor="end">
            Asr
          </text>
          <text x={CX + ARC_R + 6} y={H - 6} fontSize={10} fill={`${STAR}77`} textAnchor="start">
            Isha
          </text>

          {/* Marker — current "now" position with halo */}
          <circle cx={markerX} cy={markerY} r={14} fill="url(#markerGlow)" filter="url(#markerBlur)" />
          <circle cx={markerX} cy={markerY} r={4.5} fill={EMBER_BRIGHT} />
          <circle cx={markerX} cy={markerY} r={2} fill="#FFF6E0" />
        </svg>

        {/* ── CENTERPIECE ────────────────────────────────────── */}
        <div style={{ marginTop: 6, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* NOW badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 999,
              background: `${EMBER}25`,
              border: `1px solid ${EMBER}66`,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: EMBER_BRIGHT,
                boxShadow: `0 0 6px ${EMBER_BRIGHT}`,
              }}
            />
            <div
              style={{
                fontSize: 9,
                letterSpacing: 1.6,
                fontWeight: 700,
                color: EMBER_BRIGHT,
                textTransform: "uppercase",
              }}
            >
              Now Praying
            </div>
          </div>

          {/* Big Arabic — calligraphic centerpiece */}
          <div
            style={{
              fontFamily: "'Amiri Quran', 'Amiri', serif",
              fontSize: 56,
              lineHeight: 1.1,
              color: "#FFF6E0",
              textShadow: `0 2px 20px ${EMBER}88, 0 0 40px ${EMBER}44`,
              marginBottom: 4,
            }}
            dir="rtl"
            lang="ar"
          >
            {PRAYER.arabic}
          </div>

          {/* English name */}
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#F4E4C5",
              letterSpacing: 0.5,
              marginTop: 2,
            }}
          >
            {PRAYER.name}
          </div>

          {/* Time + countdown row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginTop: 14,
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 300,
                color: "#FFF6E0",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: 0.5,
              }}
            >
              {PRAYER.time}
            </div>
            <div
              style={{
                width: 1,
                height: 22,
                background: `${EMBER}55`,
              }}
            />
            <div
              style={{
                padding: "5px 11px",
                borderRadius: 999,
                background: `linear-gradient(135deg, ${EMBER_BRIGHT} 0%, ${EMBER} 100%)`,
                color: "#1A0F00",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.5,
                boxShadow: `0 2px 8px ${EMBER}66`,
              }}
            >
              {PRAYER.remaining}
            </div>
          </div>

          {/* Window-end note */}
          <div
            style={{
              fontSize: 11,
              color: "#F4E4C599",
              marginTop: 10,
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
            }}
          >
            window closes at {PRAYER.windowEnd.time} ({PRAYER.windowEnd.name})
          </div>
        </div>

        {/* ── BOTTOM FILIGREE BAND — ties to the parchment leaves below ── */}
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${EMBER_DIM}40` }}>
          <FiligreeBand />
        </div>

        {/* Bell affordance, top-right */}
        <button
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 32,
            height: 32,
            borderRadius: 10,
            border: `1px solid ${EMBER}44`,
            background: `${EMBER}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Bell size={14} color={EMBER_BRIGHT} />
        </button>
      </div>

      {/* Caption explaining time-of-day responsiveness */}
      <div
        style={{
          marginTop: 14,
          padding: "10px 14px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          fontSize: 11,
          lineHeight: 1.5,
          color: APP_TEXT_DIM,
          fontStyle: "italic",
        }}
      >
        Mockup shows <strong style={{ color: EMBER_BRIGHT, fontStyle: "normal" }}>Maghrib</strong> palette.
        Real card shifts tones through the day:
        Fajr (deep indigo · rose horizon) · Dhuhr (high golden noon) ·
        Asr (warm amber) · Maghrib (sunset ember) · Isha (deep navy · star violet).
      </div>
    </div>
  );
}

// ── decorative bits ───────────────────────────────────────────────

function Stars() {
  // Fixed positions — predictable, not too many
  const stars = [
    { x: 12, y: 18, r: 0.8, o: 0.6 },
    { x: 48, y: 32, r: 0.5, o: 0.4 },
    { x: 88, y: 14, r: 0.7, o: 0.5 },
    { x: 142, y: 40, r: 0.6, o: 0.45 },
    { x: 198, y: 22, r: 0.9, o: 0.7 },
    { x: 246, y: 50, r: 0.5, o: 0.4 },
    { x: 290, y: 18, r: 0.7, o: 0.55 },
    { x: 332, y: 36, r: 0.6, o: 0.45 },
    { x: 24, y: 60, r: 0.4, o: 0.3 },
    { x: 312, y: 62, r: 0.5, o: 0.4 },
  ];
  return (
    <svg
      style={{
        position: "absolute",
        top: 4,
        left: 0,
        right: 0,
        width: "100%",
        height: 90,
        pointerEvents: "none",
      }}
      viewBox="0 0 358 90"
    >
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={STAR} opacity={s.o} />
      ))}
    </svg>
  );
}

function FiligreeBand() {
  // Hand-drawn-feel filigree: small linked motifs along a baseline.
  // Same gold-brown family as the parchment leaves' rule, but rendered on dark.
  return (
    <svg width="100%" height="14" viewBox="0 0 320 14" preserveAspectRatio="none">
      <defs>
        <linearGradient id="filigreeFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={FILIGREE} stopOpacity="0" />
          <stop offset="20%" stopColor={FILIGREE} stopOpacity="0.7" />
          <stop offset="80%" stopColor={FILIGREE} stopOpacity="0.7" />
          <stop offset="100%" stopColor={FILIGREE} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Baseline */}
      <line x1="0" y1="7" x2="320" y2="7" stroke="url(#filigreeFade)" strokeWidth="0.5" />
      {/* Repeating motif — small loops */}
      {Array.from({ length: 9 }).map((_, i) => {
        const x = 40 + i * 30;
        return (
          <g key={i} stroke={FILIGREE} strokeWidth="0.7" fill="none" opacity={0.65}>
            <path d={`M ${x - 4} 7 Q ${x} 1 ${x + 4} 7`} />
            <path d={`M ${x - 4} 7 Q ${x} 13 ${x + 4} 7`} />
            <circle cx={x} cy={7} r="0.6" fill={FILIGREE} stroke="none" />
          </g>
        );
      })}
      {/* Larger center medallion */}
      <g transform="translate(160, 7)" stroke={FILIGREE} strokeWidth="0.8" fill="none" opacity={0.85}>
        <circle r="3.5" />
        <circle r="1.4" fill={FILIGREE} stroke="none" />
      </g>
    </svg>
  );
}
