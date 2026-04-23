import React from "react";
import { BrandLockup, CardFrame, CREAM, CREAM_DIM, GOLD, LabelBand, NuurMark, StarDivider } from "./_shared";

export function Hadith() {
  return (
    <CardFrame bgUrl="/__mockup/images/bg-hadith.png">
      {/* TOP: Nuur mark */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
        <NuurMark size={32} />
      </div>

      {/* Label band */}
      <div style={{ marginTop: 18 }}>
        <LabelBand>Hadith&nbsp;&nbsp;·&nbsp;&nbsp;Intentions</LabelBand>
      </div>

      <div style={{ flex: 1 }} />

      {/* Arabic */}
      <div
        style={{
          fontFamily: "'Amiri Quran', 'Amiri', serif",
          fontSize: 36,
          lineHeight: 1.85,
          textAlign: "center",
          direction: "rtl",
          color: CREAM,
          padding: "0 8px",
          textShadow: "0 0 24px rgba(201, 163, 95, 0.18)",
        }}
      >
        إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَىٰ
      </div>

      {/* Divider */}
      <div style={{ marginTop: 28 }}>
        <StarDivider width={50} />
      </div>

      {/* English translation */}
      <div
        style={{
          marginTop: 26,
          fontFamily: "'Inter', sans-serif",
          fontSize: 16,
          lineHeight: 1.7,
          textAlign: "center",
          color: CREAM,
          fontWeight: 400,
          padding: "0 14px",
        }}
      >
        “Actions are judged by their intentions, and every person will get the reward according to what they intended.”
      </div>

      {/* Source */}
      <div
        style={{
          marginTop: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 13, color: GOLD, fontWeight: 500 }}>—</div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.28em",
            color: GOLD,
            fontWeight: 600,
            textTransform: "uppercase",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Sahih Bukhari &amp; Muslim
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Brand lockup (no logo above) */}
      <div style={{ marginBottom: 4 }}>
        <BrandLockup />
      </div>
    </CardFrame>
  );
}
