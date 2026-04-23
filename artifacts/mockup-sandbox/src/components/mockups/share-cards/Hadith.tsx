import React from "react";
import { CardFrame, CREAM, CREAM_DIM, NuurMark, Reference, TopLabel } from "./_shared";

export function Hadith() {
  return (
    <CardFrame tone="warm">
      {/* Top label */}
      <TopLabel>Hadith&nbsp;&nbsp;•&nbsp;&nbsp;Intentions</TopLabel>

      <div style={{ flex: 1 }} />

      {/* Arabic — dominant */}
      <div
        style={{
          fontFamily: "'Amiri Quran', 'Amiri', serif",
          fontSize: 34,
          lineHeight: 1.95,
          textAlign: "center",
          direction: "rtl",
          color: CREAM,
          fontWeight: 400,
        }}
      >
        إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَىٰ
      </div>

      {/* Translation — small, muted */}
      <div
        style={{
          marginTop: 36,
          fontFamily: "'Inter', sans-serif",
          fontSize: 14.5,
          lineHeight: 1.7,
          textAlign: "center",
          color: CREAM_DIM,
          fontWeight: 400,
          padding: "0 8px",
          maxWidth: 360,
          alignSelf: "center",
        }}
      >
        Actions are judged by their intentions, and every person will receive what they intended.
      </div>

      <div style={{ flex: 1 }} />

      {/* Reference */}
      <Reference>Sahih Bukhari &amp; Muslim</Reference>

      {/* Brand */}
      <div style={{ marginTop: 28 }}>
        <NuurMark />
      </div>
    </CardFrame>
  );
}
