import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

const TEXT = "#F8EBC8";
const TEXT_DIM = "rgba(248, 235, 200, 0.78)";
const GOLD = "#F5C46B";

export function WallpaperTwilightHorizon() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        // Sunset gradient: deep night purple → magenta → coral → warm horizon
        background: `linear-gradient(
          180deg,
          #1B0E2C 0%,
          #2F1647 18%,
          #5A2750 38%,
          #9A3F4E 56%,
          #D67B41 74%,
          #E8A85A 86%,
          #F0C674 96%,
          #2E1F1A 100%
        )`,
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: TEXT,
      }}
    >
      {/* Stars in the upper purple band */}
      <Stars />

      {/* Sun glow at horizon line */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "78%",
          width: 280,
          height: 280,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,220,150,0.35) 0%, rgba(255,180,100,0.12) 35%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Mountain silhouette at horizon */}
      <svg
        viewBox="0 0 432 200"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 88,
          width: "100%",
          height: 200,
          pointerEvents: "none",
        }}
        aria-hidden
      >
        <path
          d="M 0 200 L 0 130 L 50 90 L 110 120 L 170 70 L 230 110 L 290 80 L 360 115 L 432 95 L 432 200 Z"
          fill="rgba(20, 8, 18, 0.85)"
        />
        <path
          d="M 0 200 L 0 165 L 70 145 L 140 160 L 210 140 L 280 158 L 360 142 L 432 155 L 432 200 Z"
          fill="rgba(8, 4, 12, 0.95)"
        />
      </svg>

      {/* Content positioned in the upper third (above lock-screen widgets) */}
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 0,
          right: 0,
          padding: "0 36px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.4em",
            color: TEXT_DIM,
            textTransform: "uppercase",
            marginBottom: 18,
            fontWeight: 500,
            textShadow: "0 1px 8px rgba(0,0,0,0.4)",
          }}
        >
          A Dua for Steadfastness
        </div>

        <div
          style={{
            fontFamily: "'Amiri Quran', 'Amiri', serif",
            fontSize: 28,
            lineHeight: 1.75,
            direction: "rtl",
            color: TEXT,
            whiteSpace: "pre-line",
            textShadow: "0 2px 14px rgba(0,0,0,0.5)",
          }}
        >
          {"يَا مُقَلِّبَ الْقُلُوبِ\nثَبِّتْ قَلْبِي عَلَىٰ دِينِكَ"}
        </div>

        <div
          style={{
            marginTop: 22,
            width: 36,
            height: 1,
            background: GOLD,
            opacity: 0.75,
            margin: "22px auto 0",
            boxShadow: "0 0 8px rgba(245,196,107,0.5)",
          }}
        />

        <div
          style={{
            marginTop: 22,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: 15,
            lineHeight: 1.5,
            color: TEXT,
            opacity: 0.95,
            textShadow: "0 1px 8px rgba(0,0,0,0.5)",
          }}
        >
          “O Turner of Hearts,
          <br />
          keep my heart firm upon Your religion.”
        </div>

        <div
          style={{
            marginTop: 14,
            fontSize: 9,
            letterSpacing: "0.28em",
            color: TEXT_DIM,
            textTransform: "uppercase",
            textShadow: "0 1px 6px rgba(0,0,0,0.5)",
          }}
        >
          Tirmidhi · Daily Adhkar
        </div>
      </div>

      {/* Dark fade at the very bottom so the brand footer reads clearly
          against the bright horizon band */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 130,
          background:
            "linear-gradient(180deg, transparent 0%, rgba(15,8,20,0.4) 50%, rgba(10,5,15,0.85) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Brand footer at very bottom */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 24,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <NuurBrandFooter color="#F5C46B" dim="rgba(248, 235, 200, 0.85)" />
      </div>
    </div>
  );
}

/** A field of small stars in the upper twilight band. */
function Stars() {
  // Pseudo-random but deterministic positions so the pattern is stable.
  const stars = [
    { x: 38, y: 30, r: 0.8, o: 0.7 },
    { x: 88, y: 50, r: 1.2, o: 0.9 },
    { x: 132, y: 28, r: 0.6, o: 0.55 },
    { x: 172, y: 62, r: 1.0, o: 0.8 },
    { x: 218, y: 22, r: 0.7, o: 0.6 },
    { x: 254, y: 48, r: 0.9, o: 0.7 },
    { x: 296, y: 72, r: 1.3, o: 0.95 },
    { x: 340, y: 36, r: 0.6, o: 0.55 },
    { x: 380, y: 58, r: 1.0, o: 0.75 },
    { x: 60, y: 86, r: 0.7, o: 0.5 },
    { x: 200, y: 92, r: 0.8, o: 0.55 },
    { x: 360, y: 96, r: 0.7, o: 0.5 },
  ];
  return (
    <svg
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: 120,
        pointerEvents: "none",
      }}
      aria-hidden
    >
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFE9B5" opacity={s.o} />
      ))}
    </svg>
  );
}
