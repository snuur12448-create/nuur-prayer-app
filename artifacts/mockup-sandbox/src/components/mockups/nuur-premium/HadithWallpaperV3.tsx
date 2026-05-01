import React from "react";
import { NuurBrandFooter, autoHalo } from "../dua-templates/_base";

const INK = "#2A170D";
const ACCENT = "#5C3520";
const HALO = autoHalo(INK, 2);

export function HadithWallpaperV3() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#E8C5A2" }}>
      <img
        src="/__mockup/images/nuur-premium/hadith-wallpaper-v3-bg.png?v=1"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(255, 240, 215, 0.35) 0%, rgba(255, 230, 200, 0.05) 40%, rgba(180, 130, 80, 0.3) 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "26%",
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
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 27, fontWeight: 600, lineHeight: 1.4, color: INK, marginBottom: 24, textShadow: HALO }}>
          "The best of people are those who bring most benefit to the people."
        </div>
        <div style={{ width: 40, height: 1, background: ACCENT, opacity: 0.75, marginBottom: 24 }} />
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: ACCENT, opacity: 1, fontWeight: 500, textShadow: HALO }}>
          Daraqutni
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 280, left: 0, right: 0 }}>
        <NuurBrandFooter color={INK} dim="rgba(92, 53, 32, 0.95)" iconSize={32} />
      </div>
    </div>
  );
}
