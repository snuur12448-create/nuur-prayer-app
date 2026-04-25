import React from "react";
import { ARABIC_FONT, FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "../nuur-templates/_shared";

const NAVY = "#0E1A2A";
const NAVY_DEEP = "#06101C";
const CREAM = "#EBDFC3";
const CREAM_DIM = "rgba(235,223,195,0.78)";
const GOLD = "#C9933A";

function MihrabArch() {
  return (
    <svg
      viewBox="0 0 432 768"
      preserveAspectRatio="xMidYMid meet"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id="archFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#102036" />
          <stop offset="1" stopColor="#06101C" />
        </linearGradient>
        <linearGradient id="archStroke" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#D8B463" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#C9933A" stopOpacity="0.4" />
          <stop offset="1" stopColor="#7C5A1A" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      {/* Mihrab pointed arch path: rectangle bottom, ogee arch top */}
      <path
        d="
          M 56 720
          L 56 230
          C 56 150 110 90 216 90
          C 322 90 376 150 376 230
          L 376 720
          Z
        "
        fill="url(#archFill)"
        stroke="url(#archStroke)"
        strokeWidth="1.4"
      />
      {/* inner thin line */}
      <path
        d="
          M 70 720
          L 70 234
          C 70 158 122 102 216 102
          C 310 102 362 158 362 234
          L 362 720
          Z
        "
        fill="none"
        stroke="url(#archStroke)"
        strokeWidth="0.6"
        opacity="0.7"
      />
    </svg>
  );
}

function StarField() {
  const stars: Array<[number, number, number, number]> = [];
  const rng = (i: number) => {
    const x = Math.sin(i * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };
  for (let i = 0; i < 90; i++) {
    stars.push([
      rng(i) * 432,
      rng(i + 100) * 768,
      0.3 + rng(i + 200) * 0.8,
      0.2 + rng(i + 300) * 0.5,
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

export function DarkMihrab() {
  return (
    <FullBleed
      background={`radial-gradient(ellipse 90% 60% at 50% 35%, ${NAVY} 0%, ${NAVY_DEEP} 100%)`}
      ratio="9/16"
    >
      <StarField />
      <MihrabArch />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "260px 60px 38px 60px",
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
            fontSize: 32,
            lineHeight: 1.9,
            direction: "rtl",
            fontWeight: 400,
            textShadow: "0 2px 18px rgba(0,0,0,0.7)",
          }}
        >
          وَأَنَّ ٱللَّهَ
          <br />
          مَعَ ٱلصَّابِرِينَ
        </div>

        <div
          style={{
            marginTop: 32,
            fontFamily: SERIF_FONT,
            fontSize: 17,
            fontStyle: "italic",
            color: CREAM_DIM,
            lineHeight: 1.55,
            maxWidth: 240,
            textShadow: "0 1px 8px rgba(0,0,0,0.5)",
          }}
        >
          And indeed,
          <br />
          Allah is with
          <br />
          the patient.
        </div>

        <div
          style={{
            marginTop: 14,
            fontFamily: SANS_FONT,
            fontSize: 12,
            color: CREAM_DIM,
          }}
        >
          (2:153)
        </div>

        <div style={{ flex: 1 }} />

        <NuurMark color={GOLD} dim="rgba(235,223,195,0.7)" />
      </div>
    </FullBleed>
  );
}
