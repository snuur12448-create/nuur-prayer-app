/**
 * Night Sky variant — Minimal.
 * Strips the central mandala and most ornament. Lets the verse breathe
 * against the emerald + stars + corner brackets. The gold becomes a
 * single highlight on the surah label and the diamond divider. Apple-
 * level restraint.
 */

const SURAH_LABEL = "ADH-DHĀRIYĀT · 51:18";
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
const CREAM_DIM = "rgba(244,236,210,0.72)";

function StarField() {
  const stars: Array<[number, number, number, number]> = [];
  const rng = (i: number) => {
    const x = Math.sin(i * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };
  // Fewer, more deliberate stars for the minimal version.
  for (let i = 0; i < 70; i++) {
    stars.push([rng(i) * 540, rng(i + 100) * 1170, 0.3 + rng(i + 200) * 0.9, 0.25 + rng(i + 300) * 0.55]);
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
      <line x1="0" y1="0" x2="18" y2="0" stroke={GOLD} strokeWidth="0.7" opacity="0.7" />
      <line x1="0" y1="0" x2="0" y2="18" stroke={GOLD} strokeWidth="0.7" opacity="0.7" />
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

export function NightSkyMinimal() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative flex flex-col items-center"
      style={{ background: `radial-gradient(ellipse at 50% 35%, ${BG_TOP} 0%, ${BG_MID} 55%, ${BG_BTM} 100%)` }}
    >
      <StarField />

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 540 1170" preserveAspectRatio="none">
        <CornerBracket x={36} y={36} />
        <CornerBracket x={504} y={36} flipX />
        <CornerBracket x={36} y={1134} flipY />
        <CornerBracket x={504} y={1134} flipX flipY />
      </svg>

      {/* Bismillah */}
      <div className="relative w-full text-center" style={{ paddingTop: 100 }}>
        <p className="font-['Amiri_Quran']" style={{ color: GOLD_BRIGHT, fontSize: 22, lineHeight: 1, direction: "rtl", opacity: 0.9 }}>
          {BISMILLAH}
        </p>
      </div>

      <div className="relative flex-1 w-full flex items-center justify-center">
        <div className="relative px-10 text-center w-full">
          {/* Tiny gold reference */}
          <div className="flex items-center justify-center gap-3" style={{ color: GOLD_BRIGHT }}>
            <div className="h-px w-8" style={{ backgroundColor: GOLD_DIM }} />
            <span className="font-['Inter']" style={{ fontSize: 11, letterSpacing: "0.36em", fontWeight: 600 }}>{SURAH_LABEL}</span>
            <div className="h-px w-8" style={{ backgroundColor: GOLD_DIM }} />
          </div>

          {/* Hero Arabic — much larger, more breathing room */}
          <p
            className="font-['Amiri_Quran'] mt-12"
            style={{ color: CREAM, fontSize: 38, lineHeight: 1.8, direction: "rtl" }}
          >
            {ARABIC}
          </p>

          {/* Single tiny diamond as divider */}
          <div className="mt-10 flex justify-center">
            <svg width="8" height="8" viewBox="0 0 8 8">
              <polygon points="4,0 8,4 4,8 0,4" fill={GOLD} />
            </svg>
          </div>

          {/* Translation */}
          <p
            className="font-['Cormorant_Garamond'] italic mt-8 mx-auto"
            style={{ color: CREAM_DIM, fontSize: 18, lineHeight: 1.4, maxWidth: 320, fontWeight: 400 }}
          >
            “{TRANSLATION}”
          </p>
        </div>
      </div>

      {/* Footer — quieter */}
      <div className="relative w-full flex flex-col items-center pb-16">
        <div className="flex items-center gap-2">
          <Crescent size={14} color={GOLD} />
          <span className="font-['Inter']" style={{ color: CREAM, fontSize: 12, fontWeight: 700, letterSpacing: "0.36em" }}>NUUR</span>
        </div>
        <span
          className="font-['Inter'] mt-2"
          style={{ color: "rgba(244,236,210,0.4)", fontSize: 9, letterSpacing: "0.22em" }}
        >
          nuur.app
        </span>
      </div>
    </div>
  );
}
