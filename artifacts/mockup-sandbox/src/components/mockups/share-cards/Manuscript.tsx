import React from "react";

const BRAND_BG = "#09150D";
const BRAND_GOLD = "#C9933A";
const BRAND_CREAM = "#F5ECD7";

// A hand-drawn style double frame
function HandDrawnFrame({ w, h }: { w: number; h: number }) {
  const inset = 14;
  const innerInset = 22;
  
  // slightly irregular paths for a hand-drawn feel
  return (
    <svg width={w} height={h} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      <rect
        x={inset} y={inset}
        width={w - inset * 2} height={h - inset * 2}
        fill="none"
        stroke={BRAND_GOLD} strokeWidth="1.5" opacity="0.8"
      />
      <rect
        x={innerInset} y={innerInset}
        width={w - innerInset * 2} height={h - innerInset * 2}
        fill="none"
        stroke={BRAND_GOLD} strokeWidth="0.75" opacity="0.6"
      />
      
      {/* Corner accents */}
      <circle cx={inset} cy={inset} r="3" fill={BRAND_GOLD} />
      <circle cx={w - inset} cy={inset} r="3" fill={BRAND_GOLD} />
      <circle cx={inset} cy={h - inset} r="3" fill={BRAND_GOLD} />
      <circle cx={w - inset} cy={h - inset} r="3" fill={BRAND_GOLD} />
    </svg>
  );
}

// ʿunwān - Illuminated header band
function UnwanHeader({ width }: { width: number }) {
  return (
    <svg width={width} height="40" viewBox={`0 0 ${width} 40`} style={{ margin: "0 auto", display: "block" }}>
      <rect x="0" y="0" width={width} height="40" fill={BRAND_GOLD} opacity="0.15" />
      <rect x="2" y="2" width={width - 4} height="36" fill="none" stroke={BRAND_GOLD} strokeWidth="1" />
      
      {/* Arabesque / interlocking pattern approximation */}
      <path d={`M 10 20 Q 20 5 30 20 T 50 20 T 70 20 T 90 20 T 110 20 T 130 20 T 150 20 T 170 20 T 190 20 T 210 20 T 230 20 T 250 20 T 270 20 T 290 20 T 310 20 T 330 20`} fill="none" stroke={BRAND_GOLD} strokeWidth="1.5" opacity="0.5" />
      <path d={`M 10 20 Q 20 35 30 20 T 50 20 T 70 20 T 90 20 T 110 20 T 130 20 T 150 20 T 170 20 T 190 20 T 210 20 T 230 20 T 250 20 T 270 20 T 290 20 T 310 20 T 330 20`} fill="none" stroke={BRAND_GOLD} strokeWidth="1.5" opacity="0.5" />
      
      {/* Center text / cartouche */}
      <rect x={width / 2 - 40} y="6" width="80" height="28" rx="14" fill={BRAND_BG} stroke={BRAND_GOLD} strokeWidth="1" />
      <text x={width / 2} y="25" fill={BRAND_GOLD} fontSize="14" fontFamily="'Amiri Quran', serif" textAnchor="middle">
        الإسراء
      </text>
    </svg>
  );
}

function Rosette({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <svg width={r*2} height={r*2} viewBox={`0 0 ${r*2} ${r*2}`} style={{ position: "absolute", top: y - r, left: x - r }}>
      <circle cx={r} cy={r} r={r-1} fill={BRAND_BG} stroke={BRAND_GOLD} strokeWidth="1" />
      <circle cx={r} cy={r} r={r-4} fill="none" stroke={BRAND_GOLD} strokeWidth="0.5" strokeDasharray="2 2" />
      <circle cx={r} cy={r} r="2" fill={BRAND_GOLD} />
      <path d={`M ${r} ${r-6} L ${r+2} ${r-2} L ${r+6} ${r} L ${r+2} ${r+2} L ${r} ${r+6} L ${r-2} ${r+2} L ${r-6} ${r} L ${r-2} ${r-2} Z`} fill={BRAND_GOLD} />
    </svg>
  );
}

function MarginalFloret({ position }: { position: "left" | "right" }) {
  return (
    <div style={{
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      [position]: 6,
      width: 14,
      height: 40,
      opacity: 0.8
    }}>
      <svg width="14" height="40" viewBox="0 0 14 40">
        <path d={position === "left" ? "M 2 20 L 12 5 L 12 35 Z" : "M 12 20 L 2 5 L 2 35 Z"} fill="none" stroke={BRAND_GOLD} strokeWidth="1" />
        <circle cx={position === "left" ? 6 : 8} cy="20" r="2" fill={BRAND_GOLD} />
      </svg>
    </div>
  );
}

