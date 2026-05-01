import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

const ACCENT = "#88D4A8";

export function NameShareV4() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#04140C" }}>
      <img
        src="/__mockup/images/nuur-premium/name-share-v4-bg.png?v=1"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at center, rgba(8, 22, 14, 0.3) 0%, rgba(3, 12, 7, 0.85) 100%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "absolute", inset: 16, border: "1px solid rgba(136, 212, 168, 0.22)", borderRadius: "160px 160px 12px 12px", pointerEvents: "none", zIndex: 5 }} />
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
        <div style={{ fontFamily: "'Amiri Quran', serif", fontSize: 64, lineHeight: 1.2, color: "#E8F4ED", direction: "rtl", textShadow: "0px 2px 8px rgba(0,0,0,0.7)", marginBottom: 8 }}>
          ٱلرَّحْمَٰن
        </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, letterSpacing: "0.05em", color: "#DDEDE2", marginBottom: 6, textShadow: "0px 1px 4px rgba(0,0,0,0.6)" }}>
          Ar-Rahman
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontStyle: "italic", color: "#B8D4C2", opacity: 0.9, textShadow: "0px 1px 3px rgba(0,0,0,0.55)" }}>
          The Most Merciful
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 32, left: 0, right: 0 }}>
        <NuurBrandFooter color={ACCENT} dim="rgba(136, 212, 168, 0.45)" iconSize={32} />
      </div>
    </div>
  );
}
