import React from "react";
import { FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "../nuur-templates/_shared";
import { MihrabArchOutline } from "./_arch";

const BG_TOP = "#EDE2C7";
const BG_BOT = "#D6C7A2";
const INK = "#2E2818";
const INK_DIM = "rgba(46,40,24,0.7)";
const GOLD = "#9A7A2E";

function DistantMountains() {
  return (
    <svg
      viewBox="0 0 432 200"
      preserveAspectRatio="xMidYMax slice"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 80,
        width: "100%",
        height: 200,
        pointerEvents: "none",
        opacity: 0.7,
      }}
    >
      <defs>
        <linearGradient id="mtnFar" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#9C8E69" stopOpacity="0.8" />
          <stop offset="1" stopColor="#9C8E69" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="mtnNear" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7A6D4A" stopOpacity="0.85" />
          <stop offset="1" stopColor="#7A6D4A" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* far range */}
      <path
        d="M 0 130 L 50 100 L 110 120 L 170 90 L 240 115 L 320 95 L 390 115 L 432 105 L 432 200 L 0 200 Z"
        fill="url(#mtnFar)"
      />
      {/* near range */}
      <path
        d="M 0 160 L 70 130 L 140 150 L 210 125 L 290 148 L 360 130 L 432 150 L 432 200 L 0 200 Z"
        fill="url(#mtnNear)"
      />

      {/* small palm silhouettes on the right */}
      <g stroke="#4A3F26" strokeWidth="1" fill="none" opacity="0.55">
        <path d="M 360 165 Q 362 150 364 130" />
        <path d="M 364 130 Q 354 134 346 142" />
        <path d="M 364 130 Q 374 134 382 142" />
        <path d="M 363 142 Q 354 146 346 152" />
        <path d="M 363 142 Q 372 146 380 152" />
      </g>
    </svg>
  );
}

export function HadithCreamMountains() {
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
      <MihrabArchOutline stroke="rgba(46,40,24,0.34)" />
      <DistantMountains />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "180px 60px 38px 60px",
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
            fontSize: 24,
            fontStyle: "italic",
            color: INK,
            lineHeight: 1.45,
            maxWidth: 240,
          }}
        >
          “A smile
          <br />
          is charity.”
        </div>

        <div
          style={{
            marginTop: 18,
            fontFamily: SANS_FONT,
            fontSize: 12,
            color: INK_DIM,
          }}
        >
          (Tirmidhi)
        </div>

        <div style={{ flex: 1 }} />

        <NuurMark color={GOLD} dim="rgba(46,40,24,0.6)" />
      </div>
    </FullBleed>
  );
}
