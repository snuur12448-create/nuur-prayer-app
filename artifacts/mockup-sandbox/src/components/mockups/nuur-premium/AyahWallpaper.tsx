import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

export function AyahWallpaper() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#0B111A" }}>
      <img 
        src="/__mockup/images/nuur-premium/ayah-wallpaper.png" 
        alt="" 
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} 
      />
      <div 
        style={{ 
          position: "absolute", 
          inset: 0, 
          background: "linear-gradient(to bottom, rgba(11, 17, 26, 0.2) 0%, rgba(11, 17, 26, 0.7) 50%, rgba(7, 11, 18, 0.95) 100%)", 
          pointerEvents: "none" 
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
          textAlign: "center"
        }}
      >
        <div style={{
          fontFamily: "'Amiri Quran', serif",
          fontSize: 36,
          lineHeight: 1.8,
          color: "#E2E8F0",
          direction: "rtl",
          textShadow: "0px 2px 6px rgba(0,0,0,0.8)",
          marginBottom: 24
        }}>
          قُلْ هُوَ ٱللَّهُ أَحَدٌ
        </div>
        
        <div style={{ width: 40, height: 1, background: "#8A9FB1", opacity: 0.4, marginBottom: 24 }} />
        
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 22,
          fontStyle: "italic",
          lineHeight: 1.4,
          color: "#E2E8F0",
          opacity: 0.95,
          marginBottom: 20
        }}>
          "Say, He is Allah, the One."
        </div>
        
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#8A9FB1",
          opacity: 0.7
        }}>
          Surah Al-Ikhlas · 112:1
        </div>
      </div>
      
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0 }}>
        <NuurBrandFooter color="#E2E8F0" dim="rgba(138, 159, 177, 0.5)" />
      </div>
    </div>
  );
}
