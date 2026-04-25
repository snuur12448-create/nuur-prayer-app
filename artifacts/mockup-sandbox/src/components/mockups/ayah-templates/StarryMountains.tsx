import React from "react";
import { ARABIC_FONT, FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "../nuur-templates/_shared";

const NAVY_TOP = "#0E1B2C";
const NAVY = "#0A1422";
const NAVY_DEEP = "#040A14";
const CREAM = "#EFE6D2";
const CREAM_DIM = "rgba(239,230,210,0.78)";
const GOLD = "#C9933A";

function StarField({ density = 160 }: { density?: number }) {
  const stars: Array<[number, number, number, number]> = [];
  const rng = (i: number) => {
    const x = Math.sin(i * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };
  for (let i = 0; i < density; i++) {
    stars.push([
      rng(i) * 432,
      rng(i + 100) * 520,
      0.3 + rng(i + 200) * 1.0,
      0.3 + rng(i + 300) * 0.65,
    ]);
  }
  return (
    <svg
      viewBox="0 0 432 768"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      {stars.map(([x, y, r, o], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={CREAM} opacity={o} />
      ))}
    </svg>
  );
}

function MountainSilhouette() {
  return (
    <svg
      viewBox="0 0 432 280"
      preserveAspectRatio="xMidYMax slice"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: 280,
      }}
    >
      <defs>
        <linearGradient id="mtFar" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1A2A3E" />
          <stop offset="1" stopColor="#0B1828" />
        </linearGradient>
        <linearGradient id="mtNear" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#070D17" />
          <stop offset="1" stopColor="#03070D" />
        </linearGradient>
      </defs>
      {/* Far mountains */}
      <path
        d="M0 180 L40 150 L80 165 L120 135 L160 155 L200 130 L240 150 L280 125 L320 145 L360 130 L400 150 L432 140 L432 280 L0 280 Z"
        fill="url(#mtFar)"
        opacity="0.9"
      />
      {/* Pine tree silhouettes */}
      <g fill="url(#mtNear)">
        <path d="M0 220 L20 195 L25 200 L30 185 L35 200 L40 195 L60 215 L60 280 L0 280 Z" />
        <path d="M55 215 L75 180 L82 190 L88 170 L94 188 L100 178 L120 215 L120 280 L55 280 Z" />
        <path d="M110 220 L135 175 L145 188 L155 165 L165 188 L175 178 L200 220 L200 280 L110 280 Z" />
        <path d="M180 225 L205 185 L215 195 L225 175 L235 195 L245 185 L275 225 L275 280 L180 280 Z" />
        <path d="M260 220 L290 175 L300 190 L310 168 L320 190 L330 180 L360 220 L360 280 L260 280 Z" />
        <path d="M340 225 L365 190 L375 200 L385 178 L395 200 L405 190 L432 225 L432 280 L340 280 Z" />
      </g>
    </svg>
  );
}

export function StarryMountains() {
  return (
    <FullBleed
      background={`linear-gradient(180deg, ${NAVY_TOP} 0%, ${NAVY} 50%, ${NAVY_DEEP} 100%)`}
      ratio="9/16"
    >
      <StarField />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 30% at 50% 20%, rgba(201,147,58,0.10) 0%, rgba(0,0,0,0) 65%)",
        }}
      />
      <MountainSilhouette />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "150px 38px 38px 38px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: CREAM,
        }}
      >
        <div
          style={{
            fontFamily: ARABIC_FONT,
            fontSize: 38,
            lineHeight: 1.8,
            direction: "rtl",
            fontWeight: 400,
            textShadow: "0 2px 18px rgba(0,0,0,0.7)",
          }}
        >
          إِنَّ مَعَ الْعُسْرِ يُسْرًا
        </div>

        <div
          style={{
            marginTop: 28,
            fontFamily: SERIF_FONT,
            fontSize: 18,
            fontStyle: "italic",
            color: CREAM_DIM,
            lineHeight: 1.55,
            maxWidth: 280,
            textShadow: "0 1px 10px rgba(0,0,0,0.6)",
          }}
        >
          Indeed, with hardship
          <br />
          [will be] ease.
        </div>

        <div
          style={{
            marginTop: 14,
            fontFamily: SANS_FONT,
            fontSize: 12,
            color: CREAM_DIM,
            opacity: 0.85,
          }}
        >
          (94:6)
        </div>

        <div style={{ flex: 1 }} />

        <NuurMark color={GOLD} dim="rgba(239,230,210,0.7)" />
      </div>
    </FullBleed>
  );
}
