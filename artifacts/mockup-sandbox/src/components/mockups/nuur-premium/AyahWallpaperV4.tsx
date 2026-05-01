import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

const INK = "#FFE9D8";

export function AyahWallpaperV4() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#2E0F2E" }}>
      <img
        src="/__mockup/images/nuur-premium/ayah-wallpaper-v4-bg.png?v=1"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(46, 15, 46, 0.3) 0%, rgba(46, 15, 46, 0.15) 35%, rgba(80, 25, 30, 0.55) 70%, rgba(20, 5, 12, 0.9) 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "30%",
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
        <div style={{ fontFamily: "'Amiri Quran', serif", fontSize: 36, lineHeight: 1.8, color: INK, direction: "rtl", textShadow: "0px 2px 8px rgba(0,0,0,0.7)", marginBottom: 24 }}>
          قُلْ هُوَ ٱللَّهُ أَحَدٌ
        </div>
        <div style={{ width: 40, height: 1, background: "#FFC9A8", opacity: 0.55, marginBottom: 24 }} />
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: "italic", lineHeight: 1.4, color: INK, opacity: 0.95, marginBottom: 20, textShadow: "0px 1px 4px rgba(0,0,0,0.65)" }}>
          "Say, He is Allah, the One."
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#FFC9A8", opacity: 0.85 }}>
          Surah Al-Ikhlas · 112:1
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0 }}>
        <NuurBrandFooter color={INK} dim="rgba(255, 201, 168, 0.6)" />
      </div>
    </div>
  );
}
