/**
 * Variant 4 — Mihrab Arch.
 * Architectural prayer-niche metaphor: a large gold-outlined mihrab arch
 * frames the Arabic in the upper two-thirds, with the translation
 * inscribed on a "foundation" panel below. Deep midnight ground with
 * a soft gold dust texture.
 */

const ARABIC = "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ، وَأَنَا خَيْرُكُمْ لِأَهْلِي";
const TRANSLATION =
  "The best of you are those who are best to their families, and I am the best of you to my family.";

const BG_TOP = "#0E1426";
const BG_MID = "#0A0F1B";
const BG_BTM = "#06091300";
const GOLD = "#E2C079";
const GOLD_DIM = "#8C6F2C";
const TEXT = "#F5EEDB";
const TEXT_MUTED = "rgba(245,238,219,0.62)";

function Mihrab() {
  // Pointed arch silhouette: two arcs meeting at the top, sitting on a
  // rectangular base. Drawn in viewBox 540×675, occupying roughly
  // 60–500 horizontally and 70–470 vertically.
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 540 675"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="mihrabStroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={GOLD} stopOpacity="0.9" />
          <stop offset="1" stopColor={GOLD_DIM} stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="dust" cx="50%" cy="40%" r="55%">
          <stop offset="0" stopColor={GOLD} stopOpacity="0.10" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Soft glow */}
      <rect width="540" height="675" fill="url(#dust)" />
      {/* Arch path: M start, vertical up, quadratic to peak, quadratic down, vertical to start */}
      <path
        d="M 90 470 L 90 220 Q 90 70 270 70 Q 450 70 450 220 L 450 470 Z"
        fill="none"
        stroke="url(#mihrabStroke)"
        strokeWidth="1.6"
      />
      {/* Inner arch hairline */}
      <path
        d="M 105 470 L 105 226 Q 105 86 270 86 Q 435 86 435 226 L 435 470 Z"
        fill="none"
        stroke={GOLD}
        strokeOpacity="0.28"
        strokeWidth="0.8"
      />
      {/* Keystone star at the apex */}
      <g transform="translate(270 86)">
        <circle r="9" fill="none" stroke={GOLD} strokeWidth="1" />
        <polygon
          points="0,-6 1.7,-1.7 6,0 1.7,1.7 0,6 -1.7,1.7 -6,0 -1.7,-1.7"
          fill={GOLD}
        />
      </g>
      {/* Base "foundation" hairline */}
      <line x1="60" y1="470" x2="480" y2="470" stroke={GOLD} strokeOpacity="0.45" />
      {/* Bottom flourish: small lozenges */}
      <g fill={GOLD} opacity="0.7">
        <polygon points="266,602 270,598 274,602 270,606" />
        <polygon points="252,602 256,598 260,602 256,606" />
        <polygon points="280,602 284,598 288,602 284,606" />
      </g>
    </svg>
  );
}

export function ExploreMihrab() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_MID} 50%, ${BG_BTM} 100%)`,
      }}
    >
      <Mihrab />

      {/* Top eyebrow */}
      <div className="absolute top-7 inset-x-0 flex items-center justify-center">
        <div className="flex items-center gap-3" style={{ color: TEXT_MUTED }}>
          <span className="font-['Inter'] font-bold text-[10px] tracking-[0.5em]" style={{ color: TEXT }}>NUUR</span>
          <span className="w-[3px] h-[3px] rounded-full" style={{ backgroundColor: GOLD }} />
          <span className="font-['Inter'] text-[9px] tracking-[0.36em]">HADITH</span>
        </div>
      </div>

      {/* Arabic inside the arch */}
      <div className="absolute inset-x-0" style={{ top: 130, height: 320 }}>
        <div className="h-full flex items-center justify-center px-16">
          <p
            className="font-['Amiri_Quran'] text-center"
            style={{ color: TEXT, fontSize: 30, lineHeight: 1.85, direction: "rtl" }}
          >
            {ARABIC}
          </p>
        </div>
      </div>

      {/* Foundation: translation */}
      <div className="absolute inset-x-0" style={{ top: 490 }}>
        <div className="px-12 text-center">
          <p
            className="font-['Cormorant_Garamond'] italic text-center"
            style={{ color: TEXT, fontSize: 18, lineHeight: 1.4, fontWeight: 400 }}
          >
            “{TRANSLATION}”
          </p>
        </div>
      </div>

      {/* Bottom attribution */}
      <div className="absolute bottom-7 inset-x-0 flex items-center justify-between px-12">
        <span className="font-['Inter'] text-[10px] tracking-wider" style={{ color: TEXT_MUTED }}>
          Jāmiʿ at-Tirmidhī · 3895
        </span>
        <span className="font-['Inter'] font-bold text-[10px] tracking-[0.5em]" style={{ color: GOLD }}>
          نور
        </span>
      </div>
    </div>
  );
}
