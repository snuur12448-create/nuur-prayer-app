/**
 * Variant — Night Sky Wallpaper.
 * Inspired by the Adh-Dhāriyāt reference: deep emerald gradient, faint
 * gold star dust, hairline corner brackets, bismillah at the top, large
 * geometric mandala watermark with a small crescent moon at its center,
 * cartouche-style surah label with diamond bullets, ornamental rule
 * around a center diamond, and a crescent + nuur footer.
 *
 * Renders at a wallpaper aspect (9:19.5) — fills the 540×1170 iframe.
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

/** Random-but-deterministic star field. */
function StarField() {
  // Deterministic seed pattern so the layout doesn't shift on re-render.
  const stars: Array<[number, number, number, number]> = [];
  const rng = (i: number) => {
    const x = Math.sin(i * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };
  for (let i = 0; i < 110; i++) {
    const x = rng(i) * 540;
    const y = rng(i + 100) * 1170;
    const r = 0.3 + rng(i + 200) * 1.0;
    const o = 0.3 + rng(i + 300) * 0.6;
    stars.push([x, y, r, o]);
  }
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 540 1170" preserveAspectRatio="none">
      {stars.map(([x, y, r, o], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={GOLD_BRIGHT} opacity={o} />
      ))}
    </svg>
  );
}

function CornerBracket({
  x, y, flipX = false, flipY = false,
}: { x: number; y: number; flipX?: boolean; flipY?: boolean }) {
  const sx = flipX ? -1 : 1;
  const sy = flipY ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
      <line x1="0" y1="0" x2="22" y2="0" stroke={GOLD} strokeWidth="0.9" />
      <line x1="0" y1="0" x2="0" y2="22" stroke={GOLD} strokeWidth="0.9" />
      {/* Tiny corner diamond */}
      <polygon points="0,-3.5 3.5,0 0,3.5 -3.5,0" fill={GOLD} />
    </g>
  );
}

/** Faint geometric mandala watermark behind the verse. */
function Mandala({ cx, cy }: { cx: number; cy: number }) {
  const r = 150;
  return (
    <g opacity="0.18">
      {/* Outer circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={GOLD} strokeWidth="0.6" />
      <circle cx={cx} cy={cy} r={r * 0.78} fill="none" stroke={GOLD} strokeWidth="0.5" />
      {/* Two interlocking squares — eight-point star */}
      <polygon
        points={`${cx - r * 0.7},${cy} ${cx},${cy - r * 0.7} ${cx + r * 0.7},${cy} ${cx},${cy + r * 0.7}`}
        fill="none" stroke={GOLD} strokeWidth="0.5"
      />
      <polygon
        points={`${cx - r * 0.5},${cy - r * 0.5} ${cx + r * 0.5},${cy - r * 0.5} ${cx + r * 0.5},${cy + r * 0.5} ${cx - r * 0.5},${cy + r * 0.5}`}
        fill="none" stroke={GOLD} strokeWidth="0.5"
      />
      {/* Inner small circle */}
      <circle cx={cx} cy={cy} r={r * 0.32} fill="none" stroke={GOLD} strokeWidth="0.5" />
    </g>
  );
}

/** Small crescent moon — used inside mandala and in the footer. */
function Crescent({ size, color = GOLD_BRIGHT }: { size: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
      <path
        d="M 18.5 12 A 7.5 7.5 0 1 1 11.4 4.6 A 6 6 0 1 0 18.5 12 Z"
        fill={color}
      />
    </svg>
  );
}

/** Diamond divider rule with a centered diamond between two hairlines. */
function DiamondRule({ width }: { width: number }) {
  const half = width / 2;
  return (
    <svg width={width} height={12} viewBox={`0 0 ${width} 12`} style={{ display: "block" }}>
      <line x1="0" y1="6" x2={half - 10} y2="6" stroke={GOLD} strokeWidth="0.7" opacity="0.7" />
      <polygon
        points={`${half},2 ${half + 5},6 ${half},10 ${half - 5},6`}
        fill={GOLD}
      />
      <line x1={half + 10} y1="6" x2={width} y2="6" stroke={GOLD} strokeWidth="0.7" opacity="0.7" />
    </svg>
  );
}

