import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

const INK = "#EAEFE8";
const INK_DIM = "rgba(234, 239, 232, 0.6)";

export function DuaShareV3() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#1F3540" }}>
      <img
        src="/__mockup/images/nuur-premium/dua-share-v3-bg.png?v=4"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(20, 35, 48, 0.15) 0%, rgba(20, 35, 48, 0.05) 35%, rgba(20, 35, 48, 0.15) 65%, rgba(20, 35, 48, 0.5) 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 110,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 40px",
          textAlign: "center",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: "'Amiri Quran', serif",
            fontSize: 28,
            lineHeight: 1.85,
            color: INK,
            direction: "rtl",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            marginBottom: 22,
          }}
        >
          لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ
        </div>

        <div style={{ width: 40, height: 1, background: INK, opacity: 0.35, marginBottom: 22 }} />

        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 18,
            fontStyle: "italic",
            lineHeight: 1.45,
            color: INK,
            opacity: 0.95,
            marginBottom: 18,
            textShadow: "0 2px 6px rgba(0,0,0,0.5)",
          }}
        >
          "There is no might nor power except with Allah."
        </div>

        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: INK,
            opacity: 0.7,
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
          }}
        >
          Bukhari · Daily Adhkar
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 22, left: 0, right: 0, zIndex: 3 }}>
        <NuurBrandFooter color={INK} dim={INK_DIM} iconSize={32} />
      </div>
    </div>
  );
}
