import React from "react";
import { ARABIC_FONT, FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "./_shared";

const NAVY_TOP = "#1B2C3F";
const NAVY = "#0B1A2A";
const NAVY_DEEP = "#040B14";
const CREAM = "#F4ECD8";
const CREAM_DIM = "rgba(244,236,216,0.78)";
const GOLD = "#D4A24A";

function StarField() {
  const stars: Array<[number, number, number, number]> = [];
  const rng = (i: number) => {
    const x = Math.sin(i * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };
  for (let i = 0; i < 130; i++) {
    stars.push([rng(i) * 432, rng(i + 100) * 768, 0.3 + rng(i + 200) * 1.0, 0.3 + rng(i + 300) * 0.6]);
  }
  return (
    <svg viewBox="0 0 432 768" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      {stars.map(([x, y, r, o], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={CREAM} opacity={o} />
      ))}
    </svg>
  );
}

function Crescent() {
  return (
    <svg width="84" height="84" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0" stopColor="#FFE9B6" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#FFE9B6" stopOpacity="0.12" />
          <stop offset="1" stopColor="#FFE9B6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#moonGlow)" />
      <path
        d="M 70 50 A 28 28 0 1 1 42 22 A 22 22 0 1 0 70 50 Z"
        fill="#F4D98E"
      />
    </svg>
  );
}

export function AyahWallpaper() {
  return (
    <FullBleed
      background={`linear-gradient(180deg, ${NAVY_TOP} 0%, ${NAVY} 45%, ${NAVY_DEEP} 100%)`}
      ratio="9/16"
    >
      <StarField />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 90% 35% at 50% 18%, rgba(212,162,74,0.18) 0%, rgba(0,0,0,0) 60%)",
        }}
      />

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
        <Crescent />

        <div style={{ marginTop: 38 }} />

        <div
          style={{
            fontFamily: ARABIC_FONT,
            fontSize: 28,
            lineHeight: 2,
            direction: "rtl",
            fontWeight: 400,
            textShadow: "0 2px 16px rgba(0,0,0,0.6)",
          }}
        >
          وَمَا تَوْفِيقِي إِلَّا بِٱللَّهِ
        </div>

        <div
          style={{
            marginTop: 30,
            fontFamily: SERIF_FONT,
            fontSize: 17,
            fontStyle: "italic",
            color: CREAM_DIM,
            lineHeight: 1.55,
            maxWidth: 300,
            textShadow: "0 1px 8px rgba(0,0,0,0.45)",
          }}
        >
          “And my success is not but through Allah.”
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            fontFamily: SANS_FONT,
            fontSize: 8.5,
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: CREAM_DIM,
            marginBottom: 14,
          }}
        >
          Hūd · 11:88
        </div>
        <NuurMark color={GOLD} dim="rgba(244,236,216,0.7)" />
      </div>
    </FullBleed>
  );
}
