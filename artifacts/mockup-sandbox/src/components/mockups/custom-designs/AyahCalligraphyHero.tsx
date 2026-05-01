import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

const IVORY = "#F1E9D2";
const INK = "#1F1A12";
const GOLD = "#B8943C";
const INK_DIM = "rgba(31, 26, 18, 0.55)";

export function AyahCalligraphyHero() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: IVORY,
        backgroundImage: `
          radial-gradient(ellipse 100% 60% at 50% 0%, rgba(184,148,60,0.08) 0%, transparent 70%),
          radial-gradient(ellipse 100% 60% at 50% 100%, rgba(31,26,18,0.06) 0%, transparent 70%)
        `,
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: INK,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top frame: minimal eyebrow */}
      <div style={{ paddingTop: 56, paddingInline: 40 }}>
        <div
          style={{
            textAlign: "center",
            fontSize: 9,
            letterSpacing: "0.42em",
            color: INK_DIM,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Surah Al-Ikhlas · 112:1
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <CornerOrnament color={GOLD} />
        </div>
      </div>

      {/* HERO: enormous calligraphy */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
          position: "relative",
        }}
      >
        {/* Subtle glow behind calligraphy */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(184,148,60,0.10) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            fontFamily: "'Amiri Quran', 'Amiri', serif",
            fontSize: 56,
            lineHeight: 1.4,
            direction: "rtl",
            textAlign: "center",
            color: INK,
            position: "relative",
            whiteSpace: "pre-line",
          }}
        >
          {"قُلْ هُوَ\nٱللَّهُ أَحَدٌ"}
        </div>
      </div>

      {/* English + source */}
      <div style={{ paddingInline: 40, paddingBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
          <CornerOrnament color={GOLD} flip />
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', 'Libre Baskerville', serif",
            fontStyle: "italic",
            fontSize: 17,
            lineHeight: 1.5,
            textAlign: "center",
            color: INK,
            opacity: 0.92,
          }}
        >
          “Say, He is Allah — the One.”
        </div>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <NuurBrandFooter color={GOLD} dim={INK_DIM} />
        </div>
      </div>
    </div>
  );
}

function CornerOrnament({
  color,
  flip = false,
}: {
  color: string;
  flip?: boolean;
}) {
  return (
    <svg
      width="120"
      height="16"
      viewBox="0 0 120 16"
      fill="none"
      style={{ transform: flip ? "scaleY(-1)" : undefined }}
      aria-hidden
    >
      <path
        d="M 4 8 L 44 8"
        stroke={color}
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M 76 8 L 116 8"
        stroke={color}
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M 50 8 Q 60 -2 70 8 Q 60 14 50 8 Z"
        fill="none"
        stroke={color}
        strokeWidth="0.9"
      />
      <circle cx="60" cy="8" r="1.4" fill={color} />
    </svg>
  );
}
