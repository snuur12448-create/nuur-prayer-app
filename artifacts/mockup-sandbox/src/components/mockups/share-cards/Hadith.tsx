import React from "react";

export function Hadith() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "#0a0a0a",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: 460,
          aspectRatio: "9/13.5",
          background: "#09150D", // Deep forest near-black
          borderRadius: 24,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          color: "#F5ECD7",
        }}
      >
        {/* Background Image */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img
            src="/__mockup/images/hadith-lamp.png"
            alt="Lamp in a niche"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {/* Gradient Overlay for Text Legibility */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(9, 21, 13, 0) 0%, rgba(9, 21, 13, 0.4) 40%, rgba(9, 21, 13, 0.95) 75%, rgba(9, 21, 13, 1) 100%)",
            }}
          />
        </div>

        {/* Content Wrapper */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px 32px 32px 32px", position: "relative", zIndex: 1 }}>
          
          {/* Top: Hadith Label (Subtle, like a craftsman mark) */}
          <div style={{ display: "flex", justifyContent: "center", width: "100%", opacity: 0.6 }}>
            <div style={{ 
              fontSize: 10, 
              fontWeight: 600, 
              letterSpacing: "0.3em", 
              color: "#C9933A", 
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid rgba(201, 147, 58, 0.3)",
              padding: "4px 12px",
              borderRadius: "4px",
              backdropFilter: "blur(4px)",
              background: "rgba(9, 21, 13, 0.4)"
            }}>
              <span style={{ fontFamily: "'Amiri Quran', 'Amiri', serif", fontSize: 13, paddingTop: 2 }}>حديث</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span>HADITH</span>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Middle: Arabic and Translation within the lit pool */}
          <div style={{ display: "flex", flexDirection: "column", gap: 40, alignItems: "center" }}>
            <div style={{
              fontFamily: "'Amiri Quran', 'Amiri', serif",
              fontSize: 34,
              lineHeight: 1.9,
              textAlign: "center",
              direction: "rtl",
              color: "#F5ECD7",
              textShadow: "0 2px 20px rgba(201, 147, 58, 0.3)",
              padding: "0 16px"
            }}>
              إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى
            </div>

            <div style={{
              fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
              fontSize: 17,
              lineHeight: 1.8,
              textAlign: "center",
              color: "rgba(245, 236, 215, 0.85)",
              fontStyle: "italic",
              maxWidth: "90%",
            }}>
              "Actions are but by intentions, and every man shall have only that which he intended."
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Bottom Area: Narrator, Source, Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center", paddingBottom: 8 }}>
            
            {/* Narrator */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ 
                fontSize: 9, 
                color: "#C9933A", 
                textTransform: "uppercase", 
                letterSpacing: "0.2em",
                opacity: 0.7,
                fontWeight: 600
              }}>
                Narrated By
              </div>
              <div style={{ 
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 20,
                fontWeight: 500,
                color: "#F5ECD7",
                letterSpacing: "0.02em"
              }}>
                ʿUmar ibn al-Khaṭṭāb (RA)
              </div>
            </div>

            {/* Source Plate */}
            <div style={{
              borderTop: "1px solid rgba(201, 147, 58, 0.3)",
              borderBottom: "1px solid rgba(201, 147, 58, 0.3)",
              padding: "8px 0",
              width: "100%",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "monospace",
                fontSize: 9,
                color: "#C9933A",
                lineHeight: 1.4,
                opacity: 0.8,
                letterSpacing: "0.1em",
                textTransform: "uppercase"
              }}>
                Ṣaḥīḥ al-Bukhārī 1 <span style={{ opacity: 0.5, margin: "0 4px" }}>·</span> Ṣaḥīḥ Muslim 1907
              </div>
            </div>

            {/* Brand Lockup */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.3em", color: "#C9933A" }}>NUUR</div>
                <div style={{ width: 4, height: 4, transform: "rotate(45deg)", backgroundColor: "#C9933A", opacity: 0.5 }} />
                <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.15em", color: "#F5ECD7", opacity: 0.8 }}>nuur.app</div>
              </div>
              <div style={{ fontSize: 10, color: "#F5ECD7", opacity: 0.5, fontStyle: "italic", letterSpacing: "0.02em" }}>
                Light for your daily deen
              </div>
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
}
