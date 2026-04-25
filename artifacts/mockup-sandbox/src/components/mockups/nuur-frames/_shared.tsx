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
  /** Foreground tone for text and the nuur mark. */
  tone: "ink" | "cream";
  /** Accent color for the small top label. Defaults from tone. */
  accent?: string;
};

const PANEL_POS: Record<PanelIndex, string> = {
  0: "0% 0%",
  1: "50% 0%",
  2: "100% 0%",
  3: "0% 100%",
  4: "50% 100%",
  5: "100% 100%",
};

function NuurMark({ color, dim }: { color: string; dim: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        fontFamily: SANS_FONT,
        fontSize: 9.5,
        letterSpacing: "0.5em",
        textTransform: "lowercase",
        color: dim,
        fontWeight: 500,
        paddingLeft: "0.5em",
      }}
    >
      <span>nuur</span>
      <span
        style={{
          width: 3,
          height: 3,
          borderRadius: 999,
          background: color,
          opacity: 0.95,
        }}
      />
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
  // BASE_URL may or may not include a trailing slash — normalize to exactly one.
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  const refImg = `${base}/nuur-frames-ref.png`;

  const ink = tone === "ink";
  const fg = ink ? "#2A2018" : "#F4ECD8";
  const fgDim = ink ? "rgba(42,32,24,0.72)" : "rgba(244,236,216,0.78)";
  const accentColor = accent ?? (ink ? "#7A5A2E" : "#D4A24A");
  const shadow = ink
    ? "none"
    : "0 2px 16px rgba(0,0,0,0.55)";

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
      {/* Inner content sits inside the arch — keep generous side padding so
          we never paint over the frame's botanical/architectural margins. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "98px 96px 70px 96px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: fg,
        }}
      >
        <div
          style={{
            fontFamily: SANS_FONT,
            fontSize: 9.5,
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: accentColor,
            opacity: 0.95,
            textShadow: ink ? "none" : "0 1px 4px rgba(0,0,0,0.35)",
          }}
        >
          {topLabel}
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            fontFamily: ARABIC_FONT,
            fontSize: 30,
            lineHeight: 1.85,
            direction: "rtl",
            fontWeight: 400,
            color: fg,
            textShadow: shadow,
          }}
        >
          {arabic}
        </div>

        <div
          style={{
            marginTop: 22,
            fontFamily: SERIF_FONT,
            fontSize: 16.5,
            lineHeight: 1.5,
            color: fgDim,
            fontStyle: "italic",
            maxWidth: 320,
            textShadow: ink ? "none" : "0 1px 6px rgba(0,0,0,0.35)",
          }}
        >
          {english}
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            fontFamily: SANS_FONT,
            fontSize: 9,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: fgDim,
            marginBottom: 14,
            textShadow: ink ? "none" : "0 1px 4px rgba(0,0,0,0.35)",
          }}
        >
          {reference}
        </div>
        <NuurMark color={accentColor} dim={fgDim} />
      </div>
    </div>
  );
}
