import React from "react";

export function Dua() {
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
          backgroundColor: "#09150D",
          borderRadius: 24,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          color: "#F5ECD7",
        }}
      >
        {/* Soft dawn-rose / amber glow rising from the bottom */}
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            left: "-20%",
            right: "-20%",
            height: "70%",
            background: "radial-gradient(ellipse at center bottom, rgba(232, 168, 196, 0.25) 0%, rgba(201, 147, 58, 0.1) 40%, rgba(9, 21, 13, 0) 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "48px 32px 32px 32px", position: "relative", zIndex: 1 }}>
          
          {/* Top: Section Label */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: 0.8 }}>
              <div style={{ width: 24, height: 1, backgroundColor: "#C9933A", opacity: 0.5 }} />
              <div style={{ 
                fontSize: 11, 
                fontWeight: 600, 
                letterSpacing: "0.2em", 
                color: "#C9933A", 
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}>
                <span style={{ fontFamily: "'Amiri Quran', 'Amiri', serif", fontSize: 14, paddingTop: 4 }}>دعاء</span>
                <span style={{ opacity: 0.5 }}>·</span>
                <span>DUʿĀʾ</span>
              </div>
              <div style={{ width: 24, height: 1, backgroundColor: "#C9933A", opacity: 0.5 }} />
            </div>
            
            {/* Delicate Cupped Hands Illustration */}
            <div style={{ marginTop: 8, opacity: 0.9 }}>
              <svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Left hand */}
                <path d="M22 28 C16 28 8 20 6 12 C5.5 10 7 8 9 9 C11 10 14 14 16 16 M22 28 C20 20 14 10 12 6 C11.5 4 13.5 3 15 5 C17 8 20 14 21 18" stroke="#C9933A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 12 C16 8 16 4 17 3 C18 2 20 3 19 6 C18.5 8 19.5 12 21 15" stroke="#C9933A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 16 C20 12 21 6 22 5 C23 4 24.5 5 23.5 8 C23 10 22.5 14 22 17" stroke="#C9933A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Right hand (mirrored) */}
                <path d="M26 28 C32 28 40 20 42 12 C42.5 10 41 8 39 9 C37 10 34 14 32 16 M26 28 C28 20 34 10 36 6 C36.5 4 34.5 3 33 5 C31 8 28 14 27 18" stroke="#C9933A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M31 12 C32 8 32 4 31 3 C30 2 28 3 29 6 C29.5 8 28.5 12 27 15" stroke="#C9933A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M28 16 C28 12 27 6 26 5 C25 4 23.5 5 24.5 8 C25 10 25.5 14 26 17" stroke="#C9933A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Center: Du'a */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, padding: "0 16px" }}>
            <div style={{
              fontFamily: "'Amiri Quran', 'Amiri', serif",
              fontSize: 36,
              lineHeight: 2.2,
              textAlign: "center",
              direction: "rtl",
              color: "#F5ECD7",
              textShadow: "0 0 20px rgba(232, 168, 196, 0.15)",
              letterSpacing: "0.02em",
            }}>
              رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ
            </div>

            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 16,
              lineHeight: 1.8,
              textAlign: "center",
              color: "rgba(245, 236, 215, 0.75)",
              fontStyle: "italic",
              maxWidth: "95%",
            }}>
              "Our Lord, grant us good in this world and good in the Hereafter, and protect us from the punishment of the Fire."
            </div>
            
            <div style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.15em",
              color: "#C9933A",
              textTransform: "uppercase",
              opacity: 0.8,
            }}>
              Qurʾān 2:201
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Bottom: Brand Lockup */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.85 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.3em", color: "#C9933A" }}>NUUR</div>
              <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#C9933A", opacity: 0.5 }} />
              <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.15em", color: "#F5ECD7", opacity: 0.8 }}>nuur.app</div>
            </div>
            <div style={{ fontSize: 11, color: "#F5ECD7", opacity: 0.6, fontStyle: "italic", letterSpacing: "0.02em" }}>
              Light for your daily deen
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
