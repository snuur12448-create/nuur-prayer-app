import React from "react";

const BRAND_BG = "#09150D";
const BRAND_GOLD = "#C9933A";
const CREAM = "#F5ECD7";

export function Architectural() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "#0a0a0a",
      }}
    >
      <div
        style={{
          width: 460,
          aspectRatio: "9/13.5",
          background: BRAND_BG,
          borderRadius: 24,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          border: `1px solid ${BRAND_GOLD}33`,
        }}
      >
        {/* Background Pattern */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.05, pointerEvents: "none" }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="khatam-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                {/* 8-point star (rub-el-hizb) pattern base */}
                <g stroke={BRAND_GOLD} strokeWidth="1" fill="none">
                  <path d="M30 0 L60 30 L30 60 L0 30 Z" />
                  <path d="M15 15 L45 15 L45 45 L15 45 Z" />
                  <circle cx="30" cy="30" r="10" />
                </g>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#khatam-pattern)" />
          </svg>
        </div>

        {/* Arch framing */}
        <div style={{ position: "absolute", top: 24, left: 24, right: 24, bottom: 200, pointerEvents: "none" }}>
          <svg width="100%" height="100%" viewBox="0 0 412 466" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            {/* Multi-foil / Pointed Arch */}
            <path
              d="M 206 0 C 180 30, 100 20, 0 100 L 0 466 L 412 466 L 412 100 C 312 20, 232 30, 206 0 Z"
              fill="none"
              stroke={BRAND_GOLD}
              strokeWidth="2"
              opacity="0.6"
            />
            {/* Inner Arch */}
            <path
              d="M 206 16 C 186 42, 114 34, 16 104 L 16 450 L 396 450 L 396 104 C 298 34, 226 42, 206 16 Z"
              fill="none"
              stroke={BRAND_GOLD}
              strokeWidth="1"
              opacity="0.3"
            />
          </svg>
        </div>

        {/* Top Label */}
        <div style={{ marginTop: 60, zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.9 }}>
            <div style={{ width: 4, height: 4, borderRadius: 2, background: BRAND_GOLD, transform: "rotate(45deg)" }} />
            <div style={{ width: 30, height: 1, background: BRAND_GOLD, opacity: 0.5 }} />
            <span style={{ color: BRAND_GOLD, fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Al-Isrāʾ · 17:79
            </span>
            <div style={{ width: 30, height: 1, background: BRAND_GOLD, opacity: 0.5 }} />
            <div style={{ width: 4, height: 4, borderRadius: 2, background: BRAND_GOLD, transform: "rotate(45deg)" }} />
          </div>
          <span style={{ color: BRAND_GOLD, fontSize: 24, fontFamily: "'Amiri Quran', Amiri, 'Scheherazade New', serif", direction: "rtl" }}>
            الإسراء
          </span>
        </div>

        {/* Arabic Verse - Inside the Niche */}
        <div style={{ flex: 1, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 48px" }}>
          <p
            style={{
              color: CREAM,
              fontSize: 32,
              lineHeight: 1.8,
              textAlign: "center",
              fontFamily: "'Amiri Quran', Amiri, 'Scheherazade New', serif",
              direction: "rtl",
              textShadow: "0 4px 12px rgba(0,0,0,0.5)",
            }}
          >
            وَمِنَ ٱلَّيْلِ فَتَهَجَّدْ بِهِۦ نَافِلَةً لَّكَ عَسَىٰٓ أَن يَبْعَثَكَ رَبُّكَ مَقَامًا مَّحْمُودًا
          </p>
        </div>

        {/* Translation Plinth */}
        <div
          style={{
            zIndex: 1,
            margin: "0 24px",
            borderTop: `1px solid ${BRAND_GOLD}66`,
            borderBottom: `1px solid ${BRAND_GOLD}66`,
            padding: "24px 0",
            position: "relative",
            background: "linear-gradient(90deg, rgba(201,147,58,0) 0%, rgba(201,147,58,0.05) 50%, rgba(201,147,58,0) 100%)",
          }}
        >
          {/* Plinth architectural details */}
          <div style={{ position: "absolute", top: -3, left: "50%", transform: "translateX(-50%)", width: 6, height: 6, background: BRAND_GOLD, borderRadius: 1 }} />
          <div style={{ position: "absolute", bottom: -3, left: "50%", transform: "translateX(-50%)", width: 6, height: 6, background: BRAND_GOLD, borderRadius: 1 }} />
          
          <p
            style={{
              color: `${CREAM}cc`,
              fontSize: 15,
              lineHeight: 1.6,
              textAlign: "center",
              fontFamily: "Inter, sans-serif",
              padding: "0 24px",
            }}
          >
            "And in the night arise from sleep for prayer — a supererogatory act for you; perhaps your Lord will raise you to a praised station."
          </p>
        </div>

        {/* Brand Lockup */}
        <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Minimal architectural lockup */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2 L22 12 L12 22 L2 12 Z" stroke={BRAND_GOLD} strokeWidth="1.5" />
              <circle cx="12" cy="12" r="4" fill={BRAND_GOLD} />
            </svg>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ color: BRAND_GOLD, fontSize: 16, fontWeight: 700, letterSpacing: "0.2em" }}>NUUR</span>
                <span style={{ color: BRAND_GOLD, fontSize: 10, opacity: 0.5 }}>nuur.app</span>
              </div>
              <span style={{ color: `${CREAM}88`, fontSize: 11, fontStyle: "italic" }}>Light for your daily deen</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
