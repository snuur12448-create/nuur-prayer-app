import { Bell } from "lucide-react";
import { PALETTES, PRAYERS, type PrayerKey } from "./_palettes";

const APP_BG = "#0A1F12";
const APP_TEXT_DIM = "#7A9986";
const STAR = "#F4E4C5";
const FILIGREE = "#C9933A";

const PALETTE_LABELS: Record<PrayerKey, string> = {
  fajr: "Fajr — pre-dawn (deep indigo · rose horizon)",
  dhuhr: "Dhuhr — high noon (teal sky · golden horizon)",
  asr: "Asr — late afternoon (warm amber)",
  maghrib: "Maghrib — sunset (ember red · aubergine)",
  isha: "Isha — night (deep navy · star-violet · many stars)",
};

export function CelestialArcCard({ prayerKey }: { prayerKey: PrayerKey }) {
  const palette = PALETTES[prayerKey];
  const prayer = PRAYERS[prayerKey];

  const W = 358;
  const H = 90;
  const ARC_R = 220;
  const CX = W / 2;
  const CY = H + 130;

  const t = prayer.windowProgress;
  const angle = Math.PI + t * Math.PI;
  const markerX = CX + ARC_R * Math.cos(angle);
  const markerY = CY + ARC_R * Math.sin(angle);

  const arcGradId = `arcGrad-${prayerKey}`;
  const markerGlowId = `markerGlow-${prayerKey}`;
  const filterId = `markerBlur-${prayerKey}`;
  const filigreeFadeId = `filigreeFade-${prayerKey}`;

  return (
    <div
      style={{
        backgroundColor: APP_BG,
        minHeight: "100vh",
        padding: "32px 16px 24px",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#E8F1EA",
        WebkitFontSmoothing: "antialiased",
      }}
    >
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
        Hero · {prayer.name}
      </div>

      <div
        style={{
          position: "relative",
          borderRadius: 18,
          overflow: "hidden",
          background: `linear-gradient(180deg, ${palette.skyTop} 0%, ${palette.skyMid} 55%, ${palette.skyHorizon} 100%)`,
          border: `1px solid ${palette.emberDim}55`,
          boxShadow: `
            0 18px 40px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.06),
            inset 0 -40px 60px ${hexA(palette.skyHorizon, palette.horizonGlowAlpha)}
          `,
          padding: "20px 22px 18px",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -40,
            right: -40,
            bottom: -60,
            height: 140,
            background: `radial-gradient(ellipse at 50% 100%, ${palette.ember}55 0%, ${palette.ember}00 70%)`,
            opacity: palette.horizonGlowAlpha * 1.5,
            pointerEvents: "none",
          }}
        />

        <Stars count={palette.starCount} opacityScale={palette.starOpacity} />

        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          style={{ display: "block", marginTop: 4, overflow: "visible" }}
        >
          <defs>
            <linearGradient id={arcGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={STAR} stopOpacity="0.18" />
              <stop offset={`${t * 100}%`} stopColor={palette.emberBright} stopOpacity="0.95" />
              <stop offset={`${Math.min(t * 100 + 1, 100)}%`} stopColor={STAR} stopOpacity="0.18" />
              <stop offset="100%" stopColor={STAR} stopOpacity="0.18" />
            </linearGradient>
            <radialGradient id={markerGlowId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={palette.emberBright} stopOpacity="1" />
              <stop offset="40%" stopColor={palette.ember} stopOpacity="0.6" />
              <stop offset="100%" stopColor={palette.ember} stopOpacity="0" />
            </radialGradient>
            <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          <path
            d={`M ${CX - ARC_R} ${CY} A ${ARC_R} ${ARC_R} 0 0 1 ${CX + ARC_R} ${CY}`}
            stroke={`${STAR}33`}
            strokeWidth={1}
            fill="none"
          />
          <path
            d={`M ${CX - ARC_R} ${CY} A ${ARC_R} ${ARC_R} 0 0 1 ${markerX} ${markerY}`}
            stroke={`url(#${arcGradId})`}
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
          />

          <text x={CX - ARC_R - 6} y={H - 6} fontSize={10} fill={`${STAR}77`} textAnchor="end">
            {prayer.prevLabel}
          </text>
          <text x={CX + ARC_R + 6} y={H - 6} fontSize={10} fill={`${STAR}77`} textAnchor="start">
            {prayer.nextLabel}
          </text>

          <circle cx={markerX} cy={markerY} r={14} fill={`url(#${markerGlowId})`} filter={`url(#${filterId})`} />
          <circle cx={markerX} cy={markerY} r={4.5} fill={palette.emberBright} />
          <circle cx={markerX} cy={markerY} r={2} fill="#FFFFFF" />
        </svg>

        <div style={{ marginTop: 6, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 999,
              background: `${palette.ember}25`,
              border: `1px solid ${palette.ember}66`,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: palette.emberBright,
                boxShadow: `0 0 6px ${palette.emberBright}`,
              }}
            />
            <div
              style={{
                fontSize: 9,
                letterSpacing: 1.6,
                fontWeight: 700,
                color: palette.emberBright,
                textTransform: "uppercase",
              }}
            >
              Now Praying
            </div>
          </div>

          <div
            style={{
              fontFamily: "'Amiri Quran', 'Amiri', serif",
              fontSize: 56,
              lineHeight: 1.1,
              color: palette.arabicTextColor,
              textShadow: `0 2px 20px ${palette.ember}88, 0 0 40px ${palette.ember}44`,
              marginBottom: 4,
            }}
            dir="rtl"
            lang="ar"
          >
            {prayer.arabic}
          </div>

          <div style={{ fontSize: 16, fontWeight: 600, color: "#F4E4C5", letterSpacing: 0.5, marginTop: 2 }}>
            {prayer.name}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 300,
                color: palette.arabicTextColor,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: 0.5,
              }}
            >
              {prayer.time}
            </div>
            <div style={{ width: 1, height: 22, background: `${palette.ember}55` }} />
            <div
              style={{
                padding: "5px 11px",
                borderRadius: 999,
                background: `linear-gradient(135deg, ${palette.emberBright} 0%, ${palette.ember} 100%)`,
                color: "#1A0F00",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.5,
                boxShadow: `0 2px 8px ${palette.ember}66`,
              }}
            >
              {prayer.remaining}
            </div>
          </div>

          <div
            style={{
              fontSize: 11,
              color: "#F4E4C599",
              marginTop: 10,
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            {prayer.windowNote}
          </div>
        </div>

        <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${palette.emberDim}40` }}>
          <FiligreeBand fadeId={filigreeFadeId} />
        </div>

        <button
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 32,
            height: 32,
            borderRadius: 10,
            border: `1px solid ${palette.ember}44`,
            background: `${palette.ember}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Bell size={14} color={palette.emberBright} />
        </button>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: "9px 13px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          fontSize: 11,
          lineHeight: 1.5,
          color: APP_TEXT_DIM,
          fontStyle: "italic",
        }}
      >
        Palette: <strong style={{ color: palette.emberBright, fontStyle: "normal" }}>{PALETTE_LABELS[prayerKey]}</strong>
      </div>
    </div>
  );
}

