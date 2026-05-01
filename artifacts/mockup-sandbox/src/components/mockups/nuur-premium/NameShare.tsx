import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

export function NameShare() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#1A0A21" }}>
      <img 
        src="/__mockup/images/nuur-premium/name-share.png" 
        alt="" 
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} 
      />
      <div 
        style={{ 
          position: "absolute", 
          inset: 0, 
          background: "radial-gradient(circle at center, rgba(26, 10, 33, 0.5) 0%, rgba(15, 5, 20, 0.9) 100%)", 
          pointerEvents: "none" 
        }} 
      />
      
      {/* Arched frame border */}
      <div style={{
        position: "absolute",
        inset: 16,
        border: "1px solid rgba(212, 175, 55, 0.25)",
        borderRadius: "160px 160px 12px 12px",
        pointerEvents: "none",
        zIndex: 5
      }} />

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
          fontSize: 64,
          lineHeight: 1.2,
          color: "#F3E3B6",
          direction: "rtl",
          textShadow: "0px 2px 8px rgba(0,0,0,0.6)",
          marginBottom: 8
        }}>
          ٱلرَّحْمَٰن
        </div>
        
        <div style={{ width: 40, height: 1, background: "#D4AF37", opacity: 0.5, marginBottom: 16 }} />
        
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "0.05em",
          color: "#E2D0E5",
          marginBottom: 6
        }}>
          Ar-Rahman
        </div>
        
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 16,
          fontStyle: "italic",
          color: "#BCA3C4",
          opacity: 0.9
        }}>
          The Most Merciful
        </div>
      </div>
      
      <div style={{ position: "absolute", bottom: 32, left: 0, right: 0 }}>
        <NuurBrandFooter color="#D4AF37" dim="rgba(212, 175, 55, 0.4)" />
      </div>
    </div>
  );
}
