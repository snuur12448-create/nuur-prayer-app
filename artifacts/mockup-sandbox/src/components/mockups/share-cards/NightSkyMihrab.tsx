/**
 * Night Sky variant — Mihrab.
 * Same emerald wallpaper template, but the central watermark is replaced
 * with a tall pointed-arch (mihrab) silhouette in gold hairlines that
 * frames the verse like a prayer niche. Stars, corner brackets, bismillah
 * and the nuur footer are kept intact.
 */

const SURAH_LABEL = "ADH-DHĀRIYĀT · 51:18";
const SURAH_NAME = "Adh-Dhāriyāt";
const ARABIC = "وَبِٱلْأَسْحَارِ هُمْ يَسْتَغْفِرُونَ";
const TRANSLATION = "And in the hours before dawn they would seek forgiveness.";
const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

const BG_TOP = "#0F2A1E";
const BG_MID = "#0A1D14";
const BG_BTM = "#040C08";
const GOLD = "#C9933A";
const GOLD_BRIGHT = "#E5B25A";
const GOLD_DIM = "#7B5A24";
const CREAM = "#F4ECD2";
const CREAM_DIM = "rgba(244,236,210,0.78)";

function StarField() {
  const stars: Array<[number, number, number, number]> = [];
  const rng = (i: number) => {
    const x = Math.sin(i * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };
  for (let i = 0; i < 110; i++) {
    stars.push([
      rng(i) * 540,
      rng(i + 100) * 1170,
      0.3 + rng(i + 200) * 1.0,
      0.3 + rng(i + 300) * 0.6,
    ]);
  }
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 540 1170" preserveAspectRatio="none">
      {stars.map(([x, y, r, o], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={GOLD_BRIGHT} opacity={o} />
      ))}
    </svg>
  );
}

function CornerBracket({ x, y, flipX = false, flipY = false }: { x: number; y: number; flipX?: boolean; flipY?: boolean }) {
  const sx = flipX ? -1 : 1, sy = flipY ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
      <line x1="0" y1="0" x2="22" y2="0" stroke={GOLD} strokeWidth="0.9" />
      <line x1="0" y1="0" x2="0" y2="22" stroke={GOLD} strokeWidth="0.9" />
      <polygon points="0,-3.5 3.5,0 0,3.5 -3.5,0" fill={GOLD} />
    </g>
  );
}

function Crescent({ size, color = GOLD_BRIGHT }: { size: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
      <path d="M 18.5 12 A 7.5 7.5 0 1 1 11.4 4.6 A 6 6 0 1 0 18.5 12 Z" fill={color} />
    </svg>
  );
}

function DiamondRule({ width }: { width: number }) {
  const half = width / 2;
  return (
    <svg width={width} height={12} viewBox={`0 0 ${width} 12`}>
      <line x1="0" y1="6" x2={half - 10} y2="6" stroke={GOLD} strokeWidth="0.7" opacity="0.7" />
      <polygon points={`${half},2 ${half + 5},6 ${half},10 ${half - 5},6`} fill={GOLD} />
      <line x1={half + 10} y1="6" x2={width} y2="6" stroke={GOLD} strokeWidth="0.7" opacity="0.7" />
    </svg>
  );
}

/** Tall pointed-arch (mihrab) silhouette as the centerpiece. */
function MihrabArch() {
  // Centered around (270, 600) in 540×1170 viewBox.
  // Arch spans y 360–860 roughly (height 500), width 220–320 (width 100 visible),
  // total inner width 220 wide for proportions.
  return (
    <g opacity="0.32">
      {/* Outer arch */}
      <path
        d="M 165 850 L 165 540 Q 165 380 270 380 Q 375 380 375 540 L 375 850 Z"
        fill="none"
        stroke={GOLD}
        strokeWidth="0.9"
      />
      {/* Inner arch */}
      <path
        d="M 178 850 L 178 546 Q 178 396 270 396 Q 362 396 362 546 L 362 850 Z"
        fill="none"
        stroke={GOLD}
        strokeWidth="0.5"
        opacity="0.7"
      />
      {/* Apex keystone */}
      <g transform="translate(270 380)">
        <circle r="6" fill="none" stroke={GOLD} strokeWidth="0.8" />
        <polygon points="0,-3 1,-1 3,0 1,1 0,3 -1,1 -3,0 -1,-1" fill={GOLD} />
      </g>
      {/* Foundation line under arch */}
      <line x1="140" y1="870" x2="400" y2="870" stroke={GOLD} strokeWidth="0.6" opacity="0.6" />
    </g>
  );
}

