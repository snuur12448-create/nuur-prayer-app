import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

export function DuaShare() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#f6f7f2" }}>
      <img 
        src="/__mockup/images/nuur-premium/dua-share.png" 
        alt="" 
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} 
      />
      <div 
        style={{ 
          position: "absolute", 
          inset: 0, 
          background: "radial-gradient(circle at center, rgba(246, 247, 242, 0.85) 0%, rgba(246, 247, 242, 0.4) 100%)", 
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
          fontSize: 26,
          lineHeight: 1.8,
          color: "#4A5D4E",
          direction: "rtl",
          textShadow: "0px 1px 2px rgba(255,255,255,0.8)",
          marginBottom: 20
        }}>
          اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ
        </div>
        
        <div style={{ width: 40, height: 1, background: "#4A5D4E", opacity: 0.3, marginBottom: 20 }} />
        
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 18,
          fontStyle: "italic",
          lineHeight: 1.4,
          color: "#4A5D4E",
          opacity: 0.9,
          marginBottom: 16
        }}>
          "O Allah, You are Peace, and from You comes Peace. Blessed are You, Possessor of Majesty and Honor."
        </div>
        
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 9,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#4A5D4E",
          opacity: 0.6
        }}>
          Muslim · Daily Adhkar
        </div>
      </div>
      
      <div style={{ position: "absolute", bottom: 24, left: 0, right: 0 }}>
        <NuurBrandFooter color="#4A5D4E" dim="rgba(74, 93, 78, 0.5)" />
      </div>
    </div>
  );
}
