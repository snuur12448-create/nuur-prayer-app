import React from "react";

export function Hadith() {
  // Generate some faint horizontal lines for the "ruled page" effect
  const lines = Array.from({ length: 15 });

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
          background: "#09150D",
          borderRadius: 24,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          color: "#F5ECD7",
          border: "1px solid rgba(201, 147, 58, 0.15)",
        }}
      >
        {/* Subtle radial glow from top for scholarly illumination */}
        <div 
          style={{ 
            position: "absolute", 
            inset: 0, 
            background: "radial-gradient(circle at 50% 10%, rgba(59, 92, 112, 0.15) 0%, transparent 60%)",
            pointerEvents: "none" 
          }} 
        />

        {/* Ruled lines background */}
        <div style={{ position: "absolute", inset: "120px 40px 100px 40px", pointerEvents: "none", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {lines.map((_, i) => (
            <div key={i} style={{ height: 1, width: "100%", backgroundColor: "rgba(59, 92, 112, 0.1)" }} />
          ))}
        </div>

        {/* Top left and right corner geometric accents */}
        <svg style={{ position: "absolute", top: 16, left: 16, opacity: 0.4 }} width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M0 12 L12 0 L13 1 L2 13 Z" fill="#C9933A" />
          <path d="M12 0 L24 12 L23 13 L11 1 Z" fill="#3B5C70" />
        </svg>
        <svg style={{ position: "absolute", top: 16, right: 16, opacity: 0.4 }} width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M24 12 L12 0 L11 1 L22 13 Z" fill="#C9933A" />
          <path d="M12 0 L0 12 L1 13 L13 1 Z" fill="#3B5C70" />
        </svg>

        {/* Content Container */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px 40px 32px 40px", position: "relative", zIndex: 1 }}>
          
          {/* Top: Type Label & Stamp */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            {/* Seal / Stamp Medallion */}
            <div style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "1px dashed rgba(201, 147, 58, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}>
              <div style={{
                position: "absolute",
                inset: 3,
                borderRadius: "50%",
                border: "1px solid rgba(201, 147, 58, 0.2)",
              }} />
              <div style={{
                fontFamily: "'Amiri Quran', 'Amiri', serif",
                fontSize: 16,
                color: "#C9933A",
                opacity: 0.9,
              }}>
                حديث
              </div>
            </div>
            
            <div style={{ 
              fontSize: 11, 
              fontWeight: 600, 
              letterSpacing: "0.3em", 
              color: "#3B5C70", 
              textTransform: "uppercase" 
            }}>
              HADITH
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Center: The Arabic and Translation */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
            <div style={{
              fontFamily: "'Amiri Quran', 'Amiri', serif",
              fontSize: 32,
              lineHeight: 1.8,
              textAlign: "center",
              direction: "rtl",
              color: "#F5ECD7",
              textShadow: "0 0 12px rgba(245, 236, 215, 0.1)",
            }}>
              إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى
            </div>

            <div style={{
              fontFamily: "'Playfair Display', 'Times New Roman', serif",
              fontSize: 15,
              lineHeight: 1.8,
              textAlign: "center",
              color: "rgba(245, 236, 215, 0.7)",
              fontStyle: "italic",
            }}>
              "Actions are but by intentions, and every man shall have only that which he intended."
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Isnad / Narrator */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 40 }}>
            <div style={{ width: 40, height: 1, backgroundColor: "rgba(201, 147, 58, 0.3)" }} />
            <div style={{ 
              fontSize: 11, 
              color: "#C9933A", 
              textTransform: "uppercase", 
              letterSpacing: "0.1em",
              opacity: 0.9,
              fontWeight: 500
            }}>
              <span style={{ color: "#3B5C70", marginRight: 6 }}>NARRATED BY</span>
              ʿUmar ibn al-Khaṭṭāb (RA)
            </div>
            <div style={{ width: 40, height: 1, backgroundColor: "rgba(201, 147, 58, 0.3)" }} />
          </div>

          {/* Bottom Edge Source & Brand */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, opacity: 0.9 }}>
            
            <div style={{ 
              fontFamily: "monospace", 
              fontSize: 9, 
              color: "#E6C173", 
              opacity: 0.6,
              letterSpacing: "0.05em",
              textTransform: "uppercase"
            }}>
              Ṣaḥīḥ al-Bukhārī 1 · Ṣaḥīḥ Muslim 1907
            </div>

            {/* Brand Lockup */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: "0.3em", color: "#C9933A" }}>NUUR</div>
                <div style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "#3B5C70", opacity: 0.8 }} />
                <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.15em", color: "#F5ECD7", opacity: 0.7 }}>nuur.app</div>
              </div>
              <div style={{ fontSize: 10, color: "#3B5C70", opacity: 0.8, fontStyle: "italic", letterSpacing: "0.02em" }}>
                Light for your daily deen
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
