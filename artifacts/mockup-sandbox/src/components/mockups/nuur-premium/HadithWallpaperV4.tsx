import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

export function HadithWallpaperV4() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#2A1610" }}>
      <img
        src="/__mockup/images/nuur-premium/hadith-wallpaper-v4-bg.png?v=1"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(45, 22, 16, 0.25) 0%, rgba(45, 22, 16, 0.5) 55%, rgba(20, 10, 6, 0.92) 100%)",
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
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, lineHeight: 1.4, color: "#F0DDC0", marginBottom: 24, textShadow: "0px 2px 6px rgba(0,0,0,0.7)" }}>
          "The best of people are those who bring most benefit to the people."
        </div>
        <div style={{ width: 40, height: 1, background: "#C2A881", opacity: 0.55, marginBottom: 24 }} />
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C2A881", opacity: 0.85 }}>
          Daraqutni
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0 }}>
        <NuurBrandFooter color="#F0DDC0" dim="rgba(194, 168, 129, 0.85)" scrim />
      </div>
    </div>
  );
}
