import React from "react";
import { NuurBrandFooter, autoHalo } from "../dua-templates/_base";

const INK = "#26302A";
const HALO = autoHalo(INK, 2);

export function DuaWallpaperV2() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#DFE5E0" }}>
      <img
        src="/__mockup/images/nuur-premium/dua-wallpaper-v2-bg.png?v=1"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      {/* Slightly stronger top-down scrim than v1 to anchor the body text above the misty sky */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(245, 245, 235, 0.55) 0%, rgba(245, 245, 235, 0.15) 35%, rgba(245, 245, 235, 0.05) 65%, rgba(225, 220, 205, 0.45) 100%)",
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
        <div style={{ fontFamily: "'Amiri Quran', serif", fontSize: 32, lineHeight: 1.8, color: INK, direction: "rtl", textShadow: HALO, marginBottom: 24 }}>
          لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ
        </div>
        <div style={{ width: 40, height: 1, background: INK, opacity: 0.45, marginBottom: 24 }} />
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontStyle: "italic", lineHeight: 1.45, color: INK, opacity: 1, marginBottom: 20, textShadow: HALO }}>
          "There is no might nor power except with Allah."
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: INK, opacity: 0.85, fontWeight: 500, textShadow: HALO }}>
          Bukhari · Daily Adhkar
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0 }}>
        <NuurBrandFooter color={INK} dim="rgba(38, 48, 42, 0.85)" />
      </div>
    </div>
  );
}
