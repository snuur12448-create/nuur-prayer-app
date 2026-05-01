import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

export function HadithShareV2() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#3A2A22" }}>
      <img
        src="/__mockup/images/nuur-premium/hadith-share-v2-bg.png?v=1"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 65% 55% at 45% 50%, rgba(20, 10, 6, 0.55) 0%, rgba(30, 18, 12, 0.3) 50%, rgba(20, 10, 6, 0.7) 100%)",
          pointerEvents: "none",
        }}
      />
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
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, lineHeight: 1.3, color: "#E8DCC4", marginBottom: 16, textShadow: "0px 2px 4px rgba(0,0,0,0.6)" }}>
          Actions are but by intentions.
        </div>
        <div style={{ width: 30, height: 1, background: "#C2A881", opacity: 0.6, marginBottom: 16 }} />
        <div style={{ fontFamily: "'Amiri Quran', serif", fontSize: 18, color: "#D0BFA1", direction: "rtl", opacity: 0.9, marginBottom: 20, textShadow: "0px 1px 4px rgba(0,0,0,0.55)" }}>
          إنما الأعمال بالنيات
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C2A881", opacity: 0.75 }}>
          Bukhari & Muslim
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 24, left: 0, right: 0 }}>
        <NuurBrandFooter color="#E8DCC4" dim="rgba(232, 220, 196, 0.5)" iconSize={32} />
      </div>
    </div>
  );
}
