import React from "react";
import { ARABIC_FONT, FullBleed, NuurMark, SANS_FONT } from "./_shared";

const BG = "#13362A";
const BG_DEEP = "#0A2218";
const GOLD = "#D4B470";
const CREAM = "#F2E5C0";
const CREAM_DIM = "rgba(242,229,192,0.78)";

function ArchFrame() {
  return (
    <svg viewBox="0 0 540 540" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <path
        d="M 270 90
           Q 410 90 410 230
           L 410 480
           L 130 480
           L 130 230
           Q 130 90 270 90 Z"
        fill="none"
        stroke={GOLD}
        strokeWidth="1.2"
        opacity="0.7"
      />
      <path
        d="M 270 105
           Q 395 105 395 235
           L 395 466
           L 145 466
           L 145 235
           Q 145 105 270 105 Z"
        fill="none"
        stroke={GOLD}
        strokeWidth="0.6"
        opacity="0.45"
      />
      {/* Top ornament */}
      <g transform="translate(270 100)">
        <circle r="4" fill={GOLD} opacity="0.85" />
        <line x1="-22" y1="0" x2="-7" y2="0" stroke={GOLD} strokeWidth="0.7" opacity="0.6" />
        <line x1="7" y1="0" x2="22" y2="0" stroke={GOLD} strokeWidth="0.7" opacity="0.6" />
      </g>
    </svg>
  );
}

export function NameCard() {
  return (
    <FullBleed
      background={`radial-gradient(ellipse 70% 55% at 50% 45%, ${BG} 0%, ${BG_DEEP} 80%)`}
      ratio="1/1"
    >
      <ArchFrame />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "60px 60px 40px 60px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: CREAM,
        }}
      >
        <div
          style={{
            fontFamily: SANS_FONT,
            fontSize: 9.5,
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            color: GOLD,
            opacity: 0.95,
          }}
        >
          Name 03 of 99
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            fontFamily: ARABIC_FONT,
            fontSize: 96,
            lineHeight: 1.05,
            direction: "rtl",
            fontWeight: 400,
            color: CREAM,
            textShadow: "0 0 30px rgba(212,180,112,0.25)",
          }}
        >
          ٱلْمَلِك
        </div>

        <div
          style={{
            marginTop: 22,
            fontFamily: SANS_FONT,
            fontSize: 16,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: CREAM,
            fontWeight: 500,
          }}
        >
          Al-Malik
        </div>

        <div
          style={{
            marginTop: 14,
            fontFamily: SANS_FONT,
            fontSize: 13,
            lineHeight: 1.55,
            color: CREAM_DIM,
            maxWidth: 320,
          }}
        >
          The King, The Sovereign Lord
        </div>

        <div style={{ flex: 1 }} />

        <NuurMark color={GOLD} dim="rgba(242,229,192,0.6)" />
      </div>
    </FullBleed>
  );
}
