import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

const ACCENT = "#D4AF37";

export function NameShareV2() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#0E0A06" }}>
      <img
        src="/__mockup/images/nuur-premium/name-share-v2-bg.png?v=1"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at center, rgba(15, 10, 6, 0.3) 0%, rgba(8, 5, 3, 0.85) 100%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "absolute", inset: 16, border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "160px 160px 12px 12px", pointerEvents: "none", zIndex: 5 }} />
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: "'Amiri Quran', serif", fontSize: 64, lineHeight: 1.2, color: "#F3E3B6", direction: "rtl", textShadow: "0px 2px 8px rgba(0,0,0,0.7)", marginBottom: 8 }}>
          ٱلرَّحْمَٰن
        </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, letterSpacing: "0.05em", color: "#F0DDB5", marginBottom: 6, textShadow: "0px 1px 4px rgba(0,0,0,0.6)" }}>
          Ar-Rahman
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontStyle: "italic", color: "#D8C394", opacity: 0.9, textShadow: "0px 1px 3px rgba(0,0,0,0.55)" }}>
          The Most Merciful
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 32, left: 0, right: 0 }}>
        <NuurBrandFooter color={ACCENT} dim="rgba(212, 175, 55, 0.45)" iconSize={32} />
      </div>
    </div>
  );
}
