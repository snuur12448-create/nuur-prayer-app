import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

const INK = "#3A1F12";
const ACCENT = "#7A4A2E";
const INK_DIM = "rgba(122, 74, 46, 0.7)";

export function HadithShareV3() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#E8C5A2" }}>
      <img
        src="/__mockup/images/nuur-premium/hadith-share-v3-bg.png?v=1"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 80% 70% at 40% 45%, rgba(255, 240, 220, 0.3) 0%, rgba(255, 230, 200, 0) 100%)",
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
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, lineHeight: 1.3, color: INK, marginBottom: 16, textShadow: "0px 1px 2px rgba(255,235,210,0.6)" }}>
          Actions are but by intentions.
        </div>
        <div style={{ width: 30, height: 1, background: ACCENT, opacity: 0.7, marginBottom: 16 }} />
        <div style={{ fontFamily: "'Amiri Quran', serif", fontSize: 18, color: INK, direction: "rtl", opacity: 0.9, marginBottom: 20, textShadow: "0px 1px 2px rgba(255,235,210,0.6)" }}>
          إنما الأعمال بالنيات
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: ACCENT, opacity: 0.85 }}>
          Bukhari & Muslim
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 24, left: 0, right: 0 }}>
        <NuurBrandFooter color={INK} dim={INK_DIM} iconSize={32} />
      </div>
    </div>
  );
}