export function ExploreNightSky() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative flex flex-col items-center"
      style={{
        background:
          `radial-gradient(ellipse at 50% 30%, ${BG_TOP} 0%, ${BG_MID} 55%, ${BG_BTM} 100%)`,
      }}
    >
      <StarField />

      {/* Corner brackets and outer hairline frame */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 540 1170"
        preserveAspectRatio="none"
      >
        <rect
          x="20" y="20" width="500" height="1130"
          fill="none" stroke={GOLD_DIM} strokeWidth="0.5" opacity="0.35"
        />
        <CornerBracket x={32} y={32} />
        <CornerBracket x={508} y={32} flipX />
        <CornerBracket x={32} y={1138} flipY />
        <CornerBracket x={508} y={1138} flipX flipY />
      </svg>

      {/* Bismillah */}
      <div className="relative w-full text-center" style={{ paddingTop: 92 }}>
        <p
          className="font-['Amiri_Quran']"
          style={{ color: GOLD_BRIGHT, fontSize: 24, lineHeight: 1, direction: "rtl" }}
        >
          {BISMILLAH}
        </p>
      </div>

      {/* Center stage */}
      <div className="relative flex-1 w-full flex items-center justify-center">
        {/* Mandala watermark — centered behind text */}
        <svg
          className="absolute"
          style={{ width: 380, height: 380, top: "50%", left: "50%", transform: "translate(-50%, -52%)" }}
          viewBox="0 0 540 540"
        >
          <Mandala cx={270} cy={270} />
        </svg>
        {/* Crescent at the center of the mandala */}
        <div
          className="absolute"
          style={{
            top: "50%", left: "50%",
            transform: "translate(-50%, calc(-50% - 80px))",
          }}
        >
          <Crescent size={26} color={GOLD_BRIGHT} />
        </div>

        {/* Verse content */}
        <div className="relative px-10 text-center w-full" style={{ marginTop: -20 }}>
          {/* Surah cartouche */}
          <div className="flex items-center justify-center gap-3" style={{ color: GOLD_BRIGHT }}>
            <span style={{ fontSize: 6, lineHeight: 1 }}>◆</span>
            <span
              className="font-['Inter']"
              style={{ fontSize: 12, letterSpacing: "0.32em", fontWeight: 600 }}
            >
              {SURAH_LABEL}
            </span>
            <span style={{ fontSize: 6, lineHeight: 1 }}>◆</span>
          </div>

          {/* Surah name */}
          <p
            className="font-['Cormorant_Garamond'] mt-4"
            style={{ color: CREAM, fontSize: 26, fontWeight: 500, letterSpacing: "0.005em" }}
          >
            {SURAH_NAME}
          </p>

          {/* Arabic verse */}
          <p
            className="font-['Amiri_Quran'] mt-7"
            style={{
              color: CREAM,
              fontSize: 32,
              lineHeight: 1.85,
              direction: "rtl",
            }}
          >
            {ARABIC}
          </p>

          {/* Diamond rule */}
          <div className="mt-6 flex justify-center">
            <DiamondRule width={220} />
          </div>

          {/* Translation */}
          <p
            className="font-['Inter'] mt-5 mx-auto"
            style={{
              color: CREAM_DIM,
              fontSize: 15,
              lineHeight: 1.5,
              maxWidth: 320,
              fontWeight: 400,
            }}
          >
            {TRANSLATION}
          </p>
        </div>
      </div>

      {/* Footer — crescent + brand */}
      <div className="relative w-full flex flex-col items-center pb-16">
        <div className="flex items-center gap-2.5">
          <Crescent size={18} color={GOLD} />
          <span
            className="font-['Amiri']"
            style={{ color: GOLD_BRIGHT, fontSize: 16, lineHeight: 1 }}
          >
            نور
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span
            className="font-['Inter']"
            style={{
              color: CREAM,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.32em",
            }}
          >
            NUUR
          </span>
          <span style={{ color: GOLD_DIM, fontSize: 10 }}>·</span>
          <span
            className="font-['Inter']"
            style={{ color: CREAM_DIM, fontSize: 11, letterSpacing: "0.05em" }}
          >
            nuur.app
          </span>
        </div>
        <span
          className="font-['Inter'] mt-2"
          style={{
            color: "rgba(244,236,210,0.45)",
            fontSize: 10,
            letterSpacing: "0.18em",
          }}
        >
          Light for your daily deen
        </span>
      </div>
    </div>
  );
}
