import React from "react";

export function Names() {
  // Generate a ring of dots for the halo
  const dots = React.useMemo(() => {
    const out = [];
    const numDots = 60;
    const radius = 140; // distance from center
    for (let i = 0; i < numDots; i++) {
      const angle = (i / numDots) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      // Make dots vary slightly in size/opacity for a sparkling effect
      const isMajor = i % 15 === 0;
      const size = isMajor ? 3 : 1.5;
      const opacity = isMajor ? 0.9 : 0.4;
      
      out.push({ id: i, x, y, size, opacity });
    }
    return out;
  }, []);

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
        {/* Radial Halos / Auroras */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          {/* Base violet-gold mystical glow */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 600,
              height: 600,
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle, rgba(199, 168, 242, 0.15) 0%, rgba(201, 147, 58, 0.08) 30%, rgba(9, 21, 13, 0) 70%)",
            }}
          />
          {/* Intense center gold glow */}
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              width: 300,
              height: 300,
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle, rgba(201, 147, 58, 0.25) 0%, rgba(201, 147, 58, 0) 60%)",
              filter: "blur(20px)",
            }}
          />
        </div>

        {/* Content Wrapper */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "48px 32px 32px 32px", position: "relative", zIndex: 1 }}>
          
          {/* Top Label */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 16 }}>
            <div style={{ 
              fontSize: 10, 
              fontWeight: 700, 
              letterSpacing: "0.2em", 
              color: "#C9933A", 
              textTransform: "uppercase",
              opacity: 0.8
            }}>
              الأسماء الحسنى · 99 NAMES
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.9 }}>
              <div style={{ width: 24, height: 1, backgroundColor: "#C9933A", opacity: 0.3 }} />
              <div style={{ 
                fontSize: 11, 
                fontWeight: 600, 
                letterSpacing: "0.25em", 
                color: "#C9933A", 
                textTransform: "uppercase" 
              }}>
                01 · OF · 99
              </div>
              <div style={{ width: 24, height: 1, backgroundColor: "#C9933A", opacity: 0.3 }} />
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative" }}>
            
            {/* Dot Halo Ring */}
            <div style={{ position: "absolute", top: "50%", left: "50%", width: 0, height: 0 }}>
              {dots.map((dot) => (
                <div
                  key={dot.id}
                  style={{
                    position: "absolute",
                    left: dot.x,
                    top: dot.y - 40, // offset slightly up to frame the Arabic name perfectly
                    width: dot.size,
                    height: dot.size,
                    borderRadius: "50%",
                    backgroundColor: "#C9933A",
                    opacity: dot.opacity,
                    transform: "translate(-50%, -50%)",
                    boxShadow: dot.isMajor ? "0 0 6px rgba(201, 147, 58, 0.5)" : "none",
                  }}
                />
              ))}
            </div>

            {/* The Monumental Arabic Name */}
            <div style={{
              fontFamily: "'Amiri Quran', 'Amiri', serif",
              fontSize: 110,
              lineHeight: 1.2,
              textAlign: "center",
              direction: "rtl",
              color: "#F5ECD7",
              textShadow: "0 0 40px rgba(245, 236, 215, 0.25), 0 0 10px rgba(201, 147, 58, 0.4)",
              marginBottom: 16,
              transform: "translateY(-20px)", // Push up slightly into the halo center
            }}>
              الرَّحْمَٰن
            </div>

            {/* Transliteration */}
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 16,
              fontWeight: 500,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#F5ECD7",
              marginBottom: 12,
              opacity: 0.95
            }}>
              Ar-Raḥmān
            </div>

            {/* Meaning */}
            <div style={{
              fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
              fontSize: 24,
              color: "#C9933A",
              marginBottom: 24,
            }}>
              The Most Merciful
            </div>

            {/* Description */}
            <div style={{
              fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
              fontSize: 15,
              lineHeight: 1.7,
              textAlign: "center",
              color: "rgba(245, 236, 215, 0.7)",
              fontStyle: "italic",
              maxWidth: "85%",
            }}>
              "The One whose mercy encompasses all of creation — whose compassion extends to every breath, every grain, every soul."
            </div>
            
          </div>

          {/* Bottom: Brand Lockup */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.8, paddingBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.3em", color: "#C9933A" }}>NUUR</div>
              <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#C9933A", opacity: 0.5 }} />
              <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.15em", color: "#F5ECD7", opacity: 0.8 }}>nuur.app</div>
            </div>
            <div style={{ fontSize: 11, color: "#F5ECD7", opacity: 0.5, fontStyle: "italic", letterSpacing: "0.02em" }}>
              Light for your daily deen
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
