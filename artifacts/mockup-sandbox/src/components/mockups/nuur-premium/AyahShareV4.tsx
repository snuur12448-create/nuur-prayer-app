import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

const ARABIC_FONT = "'Amiri Quran', serif";
const SERIF_FONT = "'Cormorant Garamond', Georgia, serif";
const SANS_FONT = "'Inter', system-ui, sans-serif";

const INK = "#FBEEDE";
const INK_DIM = "rgba(251, 238, 222, 0.65)";

export function AyahShareV4() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#3A1730" }}>
      <img
        src="/__mockup/images/nuur-premium/ayah-share-v4-bg.png?v=1"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 90% 70% at 50% 45%, rgba(0,0,0,0) 35%, rgba(40, 10, 40, 0.5) 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "72px 40px 96px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          zIndex: 2,
        }}
      >
        <div style={{ fontFamily: ARABIC_FONT, fontSize: 36, lineHeight: 1.7, color: INK, direction: "rtl", textShadow: "0 2px 12px rgba(0,0,0,0.6)", letterSpacing: "0.01em" }}>
          إِنَّ مَعَ الْعُسْرِ يُسْرًا
        </div>
        <div style={{ width: 44, height: 1, background: INK, opacity: 0.5, margin: "22px 0 18px" }} />
        <div style={{ fontFamily: SERIF_FONT, fontSize: 18, fontStyle: "italic", lineHeight: 1.45, color: INK, opacity: 0.95, textShadow: "0 1px 6px rgba(0,0,0,0.55)", maxWidth: 320 }}>
          "Indeed, with hardship [will be] ease."
        </div>
        <div style={{ marginTop: 16, fontFamily: SANS_FONT, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: INK_DIM }}>
          Surah Ash-Sharh · 94:6
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, zIndex: 3 }}>
        <NuurBrandFooter color={INK} dim={INK_DIM} iconSize={32} />
      </div>
    </div>
  );
}
