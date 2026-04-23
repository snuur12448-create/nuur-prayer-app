import React from "react";

export function Celestial() {
  // Seeded random for stable stars
  const stars = React.useMemo(() => {
    const out = [];
    let seed = 12345;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return (seed & 0xffffff) / 0xffffff;
    };
    for (let i = 0; i < 80; i++) {
      out.push({
        id: i,
        x: rnd() * 100,
        y: rnd() * 70, // mostly in top 70%
        size: 0.5 + rnd() * 2,
        opacity: 0.1 + rnd() * 0.7,
      });
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
          background: "linear-gradient(180deg, #0d1b2a 0%, #09150D 60%)",
          borderRadius: 24,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          color: "#F5ECD7",
        }}
      >
        {/* Constellation background */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {stars.map((star) => (
            <div
              key={star.id}
              style={{
                position: "absolute",
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
                borderRadius: "50%",
                backgroundColor: star.size > 1.8 ? "#C9933A" : "#F5ECD7",
                opacity: star.opacity,
                boxShadow: star.size > 1.5 ? "0 0 6px rgba(245, 236, 215, 0.5)" : "none",
              }}
            />
          ))}
          {/* Subtle gold dust horizon */}
          <div
            style={{
              position: "absolute",
              top: "60%",
              left: 0,
              right: 0,
              height: 1,
              background: "linear-gradient(90deg, rgba(201,147,58,0) 0%, rgba(201,147,58,0.2) 50%, rgba(201,147,58,0) 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "48px 32px 32px 32px", position: "relative", zIndex: 1 }}>
          
          {/* Top: Moon / Label */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            {/* Delicate crescent moon */}
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0px 0px 8px rgba(201,147,58,0.4))" }}>
              <path d="M16 2C16 2 23 8 23 16C23 24 16 30 16 30C24.8366 30 32 23.732 32 16C32 8.26801 24.8366 2 16 2Z" fill="#C9933A" opacity="0.9"/>
            </svg>
            
            <div style={{ 
              fontSize: 12, 
              fontWeight: 600, 
              letterSpacing: "0.25em", 
              color: "#C9933A", 
              textTransform: "uppercase" 
            }}>
              Al-Isrāʾ · 17:79
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Center: Verses */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
            <div style={{
              fontFamily: "'Amiri Quran', 'Amiri', serif",
              fontSize: 22,
              color: "#C9933A",
              opacity: 0.8,
              direction: "rtl",
            }}>
              الإسراء
            </div>
            
            <div style={{
              fontFamily: "'Amiri Quran', 'Amiri', serif",
              fontSize: 34,
              lineHeight: 1.9,
              textAlign: "center",
              direction: "rtl",
              color: "#F5ECD7",
              textShadow: "0 0 24px rgba(245, 236, 215, 0.2)",
            }}>
              وَمِنَ ٱلَّيْلِ فَتَهَجَّدْ بِهِۦ نَافِلَةً لَّكَ عَسَىٰٓ أَن يَبْعَثَكَ رَبُّكَ مَقَامًا مَّحْمُودًا
            </div>

            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 15,
              lineHeight: 1.7,
              textAlign: "center",
              color: "rgba(245, 236, 215, 0.65)",
              fontStyle: "italic",
              maxWidth: "92%",
            }}>
              "And in the night arise from sleep for prayer — a supererogatory act for you; perhaps your Lord will raise you to a praised station."
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Bottom: Brand Lockup */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.8 }}>
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