function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function Stars({ count, opacityScale }: { count: number; opacityScale: number }) {
  if (count === 0) return null;
  const slots = [
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
    { x: 60, y: 8, r: 0.6, o: 0.5 },
    { x: 110, y: 56, r: 0.5, o: 0.4 },
    { x: 168, y: 68, r: 0.4, o: 0.35 },
    { x: 220, y: 8, r: 0.7, o: 0.55 },
    { x: 264, y: 28, r: 0.4, o: 0.35 },
    { x: 304, y: 48, r: 0.5, o: 0.4 },
    { x: 78, y: 46, r: 0.4, o: 0.3 },
    { x: 184, y: 14, r: 0.5, o: 0.4 },
    { x: 232, y: 70, r: 0.6, o: 0.45 },
    { x: 348, y: 22, r: 0.4, o: 0.35 },
    { x: 4, y: 38, r: 0.5, o: 0.4 },
    { x: 124, y: 26, r: 0.6, o: 0.5 },
  ];
  const stars = slots.slice(0, count);
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
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#F4E4C5" opacity={s.o * opacityScale} />
      ))}
    </svg>
  );
}

function FiligreeBand({ fadeId }: { fadeId: string }) {
  return (
    <svg width="100%" height="14" viewBox="0 0 320 14" preserveAspectRatio="none">
      <defs>
        <linearGradient id={fadeId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={FILIGREE} stopOpacity="0" />
          <stop offset="20%" stopColor={FILIGREE} stopOpacity="0.7" />
          <stop offset="80%" stopColor={FILIGREE} stopOpacity="0.7" />
          <stop offset="100%" stopColor={FILIGREE} stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1="7" x2="320" y2="7" stroke={`url(#${fadeId})`} strokeWidth="0.5" />
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
      <g transform="translate(160, 7)" stroke={FILIGREE} strokeWidth="0.8" fill="none" opacity={0.85}>
        <circle r="3.5" />
        <circle r="1.4" fill={FILIGREE} stroke="none" />
      </g>
    </svg>
  );
}
