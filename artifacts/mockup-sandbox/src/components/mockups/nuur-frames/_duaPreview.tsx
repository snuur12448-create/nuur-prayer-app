import React from "react";

/**
 * Web-side preview that mirrors the actual React-Native `FrameLayout` in
 * `artifacts/islamic-prayer/components/share-card/ShareCard.tsx`. Uses the
 * same per-panel safe insets, font scaling rules, and bgFill letterbox so
 * the canvas mockup is visually faithful to what the mobile app exports.
 *
 * Two modes:
 *   • "card"      → 4 : 5 portrait (1080 × 1350 export)
 *   • "wallpaper" → 9 : 19.5 phone screen (1170 × 2535 export)
 */

const ARABIC_FONT = "'Amiri Quran', 'Amiri', serif";
const SERIF_FONT = "'Cormorant Garamond', 'Libre Baskerville', serif";
const SANS_FONT = "'Inter', system-ui, sans-serif";

type PanelIndex = 0 | 1 | 2 | 3 | 4 | 5;

const PANEL_POS: Record<PanelIndex, string> = {
  0: "0% 0%",
  1: "50% 0%",
  2: "100% 0%",
  3: "0% 100%",
  4: "50% 100%",
  5: "100% 100%",
};

const SAFE_INSET: Record<PanelIndex, { t: number; r: number; b: number; l: number }> = {
  0: { t: 138, r: 130, b: 86, l: 130 },
  1: { t: 138, r: 130, b: 88, l: 130 },
  2: { t: 138, r: 142, b: 86, l: 130 },
  3: { t: 138, r: 130, b: 90, l: 130 },
  4: { t: 144, r: 130, b: 90, l: 130 },
  5: { t: 138, r: 150, b: 90, l: 130 },
};

function fitArabic(text: string, safeWidth: number): number {
  const len = text.length;
  const base = safeWidth * 0.115;
  if (len < 50) return base;
  if (len < 100) return base * 0.86;
  if (len < 180) return base * 0.72;
  if (len < 280) return base * 0.6;
  return base * 0.5;
}

function fitBody(text: string, safeWidth: number): number {
  const len = text.length;
  const base = safeWidth * 0.062;
  if (len < 100) return base;
  if (len < 200) return base * 0.92;
  if (len < 360) return base * 0.84;
  if (len < 540) return base * 0.76;
  return base * 0.7;
}

