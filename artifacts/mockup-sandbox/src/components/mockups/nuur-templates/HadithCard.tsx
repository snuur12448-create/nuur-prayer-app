import React from "react";
import { FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "./_shared";

const CREAM = "#E9DCC2";
const CREAM_DEEP = "#D8C9A9";
const CLAY = "#7A4E32";
const CLAY_DEEP = "#4A2E1C";
const INK = "#2A1A12";

function ArchSilhouette() {
  return (
    <svg
      viewBox="0 0 540 540"
      preserveAspectRatio="xMidYMax slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id="archShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={CREAM_DEEP} stopOpacity="0" />
          <stop offset="1" stopColor={CREAM_DEEP} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect width="540" height="540" fill="url(#archShade)" />
      {/* Arch */}
      <path
        d="M 270 80
           L 270 80
           Q 380 80 380 200
           L 380 480
           L 160 480
           L 160 200
           Q 160 80 270 80 Z"
        fill="none"
        stroke={CLAY}
        strokeWidth="1.5"
        opacity="0.45"
      />
      {/* Pottery silhouettes bottom */}
      <g fill={CLAY_DEEP} opacity="0.55">
        <path d="M 210 470 Q 195 460 200 445 Q 200 430 215 425 Q 230 422 235 432 Q 242 448 235 460 Q 232 470 210 470 Z" />
        <path d="M 320 470 Q 308 460 312 446 Q 312 432 326 428 Q 340 425 344 436 Q 350 450 344 462 Q 340 470 320 470 Z" />
        <rect x="265" y="438" width="14" height="32" rx="2" />
        <rect x="269" y="430" width="6" height="10" />
      </g>
    </svg>
  );
}

export function HadithCard() {
  return (
    <FullBleed background={CREAM} ratio="1/1">
      <ArchSilhouette />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "60px 70px 40px 70px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: INK,
        }}
      >
        <div
          style={{
            fontFamily: SANS_FONT,
            fontSize: 9.5,
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: CLAY,
            opacity: 0.9,
          }}
        >
          Hadith of the Day
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            fontFamily: SERIF_FONT,
            fontSize: 30,
            lineHeight: 1.45,
            color: INK,
            fontWeight: 500,
            maxWidth: 380,
          }}
        >
          “Actions are but&nbsp;by intentions.”
        </div>

        <div
          style={{
            marginTop: 26,
            fontFamily: SANS_FONT,
            fontSize: 12,
            color: CLAY_DEEP,
            fontStyle: "italic",
            opacity: 0.85,
          }}
        >
          (Bukhārī &amp; Muslim)
        </div>

        <div style={{ flex: 1 }} />

        <NuurMark color={CLAY} dim={CLAY_DEEP + "AA"} />
      </div>
    </FullBleed>
  );
}
