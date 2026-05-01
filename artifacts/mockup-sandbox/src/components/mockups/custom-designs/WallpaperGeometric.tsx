import React, { useId } from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

const NAVY = "#0E1A2D";
const NAVY_DEEP = "#070F1C";
const TEXT = "#F1E2B7";
const TEXT_DIM = "rgba(241, 226, 183, 0.72)";
const GOLD = "#D4AC55";

/**
 * 9:16 phone wallpaper — deep midnight navy with a tessellation of 8-point
 * Islamic stars, fading to a clear vignette in the middle for legibility.
 * Features Surah Ar-Ra'd 13:28 about hearts finding rest in remembrance.
 */
export function WallpaperGeometric() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${NAVY} 0%, ${NAVY_DEEP} 100%)`,
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: TEXT,
      }}
    >
      {/* Tessellated 8-point star field */}
      <StarTessellation color={GOLD} />

      {/* Soft vignette over the middle so text reads clearly */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 70% 45% at 50% 52%, ${NAVY_DEEP} 0%, rgba(7,15,28,0.85) 30%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Top eyebrow */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 9.5,
          letterSpacing: "0.4em",
          color: TEXT_DIM,
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        Surah Ar-Ra'd · 13:28
      </div>

      {/* Center content */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          transform: "translateY(-50%)",
          padding: "0 36px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Amiri Quran', 'Amiri', serif",
            fontSize: 26,
            lineHeight: 1.85,
            direction: "rtl",
            color: TEXT,
            whiteSpace: "pre-line",
            textShadow: "0 2px 16px rgba(0,0,0,0.7)",
          }}
        >
          {"أَلَا بِذِكْرِ اللَّهِ\nتَطْمَئِنُّ الْقُلُوبُ"}
        </div>

        {/* Centered ornament divider */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
          <CenterOrnament color={GOLD} />
        </div>

        <div
          style={{
            marginTop: 26,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: 16,
            lineHeight: 1.55,
            color: TEXT,
            opacity: 0.95,
            textShadow: "0 1px 10px rgba(0,0,0,0.7)",
          }}
        >
          “Truly, in the remembrance of Allah
          <br />
          do hearts find rest.”
        </div>
      </div>

      {/* Brand footer */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 28,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <NuurBrandFooter color={GOLD} dim={TEXT_DIM} />
      </div>
    </div>
  );
}

/**
 * Repeating 8-point star tile pattern.
 * Hand-rolled SVG pattern with two overlapping squares (rotated 45°).
 */
function StarTessellation({ color }: { color: string }) {
  // useId keeps the pattern id unique even if multiple instances mount in
  // the same DOM tree (e.g. multiple wallpapers in a single page).
  const patternId = `eight-point-star-${useId()}`;
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.32,
      }}
      aria-hidden
    >
      <defs>
        <pattern
          id={patternId}
          x="0"
          y="0"
          width="72"
          height="72"
          patternUnits="userSpaceOnUse"
        >
          {/* Star formed by two overlapping squares */}
          <g transform="translate(36, 36)">
            <rect
              x="-18"
              y="-18"
              width="36"
              height="36"
              fill="none"
              stroke={color}
              strokeWidth="0.7"
            />
            <rect
              x="-18"
              y="-18"
              width="36"
              height="36"
              fill="none"
              stroke={color}
              strokeWidth="0.7"
              transform="rotate(45)"
            />
            <circle cx="0" cy="0" r="1.4" fill={color} opacity="0.7" />
          </g>
          {/* Connecting hairlines */}
          <line
            x1="0"
            y1="36"
            x2="72"
            y2="36"
            stroke={color}
            strokeWidth="0.4"
            opacity="0.4"
          />
          <line
            x1="36"
            y1="0"
            x2="36"
            y2="72"
            stroke={color}
            strokeWidth="0.4"
            opacity="0.4"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function CenterOrnament({ color }: { color: string }) {
  return (
    <svg width="100" height="14" viewBox="0 0 100 14" fill="none" aria-hidden>
      <line x1="2" y1="7" x2="38" y2="7" stroke={color} strokeWidth="0.7" opacity="0.6" />
      <g transform="translate(50, 7)">
        <rect
          x="-4"
          y="-4"
          width="8"
          height="8"
          fill="none"
          stroke={color}
          strokeWidth="0.9"
        />
        <rect
          x="-4"
          y="-4"
          width="8"
          height="8"
          fill="none"
          stroke={color}
          strokeWidth="0.9"
          transform="rotate(45)"
        />
      </g>
      <line x1="62" y1="7" x2="98" y2="7" stroke={color} strokeWidth="0.7" opacity="0.6" />
    </svg>
  );
}
