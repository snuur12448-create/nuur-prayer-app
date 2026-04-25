import React from "react";
import { FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "./_shared";

const CREAM = "#F0E1C2";
const CREAM_DIM = "rgba(240,225,194,0.85)";
const CLAY = "#7A4E32";
const CLAY_DEEP = "#3A1F12";

function SunsetArch() {
  return (
    <svg
      viewBox="0 0 432 768"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id="sunsetSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8B870" />
          <stop offset="0.4" stopColor="#C97D45" />
          <stop offset="0.8" stopColor="#5E2D1A" />
          <stop offset="1" stopColor="#2A1108" />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.55" r="0.4">
          <stop offset="0" stopColor="#FFE2A6" stopOpacity="1" />
          <stop offset="0.5" stopColor="#F5B66A" stopOpacity="0.55" />
          <stop offset="1" stopColor="#F5B66A" stopOpacity="0" />
        </radialGradient>
        <clipPath id="archClip">
          <path d="M 216 240 Q 336 240 336 380 L 336 600 L 96 600 L 96 380 Q 96 240 216 240 Z" />
        </clipPath>
      </defs>

      {/* Background dark */}
      <rect width="432" height="768" fill="#1A0E08" />

      {/* Inside the arch — the sunset view */}
      <g clipPath="url(#archClip)">
        <rect width="432" height="768" fill="url(#sunsetSky)" />
        <circle cx="216" cy="430" r="130" fill="url(#sun)" />
        {/* Distant mountains/dunes */}
        <path d="M 96 540 Q 150 500 216 530 Q 280 510 336 545 L 336 600 L 96 600 Z" fill="#3E1B0E" opacity="0.85" />
        {/* Palm */}
        <g transform="translate(110 510)">
          <line x1="0" y1="0" x2="0" y2="-90" stroke="#1A0805" strokeWidth="3" />
          <path d="M 0 -90 Q -25 -110 -45 -100" stroke="#1A0805" strokeWidth="2.5" fill="none" />
          <path d="M 0 -90 Q 25 -115 50 -105" stroke="#1A0805" strokeWidth="2.5" fill="none" />
          <path d="M 0 -90 Q -10 -125 -30 -130" stroke="#1A0805" strokeWidth="2.5" fill="none" />
          <path d="M 0 -90 Q 15 -120 35 -130" stroke="#1A0805" strokeWidth="2.5" fill="none" />
        </g>
      </g>

      {/* Arch outline */}
      <path
        d="M 216 240 Q 336 240 336 380 L 336 600 L 96 600 L 96 380 Q 96 240 216 240 Z"
        fill="none"
        stroke="#0A0503"
        strokeWidth="3"
      />

      {/* Foreground floor */}
      <rect x="0" y="600" width="432" height="168" fill="#1A0E08" />
    </svg>
  );
}

export function HadithWallpaper() {
  return (
    <FullBleed background="#1A0E08" ratio="9/16">
      <SunsetArch />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "70px 38px 46px 38px",
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
            fontSize: 9,
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            color: "#E8B870",
            opacity: 0.9,
          }}
        >
          Hadith Reflection
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            fontFamily: SERIF_FONT,
            fontSize: 22,
            lineHeight: 1.45,
            fontWeight: 500,
            maxWidth: 320,
            textShadow: "0 2px 14px rgba(0,0,0,0.55)",
          }}
        >
          “Be in this world as though you were a stranger or a traveler.”
        </div>

        <div
          style={{
            marginTop: 18,
            fontFamily: SANS_FONT,
            fontSize: 11,
            color: CREAM_DIM,
            fontStyle: "italic",
            opacity: 0.85,
            textShadow: "0 1px 6px rgba(0,0,0,0.45)",
          }}
        >
          (Bukhārī)
        </div>

        <div style={{ flex: 0.4 }} />

        <NuurMark color="#E8B870" dim="rgba(240,225,194,0.7)" />
      </div>
    </FullBleed>
  );
}
