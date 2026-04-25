import React from "react";
import { ARABIC_FONT, FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "../nuur-templates/_shared";

const CREAM = "#E9DEC4";
const CREAM_DEEP = "#D9CBA9";
const INK = "#3A3220";
const INK_DIM = "rgba(58,50,32,0.72)";
const GOLD = "#9A7A2E";

function VerticalOrnament({ side }: { side: "left" | "right" }) {
  const transform = side === "right" ? "scale(-1,1) translate(-60,0)" : undefined;
  const style: React.CSSProperties = {
    position: "absolute",
    top: 0,
    bottom: 0,
    opacity: 0.55,
  };
  if (side === "left") style.left = 0;
  else style.right = 0;
  return (
    <svg
      width="60"
      height="768"
      viewBox="0 0 60 768"
      preserveAspectRatio="xMidYMid slice"
      style={style}
    >
      <g transform={transform} fill="none" stroke={GOLD} strokeWidth="0.9">
        {/* repeating arabesque vertical pattern */}
        {Array.from({ length: 12 }).map((_, i) => {
          const y = 24 + i * 62;
          return (
            <g key={i} transform={`translate(0 ${y})`}>
              <path d="M30 0 C 14 10 14 30 30 40 C 46 30 46 10 30 0 Z" />
              <path d="M30 6 C 22 14 22 26 30 34 C 38 26 38 14 30 6 Z" opacity="0.8" />
              <circle cx="30" cy="20" r="2" fill={GOLD} stroke="none" opacity="0.9" />
              <path d="M18 20 Q 8 20 4 14" />
              <path d="M18 20 Q 8 20 4 26" />
            </g>
          );
        })}
        {/* outer rule line */}
        <line x1="52" y1="0" x2="52" y2="768" strokeWidth="0.7" opacity="0.6" />
        <line x1="56" y1="0" x2="56" y2="768" strokeWidth="0.4" opacity="0.4" />
      </g>
    </svg>
  );
}

export function CreamOrnate() {
  return (
    <FullBleed
      background={`radial-gradient(ellipse 80% 70% at 50% 50%, ${CREAM} 0%, ${CREAM_DEEP} 100%)`}
      ratio="9/16"
    >
      {/* paper grain */}
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

      <VerticalOrnament side="left" />
      <VerticalOrnament side="right" />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "150px 78px 38px 78px",
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
            fontSize: 24,
            lineHeight: 1.95,
            direction: "rtl",
            fontWeight: 400,
            color: INK,
          }}
        >
          وَلَا تَهِنُوا وَلَا تَحْزَنُوا
          <br />
          وَأَنتُمُ الْأَعْلَوْنَ
          <br />
          إِن كُنتُم مُّؤْمِنِينَ
        </div>

        <div
          style={{
            marginTop: 30,
            fontFamily: SERIF_FONT,
            fontSize: 16,
            fontStyle: "italic",
            color: INK_DIM,
            lineHeight: 1.55,
            maxWidth: 240,
          }}
        >
          Do not lose hope,
          <br />
          nor be sad.
          <br />
          You will be superior
          <br />
          if you are [true] believers.
        </div>

        <div
          style={{
            marginTop: 14,
            fontFamily: SANS_FONT,
            fontSize: 12,
            color: INK_DIM,
          }}
        >
          (3:139)
        </div>

        <div style={{ flex: 1 }} />

        <NuurMark color={GOLD} dim="rgba(58,50,32,0.6)" />
      </div>
    </FullBleed>
  );
}
