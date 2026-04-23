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
          background: "#09150D",
          borderRadius: 24,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          color: "#F5ECD7",
        }}
      >
        {/* Atmospheric glows */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              width: 540,
              height: 540,
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(201, 147, 58, 0.18) 0%, rgba(201, 147, 58, 0.06) 35%, rgba(9, 21, 13, 0) 70%)",
              filter: "blur(8px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              width: 260,
              height: 260,
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(201, 147, 58, 0.22) 0%, rgba(201, 147, 58, 0) 65%)",
              filter: "blur(18px)",
            }}
          />
        </div>

        {/* Content Wrapper */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "48px 32px 32px 32px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Top Label */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 16 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.25em",
                color: "#C9933A",
                textTransform: "uppercase",
                opacity: 0.85,
              }}
            >
              <span style={{ fontFamily: "'Amiri Quran', 'Amiri', serif", fontSize: 13 }}>حديث</span>
              <span style={{ margin: "0 10px", opacity: 0.5 }}>·</span>
              <span>HADITH</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.9 }}>
              <div style={{ width: 24, height: 1, backgroundColor: "#C9933A", opacity: 0.3 }} />
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.25em",
                  color: "#C9933A",
                  textTransform: "uppercase",
                }}
              >
                ON · INTENTION
              </div>
              <div style={{ width: 24, height: 1, backgroundColor: "#C9933A", opacity: 0.3 }} />
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Middle: Arabic and Translation */}
          <div style={{ display: "flex", flexDirection: "column", gap: 36, alignItems: "center" }}>
            <div
              style={{
                fontFamily: "'Amiri Quran', 'Amiri', serif",
                fontSize: 34,
                lineHeight: 1.9,
                textAlign: "center",
                direction: "rtl",
                color: "#F5ECD7",
                textShadow: "0 0 28px rgba(201, 147, 58, 0.35), 0 0 8px rgba(245, 236, 215, 0.15)",
                padding: "0 16px",
              }}
            >
              إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى
            </div>

            <div
              style={{
                fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
                fontSize: 19,
                lineHeight: 1.55,
                textAlign: "center",
                color: "#FBF3DE",
                fontWeight: 600,
                letterSpacing: "0.005em",
                maxWidth: "92%",
              }}
            >
              “Actions are but by intentions, and every man shall have only that which he intended.”
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Bottom Area: Narrator, Source, Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center", paddingBottom: 8 }}>
            {/* Narrator */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  fontSize: 9,
                  color: "#C9933A",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  opacity: 0.7,
                  fontWeight: 600,
                }}
              >
                Narrated By
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20,
                  fontWeight: 500,
                  color: "#F5ECD7",
                  letterSpacing: "0.02em",
                }}
              >
                ʿUmar ibn al-Khaṭṭāb (RA)
              </div>
            </div>

            {/* Source Plate */}
            <div
              style={{
                borderTop: "1px solid rgba(201, 147, 58, 0.3)",
                borderBottom: "1px solid rgba(201, 147, 58, 0.3)",
                padding: "8px 0",
                width: "100%",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  color: "#C9933A",
                  lineHeight: 1.4,
                  opacity: 0.8,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Ṣaḥīḥ al-Bukhārī 1 <span style={{ opacity: 0.5, margin: "0 4px" }}>·</span> Ṣaḥīḥ Muslim 1907
              </div>
            </div>

            {/* Brand Lockup */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.3em", color: "#C9933A" }}>NUUR</div>
                <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#C9933A", opacity: 0.5 }} />
                <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.15em", color: "#F5ECD7", opacity: 0.8 }}>
                  nuur.app
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#F5ECD7", opacity: 0.5, fontStyle: "italic", letterSpacing: "0.02em" }}>
                Light for your daily deen
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
