/**
 * Variant 3 — Geometric Tile.
 * Deep teal ground, edge-to-edge eight-fold Islamic geometric pattern in
 * gold at low opacity, with a centered gold-bordered cartouche holding
 * the text. Bold, dense, unmistakably Islamic art.
 */

const ARABIC = "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ، وَأَنَا خَيْرُكُمْ لِأَهْلِي";
const TRANSLATION =
  "The best of you are those who are best to their families, and I am the best of you to my family.";

const BG = "#061612";
const BG_INNER = "#091C16";
const GOLD = "#D8B05A";
const GOLD_DIM = "#7E5E22";
const TEXT = "#F5EBC9";

/**
 * Eight-fold star tessellation tile. Two interlocking squares form the
 * star, with diamond shapes filling the negative space. Tiles seamlessly
 * via SVG <pattern>.
 */
function GeometricBackground() {
  const T = 80; // tile size
  const c = T / 2;
  const r = T * 0.42;
  const square = `${c - r},${c} ${c},${c - r} ${c + r},${c} ${c},${c + r}`;
  const sqRot  = (() => {
    const k = r * 0.71;
    return `${c - k},${c - k} ${c + k},${c - k} ${c + k},${c + k} ${c - k},${c + k}`;
  })();
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="tile" x="0" y="0" width={T} height={T} patternUnits="userSpaceOnUse">
          <polygon points={square} fill="none" stroke={GOLD} strokeWidth="0.7" />
          <polygon points={sqRot} fill="none" stroke={GOLD} strokeWidth="0.7" />
          {/* Connecting lines to next tile */}
          <line x1={c} y1="0" x2={c} y2={c - r} stroke={GOLD} strokeWidth="0.7" />
          <line x1={c} y1={c + r} x2={c} y2={T} stroke={GOLD} strokeWidth="0.7" />
          <line x1="0" y1={c} x2={c - r} y2={c} stroke={GOLD} strokeWidth="0.7" />
          <line x1={c + r} y1={c} x2={T} y2={c} stroke={GOLD} strokeWidth="0.7" />
        </pattern>
        <radialGradient id="vignette" cx="50%" cy="50%" r="65%">
          <stop offset="0" stopColor="black" stopOpacity="0" />
          <stop offset="1" stopColor="black" stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={BG} />
      <rect width="100%" height="100%" fill="url(#tile)" opacity="0.16" />
      <rect width="100%" height="100%" fill="url(#vignette)" />
    </svg>
  );
}

function CartoucheBorder() {
  // Decorative cartouche drawn as inset hairlines + corner motifs.
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect x="2" y="2" width="96" height="96" fill="none" stroke={GOLD} strokeWidth="0.4" />
      <rect x="3.5" y="3.5" width="93" height="93" fill="none" stroke={GOLD_DIM} strokeWidth="0.25" />
    </svg>
  );
}

function Diamond({ size, fill = GOLD }: { size: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" style={{ display: "block" }}>
      <polygon points="6,0 12,6 6,12 0,6" fill={fill} />
    </svg>
  );
}

export function ExploreGeometric() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: BG }}>
      <GeometricBackground />

      {/* Top brand band */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-center pt-7 z-10">
        <div className="flex items-center gap-3" style={{ color: GOLD }}>
          <Diamond size={5} />
          <span className="font-bold text-[10px] tracking-[0.5em]">NUUR</span>
          <Diamond size={5} />
          <span className="text-[9px] tracking-[0.36em]" style={{ opacity: 0.75 }}>HADITH</span>
          <Diamond size={5} />
        </div>
      </div>

      {/* Cartouche */}
      <div className="absolute inset-0 flex items-center justify-center px-9">
        <div
          className="relative w-full"
          style={{
            backgroundColor: BG_INNER,
            paddingTop: 44,
            paddingBottom: 44,
            paddingLeft: 28,
            paddingRight: 28,
            boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
          }}
        >
          <CartoucheBorder />
          {/* Corner diamonds */}
          <div className="absolute -top-[6px] left-1/2 -translate-x-1/2"><Diamond size={12} fill={GOLD} /></div>
          <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2"><Diamond size={12} fill={GOLD} /></div>

          <p
            className="font-['Amiri_Quran'] text-center"
            style={{ color: TEXT, fontSize: 30, lineHeight: 1.85, direction: "rtl" }}
          >
            {ARABIC}
          </p>

          <div className="my-5 flex items-center justify-center gap-2">
            <div className="h-px w-12" style={{ backgroundColor: GOLD_DIM }} />
            <Diamond size={6} />
            <div className="h-px w-12" style={{ backgroundColor: GOLD_DIM }} />
          </div>

          <p
            className="font-['Cormorant_Garamond'] italic text-center"
            style={{ color: TEXT, fontSize: 16, lineHeight: 1.45, opacity: 0.92 }}
          >
            “{TRANSLATION}”
          </p>
        </div>
      </div>

      {/* Bottom brand band */}
      <div className="absolute bottom-0 inset-x-0 flex items-center justify-center pb-7 z-10">
        <div className="flex items-center gap-3" style={{ color: GOLD, opacity: 0.85 }}>
          <Diamond size={4} />
          <span className="font-['Inter'] text-[9px] tracking-[0.28em]">JĀMI' AT-TIRMIDHĪ · 3895</span>
          <Diamond size={4} />
        </div>
      </div>
    </div>
  );
}
