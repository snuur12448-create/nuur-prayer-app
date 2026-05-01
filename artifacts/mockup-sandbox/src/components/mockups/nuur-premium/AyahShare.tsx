import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

export function AyahShare() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#050b14" }}>
      <img 
        src="/__mockup/images/nuur-premium/ayah-share.png" 
        alt="" 
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} 
      />
      <div 
        style={{ 
          position: "absolute", 
          inset: 0, 
          background: "radial-gradient(circle at center, rgba(5, 11, 20, 0.4) 0%, rgba(5, 11, 20, 0.8) 100%)", 
          pointerEvents: "none" 
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
          textAlign: "center"
        }}
      >
        <div style={{
          fontFamily: "'Amiri Quran', serif",
          fontSize: 32,
          lineHeight: 1.8,
          color: "#E2E8F0",
          direction: "rtl",
          textShadow: "0px 2px 4px rgba(0,0,0,0.5)",
          marginBottom: 16
        }}>
          إِنَّ مَعَ الْعُسْرِ يُسْرًا
        </div>
        
        <div style={{ width: 40, height: 1, background: "#8A9FB1", opacity: 0.5, marginBottom: 16 }} />
        
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 20,
          fontStyle: "italic",
          lineHeight: 1.4,
          color: "#E2E8F0",
          opacity: 0.9,
          marginBottom: 16
        }}>
          "Indeed, with hardship [will be] ease."
        </div>
        
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 9,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#8A9FB1",
          opacity: 0.8
        }}>
          Surah Ash-Sharh · 94:6
        </div>
      </div>
      
      <div style={{ position: "absolute", bottom: 24, left: 0, right: 0 }}>
        <NuurBrandFooter color="#E2E8F0" dim="rgba(138, 159, 177, 0.7)" />
      </div>
    </div>
  );
}
