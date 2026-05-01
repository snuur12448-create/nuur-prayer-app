import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

const INK = "#F2E5DC";

export function AyahWallpaperV3() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#1B1530" }}>
      <img
        src="/__mockup/images/nuur-premium/ayah-wallpaper-v3-bg.png?v=1"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(20, 14, 36, 0.2) 0%, rgba(45, 22, 52, 0.5) 55%, rgba(15, 8, 22, 0.92) 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
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
        <div style={{ fontFamily: "'Amiri Quran', serif", fontSize: 36, lineHeight: 1.8, color: INK, direction: "rtl", textShadow: "0px 2px 6px rgba(0,0,0,0.7)", marginBottom: 24 }}>
          قُلْ هُوَ ٱللَّهُ أَحَدٌ
        </div>
        <div style={{ width: 40, height: 1, background: "#D8B4A0", opacity: 0.5, marginBottom: 24 }} />
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: "italic", lineHeight: 1.4, color: INK, opacity: 0.95, marginBottom: 20, textShadow: "0px 1px 4px rgba(0,0,0,0.6)" }}>
          "Say, He is Allah, the One."
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#D8B4A0", opacity: 0.85 }}>
          Surah Al-Ikhlas · 112:1
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0 }}>
        <NuurBrandFooter color={INK} dim="rgba(216, 180, 160, 0.6)" />
      </div>
    </div>
  );
}
