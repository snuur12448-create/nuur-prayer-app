import React from "react";
import { BrandLockup, CardFrame, CREAM, CREAM_DIM, GOLD, GOLD_DIM, LabelBand, NuurMark, StarDivider, StarOrnament } from "./_shared";

export function Names() {
  return (
    <CardFrame glow="warm" decor="mosque-right">
      {/* TOP: Nuur mark */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 6 }}>
        <NuurMark size={32} />
      </div>

      {/* Label band */}
      <div style={{ marginTop: 16 }}>
        <LabelBand>99 Names of Allah</LabelBand>
      </div>

      {/* Monumental Arabic name */}
      <div
        style={{
          marginTop: 28,
          fontFamily: "'Amiri Quran', 'Amiri', serif",
          fontSize: 92,
          lineHeight: 1.15,
          textAlign: "center",
          direction: "rtl",
          color: CREAM,
          textShadow: "0 0 36px rgba(201, 163, 95, 0.35), 0 0 12px rgba(245, 236, 215, 0.2)",
        }}
      >
        ٱلرَّحْمَـٰن
      </div>

      {/* Transliteration */}
      <div
        style={{
          marginTop: 14,
          fontFamily: "'Inter', sans-serif",
          fontSize: 18,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          textAlign: "center",
          color: CREAM,
          fontWeight: 500,
        }}
      >
        Ar-Rahman
      </div>

      {/* Divider */}
      <div style={{ marginTop: 16 }}>
        <StarDivider width={50} />
      </div>

      {/* Meaning header */}
      <div
        style={{
          marginTop: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <StarOrnament size={11} />
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.4em",
            color: GOLD,
            fontWeight: 600,
            textTransform: "uppercase",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Meaning
        </div>
      </div>

      {/* Meaning text */}
      <div
        style={{
          marginTop: 10,
          fontFamily: "'Inter', sans-serif",
          fontSize: 16,
          lineHeight: 1.55,
          textAlign: "center",
          color: CREAM,
          padding: "0 20px",
          fontWeight: 400,
        }}
      >
        The Most Compassionate,<br />
        The Entirely Merciful.
      </div>

      {/* Divider with diamond */}
      <div
        style={{
          marginTop: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <div style={{ width: 70, height: 1, background: GOLD_DIM }} />
        <div style={{ width: 6, height: 6, background: GOLD, transform: "rotate(45deg)" }} />
        <div style={{ width: 70, height: 1, background: GOLD_DIM }} />
      </div>

      {/* Verse where the name is mentioned */}
      <div
        style={{
          marginTop: 14,
          textAlign: "center",
          color: GOLD,
          fontFamily: "'Playfair Display', serif",
          fontSize: 18,
          lineHeight: 1,
          fontWeight: 700,
        }}
      >
        “
      </div>
      <div
        style={{
          marginTop: 4,
          fontFamily: "'Amiri Quran', 'Amiri', serif",
          fontSize: 22,
          lineHeight: 1.7,
          textAlign: "center",
          direction: "rtl",
          color: CREAM,
        }}
      >
        وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ
      </div>
      <div
        style={{
          marginTop: 8,
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          textAlign: "center",
          color: CREAM_DIM,
          fontWeight: 400,
          padding: "0 20px",
        }}
      >
        And My mercy encompasses all things.
      </div>

      {/* Source: — QURAN 7:156 — */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <div style={{ width: 14, height: 1, background: GOLD }} />
        <div
          style={{
            fontSize: 10.5,
            letterSpacing: "0.32em",
            color: GOLD,
            fontWeight: 600,
            textTransform: "uppercase",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Quran 7:156
        </div>
        <div style={{ width: 14, height: 1, background: GOLD }} />
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ marginBottom: 4 }}>
        <BrandLockup />
      </div>
    </CardFrame>
  );
}
