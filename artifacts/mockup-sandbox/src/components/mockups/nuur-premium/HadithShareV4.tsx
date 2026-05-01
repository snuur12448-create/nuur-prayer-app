import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

export function HadithShareV4() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#2A1610" }}>
      <img
        src="/__mockup/images/nuur-premium/hadith-share-v4-bg.png?v=1"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 80% 70% at 50% 40%, rgba(45, 22, 16, 0) 0%, rgba(20, 10, 6, 0.55) 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, lineHeight: 1.3, color: "#F0DDC0", marginBottom: 16, textShadow: "0px 2px 6px rgba(0,0,0,0.7)" }}>
          Actions are but by intentions.
        </div>
        <div style={{ width: 30, height: 1, background: "#C2A881", opacity: 0.65, marginBottom: 16 }} />
        <div style={{ fontFamily: "'Amiri Quran', serif", fontSize: 18, color: "#DCC9A6", direction: "rtl", opacity: 0.92, marginBottom: 20, textShadow: "0px 1px 4px rgba(0,0,0,0.6)" }}>
          إنما الأعمال بالنيات
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C2A881", opacity: 0.8 }}>
          Bukhari & Muslim
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 24, left: 0, right: 0 }}>
        <NuurBrandFooter color="#F0DDC0" dim="rgba(240, 221, 192, 0.5)" iconSize={32} />
      </div>
    </div>
  );
}
