import React from "react";
import { ARABIC_FONT, FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "../nuur-templates/_shared";

const SKY_TOP = "#3B5774";
const SKY = "#5A7B98";
const WATER = "#2C4258";
const WATER_DEEP = "#162636";
const CREAM = "#EFE6D2";
const CREAM_DIM = "rgba(239,230,210,0.82)";
const GOLD = "#C9933A";

function LakeScene() {
  return (
    <svg
      viewBox="0 0 432 768"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={SKY_TOP} />
          <stop offset="1" stopColor={SKY} />
        </linearGradient>
        <linearGradient id="waterGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={WATER} />
          <stop offset="1" stopColor={WATER_DEEP} />
        </linearGradient>
        <radialGradient id="hazeR" cx="0.7" cy="0.45" r="0.5">
          <stop offset="0" stopColor="#E8D5A6" stopOpacity="0.35" />
          <stop offset="1" stopColor="#E8D5A6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width="432" height="470" fill="url(#skyGrad)" />
      {/* warm haze */}
      <rect x="0" y="0" width="432" height="470" fill="url(#hazeR)" />

      {/* far mountain ranges */}
      <path
        d="M0 460 L60 415 L120 440 L180 405 L260 435 L340 410 L432 430 L432 470 L0 470 Z"
        fill="#3D5878"
        opacity="0.7"
      />
      <path
        d="M0 470 L80 440 L160 460 L240 440 L320 458 L432 446 L432 480 L0 480 Z"
        fill="#243A52"
        opacity="0.85"
      />

      {/* Water */}
      <rect x="0" y="470" width="432" height="298" fill="url(#waterGrad)" />

      {/* water reflections (faint horizontal streaks) */}
      <g stroke="#A8C2D8" strokeWidth="0.6" opacity="0.18">
        <line x1="40" y1="500" x2="180" y2="500" />
        <line x1="220" y1="520" x2="380" y2="520" />
        <line x1="60" y1="555" x2="260" y2="555" />
        <line x1="280" y1="585" x2="400" y2="585" />
        <line x1="100" y1="620" x2="320" y2="620" />
        <line x1="40" y1="660" x2="200" y2="660" />
      </g>

      {/* horizon glow line */}
      <line x1="0" y1="470" x2="432" y2="470" stroke="#E0CFA0" strokeWidth="0.5" opacity="0.6" />

      {/* a few stars in the upper sky */}
      <g fill={CREAM} opacity="0.55">
        <circle cx="60" cy="40" r="0.8" />
        <circle cx="120" cy="80" r="0.6" />
        <circle cx="280" cy="50" r="0.9" />
        <circle cx="380" cy="100" r="0.7" />
        <circle cx="200" cy="30" r="0.5" />
      </g>
    </svg>
  );
}

export function LakeWater() {
  return (
    <FullBleed background={WATER_DEEP} ratio="9/16">
      <LakeScene />
      {/* darker bottom vignette so text reads */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.35) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "150px 50px 38px 50px",
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
            fontSize: 34,
            lineHeight: 1.85,
            direction: "rtl",
            fontWeight: 400,
            textShadow: "0 2px 18px rgba(0,0,0,0.55)",
          }}
        >
          قُلْ هُوَ ٱللَّهُ أَحَدٌ
        </div>

        <div
          style={{
            marginTop: 30,
            fontFamily: SERIF_FONT,
            fontSize: 18,
            fontStyle: "italic",
            color: CREAM_DIM,
            lineHeight: 1.55,
            maxWidth: 260,
            textShadow: "0 1px 10px rgba(0,0,0,0.5)",
          }}
        >
          Say, “He is Allah,
          <br />
          the One.”
        </div>

        <div
          style={{
            marginTop: 14,
            fontFamily: SANS_FONT,
            fontSize: 12,
            color: CREAM_DIM,
          }}
        >
          (112:1)
        </div>

        <div style={{ flex: 1 }} />

        <NuurMark color={GOLD} dim="rgba(239,230,210,0.7)" />
      </div>
    </FullBleed>
  );
}
