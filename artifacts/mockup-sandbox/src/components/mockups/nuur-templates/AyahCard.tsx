import React from "react";
import { ARABIC_FONT, FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "./_shared";

const NAVY = "#0E1E2E";
const NAVY_DEEP = "#06101A";
const CREAM = "#F4ECD8";
const CREAM_DIM = "rgba(244,236,216,0.72)";
const GOLD = "#D4A24A";

function StarField() {
  const stars: Array<[number, number, number, number]> = [];
  const rng = (i: number) => {
    const x = Math.sin(i * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };
  for (let i = 0; i < 110; i++) {
    stars.push([rng(i) * 540, rng(i + 100) * 540, 0.3 + rng(i + 200) * 1.1, 0.25 + rng(i + 300) * 0.65]);
  }
  return (
    <svg viewBox="0 0 540 540" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      {stars.map(([x, y, r, o], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={CREAM} opacity={o} />
      ))}
    </svg>
  );
}

function MountainSilhouette() {
  return (
    <svg viewBox="0 0 540 540" preserveAspectRatio="xMidYMax slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="hz" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1A2A3A" stopOpacity="0" />
          <stop offset="0.6" stopColor="#0A1422" stopOpacity="0.55" />
          <stop offset="1" stopColor="#020812" stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect y="320" width="540" height="220" fill="url(#hz)" />
      <path d="M 0 460 L 70 420 L 130 445 L 200 400 L 280 440 L 360 415 L 440 445 L 540 410 L 540 540 L 0 540 Z" fill="#02060C" opacity="0.95" />
    </svg>
  );
}

export function AyahCard() {
  return (
    <FullBleed background={NAVY_DEEP} ratio="1/1">
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${NAVY} 0%, ${NAVY_DEEP} 70%)` }} />
      <StarField />
      <MountainSilhouette />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "56px 56px 36px 56px",
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
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: GOLD,
            opacity: 0.95,
          }}
        >
          Ayah of the Day
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            fontFamily: ARABIC_FONT,
            fontSize: 36,
            lineHeight: 1.9,
            direction: "rtl",
            fontWeight: 400,
            textShadow: "0 2px 14px rgba(0,0,0,0.6)",
          }}
        >
          إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا
        </div>

        <div
          style={{
            marginTop: 22,
            fontFamily: SERIF_FONT,
            fontSize: 17,
            fontStyle: "italic",
            color: CREAM_DIM,
            lineHeight: 1.55,
            maxWidth: 340,
          }}
        >
          “Indeed, with hardship [will be] ease.”
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            fontFamily: SANS_FONT,
            fontSize: 9,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: CREAM_DIM,
            marginBottom: 14,
          }}
        >
          Ash-Sharḥ · 94:6
        </div>
        <NuurMark color={GOLD} dim="rgba(244,236,216,0.65)" />
      </div>
    </FullBleed>
  );
}
