import React from "react";
import { FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "../nuur-templates/_shared";
import { MihrabArchOutline } from "./_arch";

const BG_TOP = "#E9DEC4";
const BG_BOT = "#D4C19B";
const INK = "#3A3220";
const INK_DIM = "rgba(58,50,32,0.7)";
const GOLD = "#9A7A2E";

function VaseAndLantern() {
  return (
    <svg
      viewBox="0 0 432 220"
      preserveAspectRatio="xMidYMax meet"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 80,
        width: "100%",
        height: 220,
        pointerEvents: "none",
        opacity: 0.92,
      }}
    >
      {/* ground shadow */}
      <ellipse cx="100" cy="200" rx="65" ry="6" fill="rgba(0,0,0,0.18)" />
      <ellipse cx="320" cy="200" rx="55" ry="5" fill="rgba(0,0,0,0.18)" />

      {/* Left: clay vase */}
      <g>
        <path
          d="M 80 200
             C 60 200 50 180 55 160
             C 60 130 65 120 70 110
             L 70 100
             L 130 100
             L 130 110
             C 135 120 140 130 145 160
             C 150 180 140 200 120 200 Z"
          fill="#5B4A33"
        />
        <ellipse cx="100" cy="100" rx="30" ry="6" fill="#3A2E1E" />
        <path
          d="M 70 130 Q 100 138 130 130"
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="1"
          fill="none"
        />
        {/* sprig */}
        <path d="M 100 100 Q 95 70 88 50" stroke="#3F4F2E" strokeWidth="1.4" fill="none" />
        <path d="M 100 100 Q 105 78 112 60" stroke="#3F4F2E" strokeWidth="1.4" fill="none" />
        <ellipse cx="86" cy="52" rx="3" ry="6" fill="#5A6E40" transform="rotate(-30 86 52)" />
        <ellipse cx="114" cy="62" rx="3" ry="6" fill="#5A6E40" transform="rotate(30 114 62)" />
      </g>

      {/* Right: ornate lantern */}
      <g>
        <line x1="320" y1="40" x2="320" y2="60" stroke="#3A2E1E" strokeWidth="1.2" />
        <ellipse cx="320" cy="40" rx="3" ry="2" fill="#3A2E1E" />
        {/* top finial */}
        <path d="M 312 60 L 320 50 L 328 60 Z" fill="#3A2E1E" />
        {/* dome */}
        <path d="M 300 80 Q 320 55 340 80 Z" fill="#5B4A33" />
        {/* glass body */}
        <rect x="300" y="80" width="40" height="70" fill="rgba(255,210,140,0.6)" stroke="#3A2E1E" strokeWidth="1.2" />
        {/* arched panes */}
        <path d="M 308 150 L 308 100 Q 308 92 316 92 L 316 150" fill="rgba(255,180,100,0.4)" stroke="#3A2E1E" strokeWidth="0.8" />
        <path d="M 324 150 L 324 100 Q 324 92 332 92 L 332 150" fill="rgba(255,180,100,0.4)" stroke="#3A2E1E" strokeWidth="0.8" />
        {/* base */}
        <rect x="296" y="150" width="48" height="8" fill="#3A2E1E" />
        <rect x="298" y="158" width="44" height="6" fill="#5B4A33" />
        {/* warm glow */}
        <ellipse cx="320" cy="180" rx="50" ry="10" fill="rgba(255,200,120,0.4)" />
      </g>
    </svg>
  );
}

export function HadithVaseLantern() {
  return (
    <FullBleed
      background={`linear-gradient(180deg, ${BG_TOP} 0%, ${BG_BOT} 100%)`}
      ratio="9/16"
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(45deg, rgba(154,122,46,0.025) 0 1px, transparent 1px 4px)",
          mixBlendMode: "multiply",
          pointerEvents: "none",
        }}
      />
      <MihrabArchOutline stroke="rgba(60,40,20,0.32)" />
      <VaseAndLantern />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "150px 60px 38px 60px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: INK,
        }}
      >
        <div
          style={{
            fontFamily: SERIF_FONT,
            fontSize: 22,
            fontStyle: "italic",
            color: INK,
            lineHeight: 1.45,
            maxWidth: 250,
          }}
        >
          “Actions are
          <br />
          but by intentions.”
        </div>

        <div
          style={{
            marginTop: 18,
            fontFamily: SANS_FONT,
            fontSize: 12,
            color: INK_DIM,
          }}
        >
          (Bukhari & Muslim)
        </div>

        <div style={{ flex: 1 }} />

        <NuurMark color={GOLD} dim="rgba(58,50,32,0.6)" />
      </div>
    </FullBleed>
  );
}
