import React from "react";
import { ARABIC_FONT, FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "./_shared";

const CREAM = "#F4ECD8";
const CREAM_DIM = "rgba(244,236,216,0.78)";
const GOLD = "#E2B872";

function SunsetMountains() {
  return (
    <svg
      viewBox="0 0 432 768"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7E5E8C" />
          <stop offset="0.35" stopColor="#A36A6E" />
          <stop offset="0.65" stopColor="#7B3E48" />
          <stop offset="1" stopColor="#2C1422" />
        </linearGradient>
        <radialGradient id="sun2" cx="0.5" cy="0.6" r="0.3">
          <stop offset="0" stopColor="#FFD8A0" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#E2A66A" stopOpacity="0.4" />
          <stop offset="1" stopColor="#E2A66A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="432" height="768" fill="url(#dusk)" />
      <circle cx="216" cy="490" r="120" fill="url(#sun2)" />
      {/* Distant ridges */}
      <path d="M 0 540 Q 80 510 160 525 Q 240 510 320 530 Q 380 520 432 540 L 432 768 L 0 768 Z" fill="#4A2236" opacity="0.85" />
      <path d="M 0 600 Q 70 575 150 590 Q 240 575 320 595 Q 380 585 432 600 L 432 768 L 0 768 Z" fill="#2A1322" opacity="0.95" />
      <path d="M 0 660 Q 100 640 200 650 Q 300 640 432 660 L 432 768 L 0 768 Z" fill="#160B16" />
      {/* Top vignette */}
      <rect width="432" height="200" fill="url(#topFade)" />
      <defs>
        <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.35" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function NameWallpaper() {
  return (
    <FullBleed background="#160B16" ratio="9/16">
      <SunsetMountains />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "100px 38px 50px 38px",
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
            color: GOLD,
            opacity: 0.95,
            textShadow: "0 1px 6px rgba(0,0,0,0.45)",
          }}
        >
          Name 05 of 99
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            fontFamily: ARABIC_FONT,
            fontSize: 84,
            lineHeight: 1.05,
            direction: "rtl",
            fontWeight: 400,
            color: CREAM,
            textShadow: "0 2px 18px rgba(0,0,0,0.6)",
          }}
        >
          ٱلسَّلَام
        </div>

        <div
          style={{
            marginTop: 22,
            fontFamily: SANS_FONT,
            fontSize: 14,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: CREAM,
            fontWeight: 500,
            textShadow: "0 1px 6px rgba(0,0,0,0.45)",
          }}
        >
          As-Salam
        </div>

        <div
          style={{
            marginTop: 14,
            fontFamily: SERIF_FONT,
            fontSize: 16,
            fontStyle: "italic",
            color: CREAM_DIM,
            maxWidth: 280,
            textShadow: "0 1px 6px rgba(0,0,0,0.4)",
          }}
        >
          The Source of Peace
        </div>

        <div style={{ flex: 1.4 }} />

        <NuurMark color={GOLD} dim="rgba(244,236,216,0.7)" />
      </div>
    </FullBleed>
  );
}
