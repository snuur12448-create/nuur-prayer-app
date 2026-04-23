import React from "react";
import { CardFrame, CREAM, CREAM_DIM, GOLD, NuurMark, Reference, TopLabel } from "./_shared";

export function Names() {
  return (
    <CardFrame tone="warm">
      <TopLabel>99 Names of Allah</TopLabel>

      <div style={{ flex: 1 }} />

      {/* Arabic name — the focal point */}
      <div
        style={{
          fontFamily: "'Amiri Quran', 'Amiri', serif",
          fontSize: 96,
          lineHeight: 1.1,
          textAlign: "center",
          direction: "rtl",
          color: CREAM,
          fontWeight: 400,
          textShadow: "0 0 30px rgba(255, 210, 140, 0.18)",
        }}
      >
        ٱلرَّحْمَـٰن
      </div>

      {/* Transliteration */}
      <div
        style={{
          marginTop: 18,
          fontFamily: "'Inter', sans-serif",
          fontSize: 16,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          textAlign: "center",
          color: CREAM,
          fontWeight: 400,
        }}
      >
        Ar-Rahman
      </div>

      {/* Meaning */}
      <div
        style={{
          marginTop: 22,
          fontFamily: "'Inter', sans-serif",
          fontSize: 14.5,
          lineHeight: 1.65,
          textAlign: "center",
          color: CREAM_DIM,
          fontWeight: 400,
          maxWidth: 320,
          alignSelf: "center",
        }}
      >
        The Most Compassionate, the Entirely Merciful.
      </div>

      <div style={{ flex: 1 }} />

      {/* Quran intro — single muted line */}
      <div
        style={{
          fontFamily: "'Amiri', serif",
          fontSize: 18,
          lineHeight: 1.6,
          textAlign: "center",
          direction: "rtl",
          color: CREAM_DIM,
          fontWeight: 400,
        }}
      >
        وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ
      </div>
      <div
        style={{
          marginTop: 8,
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          lineHeight: 1.6,
          textAlign: "center",
          color: CREAM_DIM,
          fontWeight: 400,
          fontStyle: "italic",
        }}
      >
        “And My mercy encompasses all things.”
      </div>

      <div style={{ marginTop: 18 }}>
        <Reference>Quran 7:156</Reference>
      </div>

      <div style={{ marginTop: 24 }}>
        <NuurMark />
      </div>
    </CardFrame>
  );
}
