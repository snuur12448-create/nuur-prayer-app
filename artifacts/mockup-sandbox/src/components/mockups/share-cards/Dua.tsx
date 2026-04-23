import React from "react";
import { BrandLockup, CardFrame, CREAM, CREAM_DIM, GOLD, LabelBand, NuurMark, StarDivider } from "./_shared";

export function Dua() {
  return (
    <CardFrame glow="rise" decor="mosque-leaves">
      {/* TOP: Nuur mark */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
        <NuurMark size={32} />
      </div>

      {/* Label band */}
      <div style={{ marginTop: 18 }}>
        <LabelBand>Morning Dua</LabelBand>
      </div>

      {/* Arabic */}
      <div
        style={{
          marginTop: 36,
          fontFamily: "'Amiri Quran', 'Amiri', serif",
          fontSize: 32,
          lineHeight: 1.95,
          textAlign: "center",
          direction: "rtl",
          color: CREAM,
          padding: "0 6px",
          textShadow: "0 0 22px rgba(201, 163, 95, 0.16)",
        }}
      >
        اَللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا
      </div>

      {/* Divider */}
      <div style={{ marginTop: 26 }}>
        <StarDivider width={50} />
      </div>

      {/* Transliteration */}
      <div
        style={{
          marginTop: 22,
          fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: 14.5,
          lineHeight: 1.7,
          textAlign: "center",
          color: CREAM_DIM,
          padding: "0 16px",
        }}
      >
        Allahumma inni asʾaluka ʿilman naafiʿan,<br />
        wa rizqan tayyiban,<br />
        wa ʿamalan mutaqabbalan.
      </div>

      {/* Quote framed by curly quotes */}
      <div
        style={{
          marginTop: 22,
          textAlign: "center",
          color: GOLD,
          fontFamily: "'Playfair Display', serif",
          fontSize: 22,
          lineHeight: 1,
          fontWeight: 700,
        }}
      >
        “
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: "'Inter', sans-serif",
          fontSize: 15,
          lineHeight: 1.7,
          textAlign: "center",
          color: CREAM,
          padding: "0 18px",
          fontWeight: 400,
        }}
      >
        O Allah, I ask You for knowledge that is beneficial, provision that is pure, and deeds that are accepted.
      </div>
      <div
        style={{
          marginTop: 0,
          textAlign: "center",
          color: GOLD,
          fontFamily: "'Playfair Display', serif",
          fontSize: 22,
          lineHeight: 1,
          fontWeight: 700,
        }}
      >
        ”
      </div>

      {/* Source */}
      <div
        style={{
          marginTop: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <div style={{ width: 18, height: 1, background: GOLD }} />
        <div
          style={{
            fontSize: 10.5,
            letterSpacing: "0.28em",
            color: GOLD,
            fontWeight: 600,
            textTransform: "uppercase",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Sunan Ibn Mājah 925
        </div>
        <div style={{ width: 18, height: 1, background: GOLD }} />
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ marginBottom: 4 }}>
        <BrandLockup />
      </div>
    </CardFrame>
  );
}
