import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

export function HadithWallpaper() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#2D1E16" }}>
      <img 
        src="/__mockup/images/nuur-premium/hadith-wallpaper.png" 
        alt="" 
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} 
      />
      <div 
        style={{ 
          position: "absolute", 
          inset: 0, 
          background: "linear-gradient(to bottom, rgba(45, 30, 22, 0.3) 0%, rgba(35, 22, 15, 0.75) 50%, rgba(25, 15, 10, 0.95) 100%)", 
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
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 26,
          fontWeight: 500,
          lineHeight: 1.4,
          color: "#E8DCC4",
          marginBottom: 24,
          textShadow: "0px 2px 6px rgba(0,0,0,0.8)"
        }}>
          "The best of people are those who bring most benefit to the people."
        </div>
        
        <div style={{ width: 40, height: 1, background: "#C2A881", opacity: 0.4, marginBottom: 24 }} />
        
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#C2A881",
          opacity: 0.8
        }}>
          Daraqutni
        </div>
      </div>
      
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0 }}>
        <NuurBrandFooter color="#E8DCC4" dim="rgba(194, 168, 129, 0.4)" />
      </div>
    </div>
  );
}
