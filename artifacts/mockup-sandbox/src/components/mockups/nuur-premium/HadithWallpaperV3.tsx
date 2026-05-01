import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

const INK = "#3A2418";
const ACCENT = "#7A4A2E";

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
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, lineHeight: 1.4, color: INK, marginBottom: 24, textShadow: "0px 1px 2px rgba(255,235,210,0.6)" }}>
          "The best of people are those who bring most benefit to the people."
        </div>
        <div style={{ width: 40, height: 1, background: ACCENT, opacity: 0.6, marginBottom: 24 }} />
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: ACCENT, opacity: 0.9 }}>
          Daraqutni
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0 }}>
        <NuurBrandFooter color={INK} dim="rgba(122, 74, 46, 0.6)" />
      </div>
    </div>
  );
}