export function NightSkyMihrab() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative flex flex-col items-center"
      style={{ background: `radial-gradient(ellipse at 50% 30%, ${BG_TOP} 0%, ${BG_MID} 55%, ${BG_BTM} 100%)` }}
    >
      <StarField />

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 540 1170" preserveAspectRatio="none">
        <rect x="20" y="20" width="500" height="1130" fill="none" stroke={GOLD_DIM} strokeWidth="0.5" opacity="0.35" />
        <CornerBracket x={32} y={32} />
        <CornerBracket x={508} y={32} flipX />
        <CornerBracket x={32} y={1138} flipY />
        <CornerBracket x={508} y={1138} flipX flipY />
        <MihrabArch />
      </svg>

      {/* Bismillah */}
      <div className="relative w-full text-center" style={{ paddingTop: 92 }}>
        <p className="font-['Amiri_Quran']" style={{ color: GOLD_BRIGHT, fontSize: 24, lineHeight: 1, direction: "rtl" }}>
          {BISMILLAH}
        </p>
      </div>

      <div className="relative flex-1 w-full flex items-center justify-center">
        <div className="relative px-10 text-center w-full" style={{ marginTop: -10 }}>
          <div className="flex items-center justify-center gap-3" style={{ color: GOLD_BRIGHT }}>
            <span style={{ fontSize: 6 }}>◆</span>
            <span className="font-['Inter']" style={{ fontSize: 12, letterSpacing: "0.32em", fontWeight: 600 }}>
              {SURAH_LABEL}
            </span>
            <span style={{ fontSize: 6 }}>◆</span>
          </div>
          <p className="font-['Cormorant_Garamond'] mt-4" style={{ color: CREAM, fontSize: 26, fontWeight: 500 }}>
            {SURAH_NAME}
          </p>
          <p
            className="font-['Amiri_Quran'] mt-8"
            style={{ color: CREAM, fontSize: 32, lineHeight: 1.85, direction: "rtl" }}
          >
            {ARABIC}
          </p>
          <div className="mt-6 flex justify-center"><DiamondRule width={220} /></div>
          <p
            className="font-['Inter'] mt-5 mx-auto"
            style={{ color: CREAM_DIM, fontSize: 15, lineHeight: 1.5, maxWidth: 320 }}
          >
            {TRANSLATION}
          </p>
        </div>
      </div>

      <div className="relative w-full flex flex-col items-center pb-16">
        <div className="flex items-center gap-2.5">
          <Crescent size={18} color={GOLD} />
          <span className="font-['Amiri']" style={{ color: GOLD_BRIGHT, fontSize: 16, lineHeight: 1 }}>نور</span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-['Inter']" style={{ color: CREAM, fontSize: 13, fontWeight: 700, letterSpacing: "0.32em" }}>NUUR</span>
          <span style={{ color: GOLD_DIM, fontSize: 10 }}>·</span>
          <span className="font-['Inter']" style={{ color: CREAM_DIM, fontSize: 11 }}>nuur.app</span>
        </div>
        <span className="font-['Inter'] mt-2" style={{ color: "rgba(244,236,210,0.45)", fontSize: 10, letterSpacing: "0.18em" }}>
          Light for your daily deen
        </span>
      </div>
    </div>
  );
}
