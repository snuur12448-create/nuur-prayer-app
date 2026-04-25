import React from "react";
import { FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "../nuur-templates/_shared";
import { MihrabArchOutline } from "./_arch";

const BG_TOP = "#F1E7CE";
const BG_BOT = "#DFD0AB";
const INK = "#2E2818";
const INK_DIM = "rgba(46,40,24,0.7)";
const GOLD = "#9A7A2E";

function PalmShadow({ side }: { side: "left" | "right" }) {
  const flip = side === "right";
  return (
    <svg
      viewBox="0 0 200 600"
      preserveAspectRatio={flip ? "xMaxYMid meet" : "xMinYMid meet"}
      style={{
        position: "absolute",
        top: 80,
        bottom: 100,
        [side === "left" ? "left" : "right"]: 0,
        width: 180,
        height: "70%",
        opacity: 0.32,
        pointerEvents: "none",
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    >
      <g stroke="#5A4A2A" strokeWidth="1.3" fill="none">
        {/* trunk */}
        <path d="M 30 600 Q 35 500 40 380 Q 45 260 50 140" />
        {/* fronds */}
        <path d="M 50 140 Q 30 110 0 96" />
        <path d="M 50 140 Q 60 105 80 80" />
        <path d="M 50 140 Q 28 130 0 130" />
        <path d="M 50 140 Q 70 125 96 116" />
        <path d="M 50 140 Q 35 160 6 170" />
        <path d="M 50 140 Q 65 158 90 162" />

        <path d="M 45 240 Q 25 220 4 220" />
        <path d="M 45 240 Q 60 225 86 230" />
        <path d="M 40 360 Q 22 350 2 360" />
        <path d="M 40 360 Q 58 348 80 354" />
      </g>
    </svg>
  );
}

export function HadithCreamPalm() {
  return (
    <FullBleed
      background={`linear-gradient(180deg, ${BG_TOP} 0%, ${BG_BOT} 100%)`}
      ratio="9/16"
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(45deg, rgba(154,122,46,0.025) 0 1px, transparent 1px 4px)",
          mixBlendMode: "multiply",
          pointerEvents: "none",
        }}
      />
      <PalmShadow side="left" />
      <PalmShadow side="right" />
      <MihrabArchOutline stroke="rgba(46,40,24,0.32)" />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "150px 60px 38px 60px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: INK,
        }}
      >
        <div
          style={{
            fontFamily: SERIF_FONT,
            fontSize: 21,
            fontStyle: "italic",
            color: INK,
            lineHeight: 1.5,
            maxWidth: 260,
          }}
        >
          “Verily, in the
          <br />
          remembrance of Allah
          <br />
          do hearts find rest.”
        </div>

        <div
          style={{
            marginTop: 18,
            fontFamily: SANS_FONT,
            fontSize: 12,
            color: INK_DIM,
          }}
        >
          (Qur’an 13:28)
        </div>

        <div style={{ flex: 1 }} />

        <NuurMark color={GOLD} dim="rgba(46,40,24,0.6)" />
      </div>
    </FullBleed>
  );
}
