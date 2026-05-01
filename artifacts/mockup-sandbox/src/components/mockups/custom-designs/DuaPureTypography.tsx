import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

const PARCHMENT = "#F4ECD7";
const INK = "#3A2D1A";
const GOLD = "#A4853F";
const INK_DIM = "rgba(58, 45, 26, 0.62)";

export function DuaPureTypography() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: PARCHMENT,
        backgroundImage: `
          radial-gradient(ellipse 70% 50% at 30% 20%, rgba(164,133,63,0.07) 0%, transparent 65%),
          radial-gradient(ellipse 80% 50% at 70% 85%, rgba(58,45,26,0.06) 0%, transparent 70%)
        `,
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: INK,
        display: "flex",
        flexDirection: "column",
        padding: "76px 40px 36px",
      }}
    >
      {/* Top ornament */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
        <Ornament color={GOLD} />
      </div>

      {/* Eyebrow */}
      <div
        style={{
          textAlign: "center",
          fontSize: 9.5,
          letterSpacing: "0.36em",
          color: INK_DIM,
          textTransform: "uppercase",
          marginBottom: 40,
          fontWeight: 500,
        }}
      >
        Daily Dhikr
      </div>

      {/* Arabic — hero */}
      <div
        style={{
          fontFamily: "'Amiri Quran', 'Amiri', serif",
          fontSize: 25,
          lineHeight: 1.95,
          direction: "rtl",
          textAlign: "center",
          color: INK,
          marginBottom: 36,
          whiteSpace: "pre-line",
        }}
      >
        {"اللَّهُمَّ أَنْتَ السَّلَامُ\nوَمِنْكَ السَّلَامُ\nتَبَارَكْتَ يَا ذَا الْجَلَالِ\nوَالْإِكْرَامِ"}
      </div>

      {/* Hairline divider */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
        <div style={{ width: 36, height: 1, background: GOLD, opacity: 0.55 }} />
      </div>

      {/* English */}
      <div
        style={{
          fontFamily: "'Cormorant Garamond', 'Libre Baskerville', serif",
          fontStyle: "italic",
          fontSize: 16,
          lineHeight: 1.55,
          textAlign: "center",
          color: INK,
          opacity: 0.9,
          padding: "0 8px",
        }}
      >
        “O Allah, You are Peace, and from You comes Peace. Blessed are You,
        Possessor of Majesty and Honor.”
      </div>

      {/* Source */}
      <div
        style={{
          marginTop: 20,
          textAlign: "center",
          fontSize: 9,
          letterSpacing: "0.26em",
          color: INK_DIM,
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        Muslim · Daily Adhkar
      </div>

      <div style={{ flex: 1 }} />

      <NuurBrandFooter color={GOLD} dim={INK_DIM} />
    </div>
  );
}

function Ornament({ color }: { color: string }) {
  return (
    <svg width="92" height="14" viewBox="0 0 92 14" fill="none" aria-hidden>
      <line x1="2" y1="7" x2="34" y2="7" stroke={color} strokeWidth="0.6" opacity="0.55" />
      <circle cx="46" cy="7" r="3.2" fill="none" stroke={color} strokeWidth="0.8" />
      <circle cx="46" cy="7" r="1.2" fill={color} />
      <line x1="58" y1="7" x2="90" y2="7" stroke={color} strokeWidth="0.6" opacity="0.55" />
    </svg>
  );
}
