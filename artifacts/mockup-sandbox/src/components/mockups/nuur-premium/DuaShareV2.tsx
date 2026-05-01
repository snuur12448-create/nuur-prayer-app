import React from "react";
import { NuurBrandFooter, autoHalo } from "../dua-templates/_base";

const INK = "#26302A";
const INK_DIM = "rgba(38, 48, 42, 0.85)";
const HALO = autoHalo(INK, 1);

export function DuaShareV2() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#DFE5E0" }}>
      <img
        src="/__mockup/images/nuur-premium/dua-share-v2-bg.png?v=4"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(245, 245, 235, 0.55) 0%, rgba(245, 245, 235, 0.15) 35%, rgba(245, 245, 235, 0.05) 65%, rgba(225, 220, 205, 0.4) 100%)",
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
            textShadow: HALO,
            marginBottom: 22,
          }}
        >
          لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ
        </div>

        <div style={{ width: 40, height: 1, background: INK, opacity: 0.45, marginBottom: 22 }} />

        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 19,
            fontStyle: "italic",
            lineHeight: 1.45,
            color: INK,
            opacity: 1,
            marginBottom: 18,
            textShadow: HALO,
          }}
        >
          "There is no might nor power except with Allah."
        </div>

        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: INK,
            opacity: 0.85,
            fontWeight: 500,
            textShadow: HALO,
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
