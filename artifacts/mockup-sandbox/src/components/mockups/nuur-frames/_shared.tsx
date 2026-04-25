import React from "react";

const ARABIC_FONT = "'Amiri Quran', 'Amiri', serif";
const SERIF_FONT = "'Cormorant Garamond', 'Libre Baskerville', serif";
const SANS_FONT = "'Inter', system-ui, sans-serif";

export type PanelIndex = 0 | 1 | 2 | 3 | 4 | 5;

export type FramedCardProps = {
  panel: PanelIndex;
  topLabel: string;
  arabic: string;
  english: string;
  reference: string;
  /** Foreground tone for text and the Nuur lockup. */
  tone: "ink" | "cream";
  /** Optional override for the gold accent (defaults vary by tone). */
  accent?: string;
};

/** Per-panel background-position for our 3×2 atlas. */
const PANEL_POS: Record<PanelIndex, string> = {
  0: "0% 0%",
  1: "50% 0%",
  2: "100% 0%",
  3: "0% 100%",
  4: "50% 100%",
  5: "100% 100%",
};

/**
 * Approximate "safe area" inside each arch — measured against the 512×512
 * source panels. We pad generously enough that the top apex ornament and the
 * outer botanical / architectural decoration are never overlapped.
 *
 * Defaults work for all six panels; per-panel overrides fine-tune the few
 * panels whose arch interior is offset (e.g. Frame06 has the minaret cluster
 * pushing the safe area slightly inward on the right).
 */
const SAFE_INSET: Record<PanelIndex, { t: number; r: number; b: number; l: number }> = {
  0: { t: 132, r: 118, b: 78, l: 118 },
  1: { t: 132, r: 118, b: 80, l: 118 },
  2: { t: 132, r: 130, b: 80, l: 118 },
  3: { t: 132, r: 118, b: 82, l: 118 },
  4: { t: 138, r: 118, b: 82, l: 118 },
  5: { t: 132, r: 138, b: 82, l: 118 },
};

/**
 * The proper Nuur lockup, scaled down for share-card use:
 *   ◆  small gold mark
 *   NUUR (letter-spaced wordmark)
 *   Light for your daily deen (italic tagline)
 */
function NuurLockup({
  fg,
  fgDim,
  accent,
  tone,
}: {
  fg: string;
  fgDim: string;
  accent: string;
  tone: "ink" | "cream";
}) {
  const shadow = tone === "ink" ? "none" : "0 1px 4px rgba(0,0,0,0.4)";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      {/* Mark — a small 8-point starburst echoing the in-app NuurLogo */}
      <svg
        viewBox="0 0 24 24"
        width={14}
        height={14}
        style={{ marginBottom: 2, filter: tone === "ink" ? "none" : "drop-shadow(0 1px 3px rgba(0,0,0,0.4))" }}
        aria-hidden
      >
        <g stroke={accent} strokeWidth={1.1} fill="none" opacity={0.95}>
          <circle cx={12} cy={12} r={3.2} fill={`${accent}33`} />
          {[0, 45, 90, 135].map((a) => (
            <line
              key={a}
              x1={12}
              y1={4.5}
              x2={12}
              y2={6.8}
              transform={`rotate(${a} 12 12)`}
            />
          ))}
          {[0, 45, 90, 135].map((a) => (
            <line
              key={`o${a}`}
              x1={12}
              y1={17.2}
              x2={12}
              y2={19.5}
              transform={`rotate(${a} 12 12)`}
            />
          ))}
        </g>
      </svg>
      <div
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 700,
          fontSize: 10.5,
          letterSpacing: "0.55em",
          paddingLeft: "0.55em", // optical centering against tracking
          color: accent,
          textShadow: shadow,
        }}
      >
        NUUR
      </div>
      <div
        style={{
          fontFamily: SERIF_FONT,
          fontStyle: "italic",
          fontSize: 9.5,
          letterSpacing: "0.04em",
          color: fgDim,
          textShadow: shadow,
        }}
      >
        Light for your daily deen
      </div>
    </div>
  );
}

export function FramedCard({
  panel,
  topLabel,
  arabic,
  english,
  reference,
  tone,
  accent,
}: FramedCardProps) {
  // BASE_URL may or may not include a trailing slash — normalize.
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  const refImg = `${base}/nuur-frames-ref.png`;

  const ink = tone === "ink";
  const fg = ink ? "#2A2018" : "#F4ECD8";
  const fgDim = ink ? "rgba(42,32,24,0.72)" : "rgba(244,236,216,0.78)";
  const accentColor = accent ?? (ink ? "#7A5A2E" : "#D4A24A");
  const shadow = ink ? "none" : "0 2px 14px rgba(0,0,0,0.55)";
  const safe = SAFE_INSET[panel];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        margin: 0,
        padding: 0,
        backgroundImage: `url(${refImg})`,
        backgroundSize: "300% 200%",
        backgroundPosition: PANEL_POS[panel],
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: safe.t,
          right: safe.r,
          bottom: safe.b,
          left: safe.l,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: fg,
        }}
      >
        {/* Top label — sits inside the arch, beneath the apex ornament */}
        <div
          style={{
            fontFamily: SANS_FONT,
            fontSize: 9,
            letterSpacing: "0.42em",
            paddingLeft: "0.42em",
            textTransform: "uppercase",
            color: accentColor,
            opacity: 0.95,
            textShadow: ink ? "none" : "0 1px 3px rgba(0,0,0,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          {topLabel}
        </div>

        <div style={{ flex: 1 }} />

        {/* Arabic */}
        <div
          style={{
            fontFamily: ARABIC_FONT,
            fontSize: 28,
            lineHeight: 1.85,
            direction: "rtl",
            fontWeight: 400,
            color: fg,
            textShadow: shadow,
          }}
        >
          {arabic}
        </div>

        {/* English */}
        <div
          style={{
            marginTop: 18,
            fontFamily: SERIF_FONT,
            fontSize: 15.5,
            lineHeight: 1.45,
            color: fgDim,
            fontStyle: "italic",
            maxWidth: 280,
            textShadow: ink ? "none" : "0 1px 5px rgba(0,0,0,0.35)",
          }}
        >
          {english}
        </div>

        {/* Reference */}
        <div
          style={{
            marginTop: 18,
            fontFamily: SANS_FONT,
            fontSize: 8.5,
            letterSpacing: "0.38em",
            paddingLeft: "0.38em",
            textTransform: "uppercase",
            color: fgDim,
            textShadow: ink ? "none" : "0 1px 3px rgba(0,0,0,0.4)",
          }}
        >
          {reference}
        </div>

        <div style={{ flex: 1 }} />

        {/* Hairline rule above the brand lockup */}
        <div
          style={{
            width: 56,
            height: 1,
            background: accentColor,
            opacity: 0.55,
            marginBottom: 10,
          }}
        />

        <NuurLockup fg={fg} fgDim={fgDim} accent={accentColor} tone={tone} />
      </div>
    </div>
  );
}
