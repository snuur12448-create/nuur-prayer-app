import React from "react";
import { ARABIC_FONT, FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "../nuur-templates/_shared";

const SKY_TOP = "#9DB7CC";
const SKY = "#B9CDDD";
const SKY_BOT = "#D9E2EA";
const INK = "#1F2D3C";
const INK_DIM = "rgba(31,45,60,0.72)";
const GOLD = "#9A7A2E";

function CloudLayer() {
  return (
    <svg
      viewBox="0 0 432 768"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <defs>
        <radialGradient id="cloud1" cx="0.5" cy="0.5" r="0.55">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cloud2" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#F4F0E4" stopOpacity="0.75" />
          <stop offset="1" stopColor="#F4F0E4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sun" cx="0.78" cy="0.18" r="0.55">
          <stop offset="0" stopColor="#F6E5B8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#F6E5B8" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* high wispy clouds */}
      <ellipse cx="80" cy="120" rx="180" ry="38" fill="url(#cloud1)" />
      <ellipse cx="350" cy="220" rx="150" ry="32" fill="url(#cloud1)" />
      <ellipse cx="120" cy="320" rx="200" ry="40" fill="url(#cloud2)" />
      <ellipse cx="370" cy="430" rx="130" ry="28" fill="url(#cloud1)" opacity="0.8" />
      <ellipse cx="80" cy="540" rx="220" ry="46" fill="url(#cloud2)" />
      <ellipse cx="340" cy="640" rx="170" ry="36" fill="url(#cloud1)" opacity="0.7" />
      {/* warm sunlight glow upper-right */}
      <rect width="432" height="768" fill="url(#sun)" />
    </svg>
  );
}

export function SkyClouds() {
  return (
    <FullBleed
      background={`linear-gradient(180deg, ${SKY_TOP} 0%, ${SKY} 55%, ${SKY_BOT} 100%)`}
      ratio="9/16"
    >
      <CloudLayer />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "210px 50px 38px 50px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: INK,
        }}
      >
        <div
          style={{
            fontFamily: ARABIC_FONT,
            fontSize: 34,
            lineHeight: 1.85,
            direction: "rtl",
            fontWeight: 400,
            color: INK,
            textShadow: "0 1px 10px rgba(255,255,255,0.4)",
          }}
        >
          فَإِنَّ مَعَ الْعُسْرِ يُسْرًا
        </div>

        <div
          style={{
            marginTop: 30,
            fontFamily: SERIF_FONT,
            fontSize: 17,
            fontStyle: "italic",
            color: INK_DIM,
            lineHeight: 1.55,
            maxWidth: 250,
          }}
        >
          For indeed,
          <br />
          with hardship
          <br />
          will be ease.
        </div>

        <div
          style={{
            marginTop: 14,
            fontFamily: SANS_FONT,
            fontSize: 12,
            color: INK_DIM,
          }}
        >
          (94:5)
        </div>

        <div style={{ flex: 1 }} />

        <NuurMark color={GOLD} dim="rgba(31,45,60,0.6)" />
      </div>
    </FullBleed>
  );
}
