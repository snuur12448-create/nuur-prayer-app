import React from "react";
import { NuurBrandFooter, autoHalo } from "../dua-templates/_base";

const INK = "#2A1A0E";
const ACCENT = "#5C3520";
const HALO = autoHalo(INK, 2);

export function NameWallpaperV4() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#E8DCC4" }}>
      <img
        src="/__mockup/images/nuur-premium/name-wallpaper-v4-bg.png?v=1"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(255, 245, 220, 0.4) 0%, rgba(245, 230, 200, 0.1) 40%, rgba(190, 150, 100, 0.35) 100%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "absolute", inset: "24px 20px 80px 20px", border: "1px solid rgba(122, 74, 46, 0.3)", borderRadius: "180px 180px 16px 16px", pointerEvents: "none", zIndex: 5 }} />
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 40px",
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: "'Amiri Quran', serif", fontSize: 72, lineHeight: 1.2, color: INK, direction: "rtl", textShadow: HALO, marginBottom: 16 }}>
          ٱلْقُدُّوس
        </div>
        <div style={{ width: 40, height: 1, background: ACCENT, opacity: 0.7, marginBottom: 20 }} />
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 27, fontWeight: 700, letterSpacing: "0.05em", color: INK, marginBottom: 8, textShadow: HALO }}>
          Al-Quddus
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontStyle: "italic", color: ACCENT, opacity: 1, textShadow: HALO }}>
          The Pure, The Holy
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0 }}>
        <NuurBrandFooter color={INK} dim="rgba(92, 53, 32, 0.9)" scrim />
      </div>
    </div>
  );
}
