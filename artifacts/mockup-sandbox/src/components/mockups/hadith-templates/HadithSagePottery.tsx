import React from "react";
import { FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "../nuur-templates/_shared";
import { MihrabArchOutline } from "./_arch";

const BG_TOP = "#7E7A55";
const BG_BOT = "#5C5938";
const CREAM = "#EFE6CB";
const CREAM_DIM = "rgba(239,230,203,0.78)";
const GOLD = "#C9A657";

function PotteryAndPalm() {
  return (
    <svg
      viewBox="0 0 432 240"
      preserveAspectRatio="xMidYMax meet"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 80,
        width: "100%",
        height: 240,
        pointerEvents: "none",
        opacity: 0.92,
      }}
    >
      {/* shadows */}
      <ellipse cx="105" cy="222" rx="48" ry="6" fill="rgba(0,0,0,0.2)" />
      <ellipse cx="170" cy="224" rx="32" ry="4" fill="rgba(0,0,0,0.18)" />
      <ellipse cx="320" cy="220" rx="55" ry="6" fill="rgba(0,0,0,0.18)" />

      {/* palm fronds behind */}
      <g stroke="#4A4D2A" strokeWidth="1.4" fill="none" opacity="0.7">
        <path d="M 360 220 Q 370 150 380 80" />
        <path d="M 380 80 Q 360 90 340 100" />
        <path d="M 380 80 Q 400 90 420 100" />
        <path d="M 376 110 Q 358 118 342 130" />
        <path d="M 376 110 Q 396 118 416 130" />
        <path d="M 372 140 Q 356 148 340 160" />
        <path d="M 372 140 Q 392 148 412 160" />
      </g>

      {/* big jar */}
      <g>
        <path
          d="M 75 220
             C 55 220 48 200 53 178
             C 58 150 66 140 74 128
             L 136 128
             C 144 140 152 150 157 178
             C 162 200 152 220 132 220 Z"
          fill="#7A5535"
        />
        <ellipse cx="105" cy="128" rx="32" ry="6" fill="#5A3D24" />
        <path d="M 65 160 Q 105 168 145 160" stroke="rgba(0,0,0,0.22)" strokeWidth="1" fill="none" />
      </g>

      {/* small jug */}
      <g>
        <path
          d="M 158 224
             C 150 224 145 212 148 200
             C 152 188 156 180 160 174
             L 184 174
             C 188 180 192 188 196 200
             C 200 212 194 224 184 224 Z"
          fill="#5E4128"
        />
        <ellipse cx="172" cy="174" rx="12" ry="3" fill="#42301C" />
        <path d="M 184 192 Q 200 192 200 206" stroke="#42301C" strokeWidth="2" fill="none" />
      </g>

      {/* lantern */}
      <g>
        <line x1="320" y1="60" x2="320" y2="78" stroke="#1F1A0E" strokeWidth="1.2" />
        <ellipse cx="320" cy="60" rx="3" ry="2" fill="#1F1A0E" />
        <path d="M 312 78 L 320 68 L 328 78 Z" fill="#1F1A0E" />
        <path d="M 302 96 Q 320 72 338 96 Z" fill="#3A2E1E" />
        <rect x="302" y="96" width="36" height="68" fill="rgba(255,210,140,0.7)" stroke="#1F1A0E" strokeWidth="1.2" />
        <path d="M 309 164 L 309 114 Q 309 107 316 107 L 316 164" fill="rgba(255,180,90,0.45)" stroke="#1F1A0E" strokeWidth="0.7" />
        <path d="M 324 164 L 324 114 Q 324 107 331 107 L 331 164" fill="rgba(255,180,90,0.45)" stroke="#1F1A0E" strokeWidth="0.7" />
        <rect x="298" y="164" width="44" height="8" fill="#1F1A0E" />
        <ellipse cx="320" cy="200" rx="55" ry="10" fill="rgba(255,200,120,0.3)" />
      </g>
    </svg>
  );
}

export function HadithSagePottery() {
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
            "radial-gradient(ellipse 60% 30% at 50% 22%, rgba(239,230,203,0.18) 0%, rgba(0,0,0,0) 70%)",
        }}
      />
      <MihrabArchOutline stroke="rgba(239,230,203,0.32)" />
      <PotteryAndPalm />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "140px 50px 38px 50px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: CREAM,
        }}
      >
        <div
          style={{
            fontFamily: SERIF_FONT,
            fontSize: 21,
            fontStyle: "italic",
            color: CREAM,
            lineHeight: 1.5,
            maxWidth: 280,
            textShadow: "0 1px 8px rgba(0,0,0,0.4)",
          }}
        >
          “Be in this world
          <br />
          as though you were
          <br />
          a stranger
          <br />
          or a traveler.”
        </div>

        <div
          style={{
            marginTop: 18,
            fontFamily: SANS_FONT,
            fontSize: 12,
            color: CREAM_DIM,
          }}
        >
          (Bukhari)
        </div>

        <div style={{ flex: 1 }} />

        <NuurMark color={GOLD} dim="rgba(239,230,203,0.7)" />
      </div>
    </FullBleed>
  );
}
