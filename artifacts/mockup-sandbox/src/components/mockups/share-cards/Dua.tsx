import React from "react";
import { CardFrame, CREAM, CREAM_DIM, NuurMark, Reference, TopLabel } from "./_shared";

export function Dua() {
  return (
    <CardFrame tone="amber">
      <TopLabel>Morning Dua</TopLabel>

      <div style={{ flex: 1 }} />

      {/* Arabic */}
      <div
        style={{
          fontFamily: "'Amiri Quran', 'Amiri', serif",
          fontSize: 30,
          lineHeight: 2,
          textAlign: "center",
          direction: "rtl",
          color: CREAM,
          fontWeight: 400,
        }}
      >
        اَللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا
      </div>

      {/* Translation */}
      <div
        style={{
          marginTop: 32,
          fontFamily: "'Inter', sans-serif",
          fontSize: 14.5,
          lineHeight: 1.7,
          textAlign: "center",
          color: CREAM_DIM,
          fontWeight: 400,
          maxWidth: 340,
          alignSelf: "center",
        }}
      >
        O Allah, I ask You for knowledge that is beneficial, provision that is pure, and deeds that are accepted.
      </div>

      <div style={{ flex: 1 }} />

      <Reference>Sunan Ibn Mājah&nbsp;&nbsp;·&nbsp;&nbsp;925</Reference>

      <div style={{ marginTop: 28 }}>
        <NuurMark />
      </div>
    </CardFrame>
  );
}
