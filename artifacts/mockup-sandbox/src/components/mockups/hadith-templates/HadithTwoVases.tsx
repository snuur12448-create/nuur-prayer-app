import React from "react";
import { FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "../nuur-templates/_shared";
import { MihrabArchOutline } from "./_arch";

const BG_TOP = "#F2E8CF";
const BG_BOT = "#E0D2AE";
const INK = "#2E2818";
const INK_DIM = "rgba(46,40,24,0.7)";
const GOLD = "#9A7A2E";

function TwoVasesAndLantern() {
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
      {/* shadows */}
      <ellipse cx="120" cy="200" rx="38" ry="5" fill="rgba(0,0,0,0.18)" />
      <ellipse cx="180" cy="202" rx="32" ry="4" fill="rgba(0,0,0,0.16)" />
      <ellipse cx="320" cy="200" rx="50" ry="6" fill="rgba(255,200,120,0.25)" />

      {/* big terracotta jar (left) */}
      <g>
        <path
          d="M 90 200
             C 70 200 60 180 65 158
             C 70 130 78 120 86 108
             L 154 108
             C 162 120 170 130 175 158
             C 180 180 170 200 150 200 Z"
          fill="#8B6438"
        />
        <ellipse cx="120" cy="108" rx="34" ry="6" fill="#6B4A28" />
        <path d="M 80 140 Q 120 148 160 140" stroke="rgba(0,0,0,0.2)" strokeWidth="1" fill="none" />
      </g>

      {/* small brown jug (middle) */}
      <g>
        <path
          d="M 168 202
             C 158 202 152 188 156 176
             C 160 162 164 154 168 148
             L 196 148
             C 200 154 204 162 208 176
             C 212 188 206 202 196 202 Z"
          fill="#6F4F2E"
        />
        <ellipse cx="182" cy="148" rx="14" ry="3" fill="#4F371E" />
        <path d="M 196 168 Q 214 168 214 184" stroke="#4F371E" strokeWidth="2" fill="none" />
      </g>

      {/* lantern on right */}
      <g>
        <line x1="320" y1="40" x2="320" y2="60" stroke="#3A2E1E" strokeWidth="1.2" />
        <ellipse cx="320" cy="40" rx="3" ry="2" fill="#3A2E1E" />
        <path d="M 312 60 L 320 50 L 328 60 Z" fill="#3A2E1E" />
        <path d="M 302 78 Q 320 54 338 78 Z" fill="#5B4A33" />
        <rect x="302" y="78" width="36" height="68" fill="rgba(255,210,140,0.7)" stroke="#3A2E1E" strokeWidth="1.2" />
        <path d="M 309 146 L 309 96 Q 309 89 316 89 L 316 146" fill="rgba(255,180,90,0.45)" stroke="#3A2E1E" strokeWidth="0.7" />
        <path d="M 324 146 L 324 96 Q 324 89 331 89 L 331 146" fill="rgba(255,180,90,0.45)" stroke="#3A2E1E" strokeWidth="0.7" />
        <rect x="298" y="146" width="44" height="8" fill="#3A2E1E" />
        <rect x="300" y="154" width="40" height="6" fill="#5B4A33" />
      </g>
    </svg>
  );
}

export function HadithTwoVases() {
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
      <MihrabArchOutline stroke="rgba(46,40,24,0.32)" />
      <TwoVasesAndLantern />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "150px 50px 38px 50px",
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
            maxWidth: 280,
          }}
        >
          “The best of people
          <br />
          are those that bring
          <br />
          most benefit
          <br />
          to the people.”
        </div>

        <div
          style={{
            marginTop: 18,
            fontFamily: SANS_FONT,
            fontSize: 12,
            color: INK_DIM,
          }}
        >
          (Daraqutni)
        </div>

        <div style={{ flex: 1 }} />

        <NuurMark color={GOLD} dim="rgba(46,40,24,0.6)" />
      </div>
    </FullBleed>
  );
}
