import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

const INK = "#3F2A1A";

export function DuaWallpaperV4() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#F4DDB5" }}>
      <img
        src="/__mockup/images/nuur-premium/dua-wallpaper-v4-bg.png?v=1"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(255, 240, 215, 0.4) 0%, rgba(255, 240, 215, 0.1) 35%, rgba(255, 240, 215, 0.05) 65%, rgba(190, 140, 90, 0.45) 100%)",
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
        <div style={{ fontFamily: "'Amiri Quran', serif", fontSize: 32, lineHeight: 1.8, color: INK, direction: "rtl", textShadow: "0px 1px 3px rgba(255,235,200,0.7)", marginBottom: 24 }}>
          لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ
        </div>
        <div style={{ width: 40, height: 1, background: INK, opacity: 0.4, marginBottom: 24 }} />
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontStyle: "italic", lineHeight: 1.45, color: INK, opacity: 0.92, marginBottom: 20, textShadow: "0px 1px 2px rgba(255,235,200,0.6)" }}>
          "There is no might nor power except with Allah."
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: INK, opacity: 0.65 }}>
          Bukhari · Daily Adhkar
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0 }}>
        <NuurBrandFooter color={INK} dim="rgba(63, 42, 26, 0.55)" />
      </div>
    </div>
  );
}
