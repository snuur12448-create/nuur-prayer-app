import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

export function NameWallpaperV2() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#1A1028" }}>
      <img
        src="/__mockup/images/nuur-premium/name-wallpaper-v2-bg.png?v=1"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(25, 15, 40, 0.1) 0%, rgba(25, 12, 35, 0.55) 50%, rgba(10, 5, 20, 0.92) 100%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "absolute", inset: "24px 20px 80px 20px", border: "1px solid rgba(212, 175, 55, 0.22)", borderRadius: "180px 180px 16px 16px", pointerEvents: "none", zIndex: 5 }} />
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
        <div style={{ fontFamily: "'Amiri Quran', serif", fontSize: 72, lineHeight: 1.2, color: "#F3E3B6", direction: "rtl", textShadow: "0px 2px 10px rgba(0,0,0,0.7)", marginBottom: 16 }}>
          ٱلْقُدُّوس
        </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, letterSpacing: "0.05em", color: "#F0DBAA", marginBottom: 8, textShadow: "0px 1px 4px rgba(0,0,0,0.6)" }}>
          Al-Quddus
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontStyle: "italic", color: "#D8C394", opacity: 0.9, textShadow: "0px 1px 3px rgba(0,0,0,0.55)" }}>
          The Pure, The Holy
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0 }}>
        <NuurBrandFooter color="#D4AF37" dim="rgba(212, 175, 55, 0.4)" />
      </div>
    </div>
  );
}
