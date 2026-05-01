import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

const INK = "#EAEFE8";

export function DuaWallpaperV3() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#1F3540" }}>
      <img
        src="/__mockup/images/nuur-premium/dua-wallpaper-v3-bg.png?v=1"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(20, 35, 48, 0.15) 0%, rgba(20, 35, 48, 0.05) 35%, rgba(20, 35, 48, 0.2) 65%, rgba(15, 25, 35, 0.55) 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "45%",
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
        <div style={{ fontFamily: "'Amiri Quran', serif", fontSize: 32, lineHeight: 1.8, color: INK, direction: "rtl", textShadow: "0px 2px 8px rgba(0,0,0,0.6)", marginBottom: 24 }}>
          لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ
        </div>
        <div style={{ width: 40, height: 1, background: INK, opacity: 0.35, marginBottom: 24 }} />
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontStyle: "italic", lineHeight: 1.45, color: INK, opacity: 0.95, marginBottom: 20, textShadow: "0px 2px 6px rgba(0,0,0,0.55)" }}>
          "There is no might nor power except with Allah."
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: INK, opacity: 0.7, textShadow: "0px 1px 4px rgba(0,0,0,0.55)" }}>
          Bukhari · Daily Adhkar
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0 }}>
        <NuurBrandFooter color={INK} dim="rgba(234, 239, 232, 0.55)" />
      </div>
    </div>
  );
}
