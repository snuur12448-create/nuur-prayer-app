import React from "react";
import { FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "../nuur-templates/_shared";
import { MihrabArchOutline } from "./_arch";

const BG_TOP = "#5C4A33";
const BG_MID = "#3F311F";
const BG_BOT = "#2A2014";
const CREAM = "#E8DBBD";
const CREAM_DIM = "rgba(232,219,189,0.78)";
const GOLD = "#C9933A";

function Lantern() {
  return (
    <svg
      viewBox="0 0 432 220"
      preserveAspectRatio="xMidYMax meet"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 80,
        width: "100%",
        height: 220,
        pointerEvents: "none",
      }}
    >
      <ellipse cx="118" cy="200" rx="60" ry="7" fill="rgba(255,200,120,0.18)" />
      <g>
        {/* hanging chain */}
        <line x1="118" y1="40" x2="118" y2="60" stroke="#1A1208" strokeWidth="1.2" />
        <ellipse cx="118" cy="40" rx="3" ry="2" fill="#1A1208" />
        <path d="M 110 60 L 118 50 L 126 60 Z" fill="#1A1208" />
        {/* dome */}
        <path d="M 96 80 Q 118 52 140 80 Z" fill="#3A2A18" stroke="#1A1208" strokeWidth="0.8" />
        {/* glass body */}
        <rect x="96" y="80" width="44" height="74" fill="rgba(255,200,110,0.7)" stroke="#1A1208" strokeWidth="1.2" />
        {/* arched panes */}
        <path d="M 104 154 L 104 100 Q 104 92 113 92 L 113 154" fill="rgba(255,170,80,0.55)" stroke="#1A1208" strokeWidth="0.8" />
        <path d="M 122 154 L 122 100 Q 122 92 131 92 L 131 154" fill="rgba(255,170,80,0.55)" stroke="#1A1208" strokeWidth="0.8" />
        {/* base */}
        <rect x="92" y="154" width="52" height="9" fill="#1A1208" />
        <rect x="94" y="163" width="48" height="7" fill="#3A2A18" />
        {/* glow */}
        <ellipse cx="118" cy="190" rx="80" ry="14" fill="rgba(255,200,120,0.35)" />
      </g>
    </svg>
  );
}

export function HadithSepia() {
  return (
    <FullBleed
      background={`linear-gradient(180deg, ${BG_TOP} 0%, ${BG_MID} 50%, ${BG_BOT} 100%)`}
      ratio="9/16"
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 35% at 50% 25%, rgba(201,147,58,0.18) 0%, rgba(0,0,0,0) 70%)",
        }}
      />
      <MihrabArchOutline stroke="rgba(232,219,189,0.32)" />
      <Lantern />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "140px 56px 38px 56px",
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
            fontSize: 20,
            fontStyle: "italic",
            color: CREAM,
            lineHeight: 1.5,
            maxWidth: 260,
            textShadow: "0 1px 8px rgba(0,0,0,0.45)",
          }}
        >
          “Whoever believes
          <br />
          in Allah and the Last Day,
          <br />
          let him speak good
          <br />
          or remain silent.”
        </div>

        <div
          style={{
            marginTop: 20,
            fontFamily: SANS_FONT,
            fontSize: 12,
            color: CREAM_DIM,
          }}
        >
          (Bukhari & Muslim)
        </div>

        <div style={{ flex: 1 }} />

        <NuurMark color={GOLD} dim="rgba(232,219,189,0.7)" />
      </div>
    </FullBleed>
  );
}
