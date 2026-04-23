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
        {/* Background Texture & Glow */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {/* Noise texture overlay */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12, mixBlendMode: "overlay" }}>
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
          
          {/* Warm spotlight from top left */}
          <div style={{
            position: "absolute",
            top: "-20%",
            left: "-20%",
            width: "80%",
            height: "80%",
            background: "radial-gradient(circle, rgba(92, 42, 31, 0.4) 0%, rgba(9, 21, 13, 0) 70%)",
            filter: "blur(40px)"
          }} />
          
          {/* Secondary subtle gold glow on right edge */}
          <div style={{
            position: "absolute",
            top: "40%",
            right: "-30%",
            width: "60%",
            height: "60%",
            background: "radial-gradient(circle, rgba(201, 147, 58, 0.15) 0%, rgba(9, 21, 13, 0) 70%)",
            filter: "blur(40px)"
          }} />
        </div>

        {/* Left Isnad Chain Motif */}
        <div style={{ position: "absolute", left: 32, top: 120, bottom: 120, width: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.4 }}>
          <div style={{ width: 1, flex: 1, backgroundColor: "#C9933A", opacity: 0.5 }} />
          {[1,2,3,4,5].map(i => (
             <React.Fragment key={i}>
               <div style={{ width: 8, height: 8, borderRadius: "50%", border: "1px solid #C9933A", backgroundColor: "#09150D" }} />
               <div style={{ width: 1, height: 24, backgroundColor: "#C9933A", opacity: 0.5 }} />
             </React.Fragment>
          ))}
          <div style={{ width: 8, height: 8, borderRadius: "50%", border: "1px solid #C9933A", backgroundColor: "#09150D" }} />
          <div style={{ width: 1, flex: 1, backgroundColor: "#C9933A", opacity: 0.5 }} />
        </div>

        {/* Content Wrapper */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px 32px 32px 72px", position: "relative", zIndex: 1 }}>
          
          {/* Asymmetric Header */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, marginBottom: 40 }}>
            {/* Monumental Calligraphy */}
            <div style={{
              fontFamily: "'Amiri Quran', 'Amiri', serif",
              fontSize: 72,
              lineHeight: 1,
              color: "#C9933A",
              opacity: 0.95,
              textShadow: "0 4px 20px rgba(201, 147, 58, 0.2)",
              transform: "translateX(-10px)", // pull slightly left to overhang
            }}>
              حديث
            </div>
            
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 12 
            }}>
              <div style={{ 
                fontSize: 12, 
                fontWeight: 700, 
                letterSpacing: "0.3em", 
                color: "#E6C173", 
                textTransform: "uppercase" 
              }}>
                HADITH
              </div>
              <div style={{ height: 1, width: 60, backgroundColor: "#E6C173", opacity: 0.5 }} />
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* The Arabic and Translation */}
          <div style={{ display: "flex", flexDirection: "column", gap: 36, paddingRight: 16 }}>
            <div style={{
              fontFamily: "'Amiri Quran', 'Amiri', serif",
              fontSize: 34,
              lineHeight: 1.9,
              textAlign: "right",
              direction: "rtl",
              color: "#F5ECD7",
              textShadow: "0 2px 10px rgba(245, 236, 215, 0.1)",
            }}>
              إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى
            </div>

            <div style={{
              fontFamily: "'Playfair Display', 'Times New Roman', serif",
              fontSize: 16,
              lineHeight: 1.8,
              textAlign: "left",
              color: "rgba(245, 236, 215, 0.8)",
              fontStyle: "italic",
              borderLeft: "2px solid rgba(92, 42, 31, 0.6)",
              paddingLeft: 16,
            }}>
              "Actions are but by intentions, and every man shall have only that which he intended."
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Narrator Nameplate */}
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "flex-start", 
            gap: 6, 
            marginBottom: 32,
            background: "linear-gradient(90deg, rgba(92, 42, 31, 0.25) 0%, rgba(92, 42, 31, 0.05) 100%)",
            borderLeft: "2px solid #5C2A1F",
            padding: "16px 24px",
            borderRadius: "0 16px 16px 0",
            width: "fit-content",
            position: "relative"
          }}>
            <div style={{ 
              fontSize: 9, 
              color: "#E6C173", 
              textTransform: "uppercase", 
              letterSpacing: "0.2em",
              opacity: 0.8,
              fontWeight: 600
            }}>
              Narrated By
            </div>
            <div style={{ 
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 20,
              fontWeight: 600,
              color: "#F5ECD7",
              letterSpacing: "0.02em"
            }}>
              ʿUmar ibn al-Khaṭṭāb (RA)
            </div>
          </div>

        </div>
        
        {/* Bottom Area: Wax Seal Source & Brand */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-end", 
          padding: "0 32px 32px 32px",
          position: "relative",
          zIndex: 2
        }}>
          
          {/* Brand Lockup */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, opacity: 0.8, paddingBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.3em", color: "#C9933A" }}>NUUR</div>
              <div style={{ width: 4, height: 4, transform: "rotate(45deg)", backgroundColor: "#5C2A1F", opacity: 0.8 }} />
              <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.15em", color: "#F5ECD7", opacity: 0.8 }}>nuur.app</div>
            </div>
            <div style={{ fontSize: 10, color: "#F5ECD7", opacity: 0.5, fontStyle: "italic", letterSpacing: "0.02em" }}>
              Light for your daily deen
            </div>
          </div>

          {/* Wax Seal Motif for Source */}
          <div style={{
            position: "relative",
            width: 80,
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {/* Scalloped outer seal */}
            <svg style={{ position: "absolute", top: 0, left: 0 }} width="80" height="80" viewBox="0 0 100 100">
              <g style={{ transformOrigin: "50px 50px", transform: "rotate(15deg)" }}>
                <path d="M50,2 L55,10 L64,7 L67,16 L76,14 L78,23 L87,23 L86,32 L94,34 L91,43 L98,47 L94,55 L100,60 L94,67 L98,75 L90,78 L91,87 L82,86 L80,94 L71,91 L67,98 L59,93 L54,100 L46,94 L40,100 L33,93 L26,98 L24,89 L15,91 L14,82 L5,82 L7,73 L0,70 L3,61 L0,53 L6,46 L0,39 L6,32 L2,24 L10,21 L10,12 L19,13 L23,5 L31,9 L36,2 Z" 
                      fill="rgba(92, 42, 31, 0.4)" 
                      stroke="#5C2A1F" 
                      strokeWidth="1" />
                <circle cx="50" cy="50" r="38" fill="#09150D" stroke="#C9933A" strokeWidth="1.5" strokeDasharray="4 4" />
              </g>
            </svg>
            
            {/* Inner citation text */}
            <div style={{
              position: "relative",
              zIndex: 1,
              fontFamily: "monospace",
              fontSize: 8,
              color: "#E6C173",
              textAlign: "center",
              lineHeight: 1.4,
              opacity: 0.9,
              letterSpacing: "0.05em",
              maxWidth: 50
            }}>
              ṢAḤĪḤ
              <br/>
              BUKHĀRĪ 1
              <br/>
              <span style={{ fontSize: 6, opacity: 0.5 }}>—</span>
              <br/>
              MUSLIM
              <br/>
              1907
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
