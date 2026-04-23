import React from "react";

export function Editorial() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "#0a0a0a" }}>
      <div 
        style={{ 
          width: 460, 
          aspectRatio: "9/13.5", 
          background: "#09150D", 
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          padding: "56px 48px",
          boxShadow: "0 24px 48px rgba(0,0,0,0.4)"
        }}
      >
        {/* Subtle, thin top gold rule */}
        <div style={{ position: "absolute", top: 0, left: 48, right: 48, height: 1, background: "#C9933A", opacity: 0.3 }} />
        <div style={{ position: "absolute", bottom: 0, left: 48, right: 48, height: 1, background: "#C9933A", opacity: 0.3 }} />

        {/* Content area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 10 }}>
          
          {/* Reference & Arabic Group */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32, marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 1, background: "#C9933A", opacity: 0.6 }} />
              <span style={{ color: "#C9933A", fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Al-Isrāʾ · 17:79
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: "80%" }}>
              <span style={{ color: "#C9933A", fontFamily: "'Amiri Quran', Amiri, 'Scheherazade New', serif", fontSize: 16, direction: "rtl", opacity: 0.7 }}>
                الإسراء
              </span>
              <p style={{ 
                color: "#C9933A", 
                fontFamily: "'Amiri Quran', Amiri, 'Scheherazade New', serif", 
                fontSize: 22, 
                lineHeight: 1.8, 
                margin: 0,
                direction: "rtl",
                opacity: 0.8,
                textAlign: "right"
              }}>
                وَمِنَ ٱلَّيْلِ فَتَهَجَّدْ بِهِۦ نَافِلَةً لَّكَ عَسَىٰٓ أَن يَبْعَثَكَ رَبُّكَ مَقَامًا مَّحْمُودًا
              </p>
            </div>
          </div>

          {/* English Translation as Hero */}
          <div>
            <p style={{ 
              color: "#F5ECD7", 
              fontFamily: "'Cormorant Garamond', 'Playfair Display', serif", 
              fontSize: 34, 
              lineHeight: 1.25, 
              margin: 0,
              fontWeight: 400,
              opacity: 1,
              letterSpacing: "-0.02em"
            }}>
              "And in the night arise from sleep for prayer — a supererogatory act for you; perhaps your Lord will raise you to a praised station."
            </p>
          </div>
        </div>
        
        {/* Bottom unobtrusive publisher mark */}
        <div style={{ position: "absolute", bottom: 48, left: 48, display: "flex", flexDirection: "column", gap: 6, opacity: 0.7 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#C9933A", fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: "0.25em" }}>NUUR</span>
            <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#C9933A" }} />
            <span style={{ color: "#F5ECD7", fontFamily: "Inter, sans-serif", fontSize: 9, letterSpacing: "0.1em" }}>nuur.app</span>
          </div>
          <span style={{ color: "#F5ECD7", fontFamily: "'Cormorant Garamond', 'Playfair Display', serif", fontSize: 13, fontStyle: "italic", letterSpacing: "0.02em", opacity: 0.7 }}>
            Light for your daily deen
          </span>
        </div>

      </div>
    </div>
  );
}
