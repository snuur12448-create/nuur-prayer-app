import React from "react";
import { ARABIC_FONT, FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "./_shared";

const CREAM = "#F1E8D2";
const SAGE = "#7E8B6F";
const SAGE_DEEP = "#3E4A36";
const INK = "#2A3024";

function LeafCluster({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="140"
      height="200"
      viewBox="0 0 140 200"
      style={{ transform: flip ? "scaleX(-1)" : "none" }}
    >
      <g stroke={SAGE_DEEP} strokeWidth="1.1" fill="none" opacity="0.85">
        <path d="M 70 200 Q 60 140 70 60 Q 75 30 80 5" />
        <path d="M 70 170 Q 30 160 12 130" />
        <path d="M 70 145 Q 110 135 130 100" />
        <path d="M 70 115 Q 30 105 18 75" />
        <path d="M 70 85 Q 105 80 122 55" />
      </g>
      <g fill={SAGE} opacity="0.85">
        <ellipse cx="22" cy="128" rx="14" ry="6" transform="rotate(-25 22 128)" />
        <ellipse cx="120" cy="100" rx="14" ry="6" transform="rotate(25 120 100)" />
        <ellipse cx="28" cy="73" rx="13" ry="5.5" transform="rotate(-30 28 73)" />
        <ellipse cx="115" cy="55" rx="12" ry="5" transform="rotate(28 115 55)" />
        <ellipse cx="78" cy="20" rx="10" ry="4.5" transform="rotate(-15 78 20)" />
      </g>
      <g fill={SAGE_DEEP} opacity="0.55">
        <ellipse cx="38" cy="155" rx="9" ry="4" transform="rotate(-15 38 155)" />
        <ellipse cx="100" cy="125" rx="10" ry="4" transform="rotate(20 100 125)" />
        <ellipse cx="60" cy="50" rx="8" ry="3.5" transform="rotate(-20 60 50)" />
      </g>
    </svg>
  );
}

export function DuaCard() {
  return (
    <FullBleed background={CREAM} ratio="1/1">
      <div style={{ position: "absolute", left: -20, top: 30, opacity: 0.75 }}>
        <LeafCluster />
      </div>
      <div
        style={{
          position: "absolute",
          right: -10,
          bottom: 40,
          opacity: 0.55,
          transform: "rotate(180deg)",
        }}
      >
        <LeafCluster flip />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "60px 70px 36px 70px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontFamily: SANS_FONT,
            fontSize: 9.5,
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: SAGE_DEEP,
            textAlign: "center",
            opacity: 0.8,
          }}
        >
          Daily Dua
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            fontFamily: ARABIC_FONT,
            fontSize: 32,
            lineHeight: 1.9,
            textAlign: "center",
            direction: "rtl",
            color: INK,
            fontWeight: 400,
          }}
        >
          رَبِّ ٱغْفِرْ لِي وَٱرْحَمْنِي وَٱجْبُرْنِي
        </div>

        <div
          style={{
            marginTop: 28,
            fontFamily: SERIF_FONT,
            fontSize: 17,
            lineHeight: 1.55,
            textAlign: "center",
            color: SAGE_DEEP,
            fontWeight: 400,
            fontStyle: "italic",
            maxWidth: 360,
            alignSelf: "center",
          }}
        >
          “My Lord, forgive me, have mercy on me, and raise me up.”
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            fontFamily: SANS_FONT,
            fontSize: 9,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: SAGE,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Sunan at-Tirmidhī · 284
        </div>
        <NuurMark color={SAGE_DEEP} dim={SAGE_DEEP + "AA"} />
      </div>
    </FullBleed>
  );
}