export function Manuscript() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "#0a0a0a" }}>
      
      {/* Card Container */}
      <div style={{
        width: 460,
        aspectRatio: "9/13.5",
        backgroundColor: BRAND_BG,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
        display: "flex",
        flexDirection: "column",
      }}>
        
        {/* Texture overlay to feel hand-made/worn */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 50% 50%, rgba(201, 147, 58, 0.05) 0%, transparent 60%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")
          `,
          pointerEvents: "none",
          mixBlendMode: "overlay"
        }} />

        {/* Outer Frame */}
        <HandDrawnFrame w={460} h={690} />

        {/* Marginal Florets */}
        <MarginalFloret position="left" />
        <MarginalFloret position="right" />

        {/* Content Area */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "40px 36px 36px",
          position: "relative",
          zIndex: 1,
        }}>
          
          {/* Top Unwan Header */}
          <div style={{ marginBottom: 32 }}>
            <UnwanHeader width={388} />
          </div>

          {/* Central Inset Panel for Arabic Hero */}
          <div style={{
            flex: 1,
            backgroundColor: "rgba(245, 236, 215, 0.03)", // Faintly warm cream-tinted inset
            border: `1px solid rgba(201, 147, 58, 0.2)`,
            borderRadius: 8,
            padding: "36px 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
          }}>
            
            {/* Arabic Text */}
            <div style={{
              fontFamily: "'Amiri Quran', Amiri, 'Scheherazade New', serif",
              color: BRAND_CREAM,
              fontSize: 34,
              lineHeight: 1.8,
              textAlign: "center",
              direction: "rtl",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}>
              وَمِنَ ٱلَّيْلِ فَتَهَجَّدْ بِهِۦ نَافِلَةً لَّكَ عَسَىٰٓ أَن يَبْعَثَكَ رَبُّكَ مَقَامًا مَّحْمُودًا
              <span style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center", 
                width: 32, 
                height: 32, 
                marginRight: 12, 
                verticalAlign: "middle",
                background: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='16' cy='16' r='14' fill='none' stroke='%23C9933A' stroke-width='1.5'/%3E%3Ccircle cx='16' cy='16' r='10' fill='none' stroke='%23C9933A' stroke-width='0.5' stroke-dasharray='2 2'/%3E%3Cpath d='M16 8 L18 14 L24 16 L18 18 L16 24 L14 18 L8 16 L14 14 Z' fill='%23C9933A' opacity='0.5'/%3E%3C/svg%3E") no-repeat center`,
              }}>
                <span style={{ fontSize: 14, color: BRAND_GOLD, marginTop: 2 }}>٧٩</span>
              </span>
            </div>
            
          </div>

          {/* Translator's Note Area */}
          <div style={{
            marginTop: 24,
            padding: "0 16px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
            
            {/* Surah Cartouche */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px 16px",
              border: `1px solid ${BRAND_GOLD}`,
              borderRadius: 16,
              marginBottom: 16,
              background: `linear-gradient(90deg, transparent, rgba(201,147,58,0.1), transparent)`
            }}>
              <span style={{
                fontFamily: "Inter, sans-serif",
                color: BRAND_GOLD,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase"
              }}>
                Al-Isrāʾ · 17:79
              </span>
            </div>

            {/* English Translation */}
            <p style={{
              fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
              color: "rgba(245, 236, 215, 0.7)",
              fontSize: 15,
              lineHeight: 1.6,
              fontStyle: "italic",
              margin: 0,
            }}>
              "And in the night arise from sleep for prayer — a supererogatory act for you; perhaps your Lord will raise you to a praised station."
            </p>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Brand Lockup */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 24,
            opacity: 0.9,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <div style={{ height: 1, width: 24, backgroundColor: BRAND_GOLD, opacity: 0.3 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "'Amiri Quran', serif", color: BRAND_GOLD, fontSize: 16 }}>نور</span>
                <span style={{ fontFamily: "Inter, sans-serif", color: BRAND_GOLD, fontSize: 12, fontWeight: 700, letterSpacing: "0.15em" }}>NUUR</span>
                <span style={{ color: BRAND_GOLD, opacity: 0.5, fontSize: 10 }}>•</span>
                <span style={{ fontFamily: "Inter, sans-serif", color: "rgba(245, 236, 215, 0.6)", fontSize: 10, fontWeight: 500, letterSpacing: "0.05em" }}>nuur.app</span>
              </div>
              <div style={{ height: 1, width: 24, backgroundColor: BRAND_GOLD, opacity: 0.3 }} />
            </div>
            <span style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif", color: "rgba(245, 236, 215, 0.5)", fontSize: 11, fontStyle: "italic" }}>
              Light for your daily deen
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
