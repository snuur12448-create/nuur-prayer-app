import React from "react";
import { ARABIC_FONT, FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "../nuur-templates/_shared";

const CREAM = "#ECE0C5";
const CREAM_DEEP = "#DBCBA6";
const INK = "#3A3220";
const INK_DIM = "rgba(58,50,32,0.7)";
const GOLD = "#9A7A2E";

function CornerOrnament({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const flipX = corner === "tr" || corner === "br";
  const flipY = corner === "bl" || corner === "br";
  const sx = flipX ? -1 : 1;
  const sy = flipY ? -1 : 1;
  const tx = flipX ? -160 : 0;
  const ty = flipY ? -160 : 0;
  const style: React.CSSProperties = {
    position: "absolute",
    width: 160,
    height: 160,
    opacity: 0.55,
  };
  if (corner === "tl") Object.assign(style, { top: 0, left: 0 });
  if (corner === "tr") Object.assign(style, { top: 0, right: 0 });
  if (corner === "bl") Object.assign(style, { bottom: 0, left: 0 });
  if (corner === "br") Object.assign(style, { bottom: 0, right: 0 });
  return (
    <svg viewBox="0 0 160 160" style={style}>
      <g
        transform={`scale(${sx} ${sy}) translate(${tx} ${ty})`}
        fill="none"
        stroke={GOLD}
        strokeWidth="0.9"
      >
        {/* corner arabesque flourish */}
        <path d="M0 30 Q 30 30 30 0" />
        <path d="M0 50 Q 50 50 50 0" opacity="0.85" />
        <path d="M10 70 Q 70 70 70 10" opacity="0.7" />
        {/* leaves */}
        <path d="M30 30 C 50 30 60 50 50 70 C 40 60 30 50 30 30 Z" opacity="0.85" />
        <path d="M55 20 C 75 25 80 45 70 60 C 60 50 55 35 55 20 Z" opacity="0.7" />
        <path d="M20 55 C 40 60 50 75 40 90 C 30 80 20 70 20 55 Z" opacity="0.7" />
        {/* tendrils */}
        <path d="M70 70 Q 100 60 110 30" />
        <path d="M70 70 Q 60 100 30 110" />
        <circle cx="40" cy="40" r="2" fill={GOLD} stroke="none" />
        <circle cx="62" cy="62" r="1.6" fill={GOLD} stroke="none" />
      </g>
    </svg>
  );
}

export function CreamCorner() {
  return (
    <FullBleed
      background={`radial-gradient(ellipse 90% 75% at 50% 50%, ${CREAM} 0%, ${CREAM_DEEP} 100%)`}
      ratio="9/16"
    >
      {/* paper grain */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(45deg, rgba(154,122,46,0.03) 0 1px, transparent 1px 4px)",
          mixBlendMode: "multiply",
          pointerEvents: "none",
        }}
      />

      <CornerOrnament corner="tr" />
      <CornerOrnament corner="bl" />

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
            fontFamily: ARABIC_FONT,
            fontSize: 22,
            lineHeight: 1.95,
            direction: "rtl",
            fontWeight: 400,
            color: INK,
          }}
        >
          رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ
          <br />
          وَلِلْمُؤْمِنِينَ يَوْمَ
          <br />
          يَقُومُ ٱلْحِسَابُ
        </div>

        <div
          style={{
            marginTop: 28,
            fontFamily: SERIF_FONT,
            fontSize: 15.5,
            fontStyle: "italic",
            color: INK_DIM,
            lineHeight: 1.55,
            maxWidth: 250,
          }}
        >
          My Lord, forgive me
          <br />
          and my parents and
          <br />
          the believers the Day
          <br />
          the account is established.
        </div>

        <div
          style={{
            marginTop: 14,
            fontFamily: SANS_FONT,
            fontSize: 12,
            color: INK_DIM,
          }}
        >
          (14:41)
        </div>

        <div style={{ flex: 1 }} />

        <NuurMark color={GOLD} dim="rgba(58,50,32,0.6)" />
      </div>
    </FullBleed>
  );
}