export function FrameDuaPreview({
  panel,
  tone,
  accent,
  bgFill,
  eyebrow,
  arabic,
  english,
  reference,
  mode,
}: {
  panel: PanelIndex;
  tone: "ink" | "cream";
  accent: string;
  bgFill: string;
  eyebrow: string;
  arabic: string;
  english: string;
  reference: string;
  mode: "card" | "wallpaper";
}) {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  const refImg = `${base}/nuur-frames-ref.png`;

  const ink = tone === "ink";
  const fg = ink ? "#2A2018" : "#F4ECD8";
  const fgDim = ink ? "rgba(42,32,24,0.74)" : "rgba(244,236,216,0.78)";
  const safeRef = SAFE_INSET[panel];

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    margin: 0,
    padding: 0,
    background: bgFill,
    overflow: "hidden",
  };

  // Mirror the React-Native FrameLayout:
  //   • CARD MODE     → painted panel covers the full viewport (no bands).
  //   • WALLPAPER MODE→ painted square sits at top 32 %, bgFill above/below.
  // For card mode, cover-scaling crops ~10 % off the sides of the source PNG.
  // The safe-area maths is computed in source coords (0..512), then clipped
  // to the visible portion before being projected onto the viewport.
  const aspect = mode === "card" ? 5 / 4 : 19.5 / 9;
  // Viewport coordinate system: 100 vw wide, (100 * aspect) vw tall.
  const viewportH = 100 * aspect;

  let panelLeftVw: number;
  let panelTopVw: number;
  let panelSizeVw: number;
  let visibleSrcLeft: number;
  let visibleSrcTop: number;
  let srcToVw: number;

  if (mode === "wallpaper") {
    panelSizeVw    = 100;
    panelLeftVw    = 0;
    panelTopVw     = viewportH * 0.32;
    visibleSrcLeft = 0;
    visibleSrcTop  = 0;
    srcToVw        = panelSizeVw / 512;
  } else {
    // cover-fit a 1:1 panel into a 4:5 viewport.
    srcToVw        = Math.max(100 / 512, viewportH / 512);
    panelSizeVw    = 512 * srcToVw;
    panelLeftVw    = (100 - panelSizeVw) / 2;
    panelTopVw     = (viewportH - panelSizeVw) / 2;
    visibleSrcLeft = -panelLeftVw / srcToVw;
    visibleSrcTop  = -panelTopVw  / srcToVw;
  }

  const srcSafeLeft   = Math.max(safeRef.l, visibleSrcLeft);
  const srcSafeTop    = Math.max(safeRef.t, visibleSrcTop);
  const srcSafeRight  = Math.min(512 - safeRef.r, 512 - visibleSrcLeft);
  const srcSafeBottom = Math.min(512 - safeRef.b, 512 - visibleSrcTop);

  const safeLeftVw   = panelLeftVw + srcSafeLeft   * srcToVw;
  const safeTopVw    = panelTopVw  + srcSafeTop    * srcToVw;
  const safeWidthVw  = (srcSafeRight  - srcSafeLeft) * srcToVw;
  const safeHeightVw = (srcSafeBottom - srcSafeTop) * srcToVw;

  const arabicSizeVw  = fitArabic(arabic, safeWidthVw);
  const bodySizeVw    = fitBody(english, safeWidthVw);
  const eyebrowSizeVw = Math.max(1.6, safeWidthVw * 0.058);
  const refSizeVw     = Math.max(1.4, safeWidthVw * 0.052);

  const textShadow = ink ? "none" : "0 1px 4px rgba(0,0,0,0.5)";

  return (
    <div style={containerStyle}>
      {/* Painted square panel */}
      <div
        style={{
          position: "absolute",
          left:   `${panelLeftVw}vw`,
          top:    `${panelTopVw}vw`,
          width:  `${panelSizeVw}vw`,
          height: `${panelSizeVw}vw`,
          backgroundImage: `url(${refImg})`,
          backgroundSize: "300% 200%",
          backgroundPosition: PANEL_POS[panel],
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Content cluster, inside arch safe area */}
      <div
        style={{
          position: "absolute",
          left:   `${safeLeftVw}vw`,
          top:    `${safeTopVw}vw`,
          width:  `${safeWidthVw}vw`,
          height: `${safeHeightVw}vw`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: fg,
          overflow: "hidden",
        }}
      >
        {/* Top eyebrow */}
        <div
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 700,
            fontSize: `${eyebrowSizeVw}vw`,
            letterSpacing: "0.32em",
            paddingLeft: "0.32em",
            textTransform: "uppercase",
            color: accent,
            textShadow,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
        >
          {eyebrow}
        </div>

        <div style={{ flex: 1 }} />

        {/* Arabic */}
        <div
          style={{
            fontFamily: ARABIC_FONT,
            fontSize: `${arabicSizeVw}vw`,
            lineHeight: 1.85,
            direction: "rtl",
            color: fg,
            textShadow,
          }}
        >
          {arabic}
        </div>

        {/* English */}
        <div
          style={{
            marginTop: "1.6vw",
            fontFamily: SERIF_FONT,
            fontStyle: "italic",
            fontSize: `${bodySizeVw}vw`,
            lineHeight: 1.5,
            color: fgDim,
            textShadow,
          }}
        >
          {english}
        </div>

        {/* Reference */}
        <div
          style={{
            marginTop: "1.6vw",
            fontFamily: SANS_FONT,
            fontSize: `${refSizeVw}vw`,
            letterSpacing: "0.32em",
            paddingLeft: "0.32em",
            textTransform: "uppercase",
            color: fgDim,
            textShadow,
          }}
        >
          {reference}
        </div>

        <div style={{ flex: 1 }} />

        {/* Hairline */}
        <div
          style={{
            width: "18%",
            height: 1,
            background: accent,
            opacity: 0.55,
            marginBottom: "1vw",
          }}
        />

        {/* NUUR lockup */}
        <svg viewBox="0 0 24 24" width="2.4vw" height="2.4vw" aria-hidden>
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
            fontSize: "2vw",
            letterSpacing: "0.55em",
            paddingLeft: "0.55em",
            color: accent,
            textShadow,
            marginTop: "0.4vw",
          }}
        >
          NUUR
        </div>
        <div
          style={{
            fontFamily: SERIF_FONT,
            fontStyle: "italic",
            fontSize: "1.7vw",
            color: fgDim,
            textShadow,
            marginTop: "0.2vw",
          }}
        >
          Light for your daily deen
        </div>
      </div>
    </div>
  );
}
