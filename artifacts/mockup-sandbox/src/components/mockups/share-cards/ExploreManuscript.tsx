/**
 * Variant 1 — Manuscript.
 * A refined version of the current direction: deep emerald ground,
 * inner hairline frame with corner stars, rub-el-hizb above the masthead,
 * star-divider between Arabic and English, NUUR mark in the footer.
 *
 * Mood: classical Islamic manuscript, gold leaf on deep green.
 */

const ARABIC = "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ، وَأَنَا خَيْرُكُمْ لِأَهْلِي";
const TRANSLATION =
  "The best of you are those who are best to their families, and I am the best of you to my family.";

const BG_TOP = "#0B1A11";
const BG_MID = "#091510";
const BG_BTM = "#050C08";
const ACCENT = "#D4A24A";
const ACCENT_SOFT = "#7C5A22";
const TEXT = "rgba(247,239,221,0.97)";
const TEXT_MUTED = "rgba(247,239,221,0.62)";

function RubElHizb({ size, opacity = 1 }: { size: number; opacity?: number }) {
  const r = 28;
  const a = `${32 - r},${32 - r} ${32 + r},${32 - r} ${32 + r},${32 + r} ${32 - r},${32 + r}`;
  const b = `${32},${32 - r * 1.15} ${32 + r * 1.15},${32} ${32},${32 + r * 1.15} ${32 - r * 1.15},${32}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: "block" }}>
      <polygon points={a} fill="none" stroke={ACCENT} strokeWidth="1.5" opacity={opacity} />
      <polygon points={b} fill="none" stroke={ACCENT} strokeWidth="1.5" opacity={opacity} />
      <circle cx="32" cy="32" r="2" fill={ACCENT} opacity={opacity} />
    </svg>
  );
}

function FourStar({ size }: { size: number }) {
  const c = 32, r = 28, i = 8;
  const p = `${c},${c-r} ${c+i},${c-i} ${c+r},${c} ${c+i},${c+i} ${c},${c+r} ${c-i},${c+i} ${c-r},${c} ${c-i},${c-i}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: "block" }}>
      <polygon points={p} fill={ACCENT} />
    </svg>
  );
}

function Rule({ width }: { width: number }) {
  return (
    <svg width={width} height={12} viewBox={`0 0 ${width} 12`}>
      <defs>
        <linearGradient id="rL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={ACCENT_SOFT} stopOpacity="0" />
          <stop offset="1" stopColor={ACCENT} stopOpacity=".9" />
        </linearGradient>
        <linearGradient id="rR" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={ACCENT} stopOpacity=".9" />
          <stop offset="1" stopColor={ACCENT_SOFT} stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1="6" x2={width / 2 - 12} y2="6" stroke="url(#rL)" />
      <g transform={`translate(${width / 2 - 6} 1)`}>
        <FourStar size={12} />
      </g>
      <line x1={width / 2 + 12} y1="6" x2={width} y2="6" stroke="url(#rR)" />
    </svg>
  );
}

function CornerStar({ x, y, size }: { x: number; y: number; size: number }) {
  const r = size / 2, i = r * 0.32;
  const pts = `${x},${y-r} ${x+i},${y-i} ${x+r},${y} ${x+i},${y+i} ${x},${y+r} ${x-i},${y+i} ${x-r},${y} ${x-i},${y-i}`;
  return <polygon points={pts} fill={ACCENT} />;
}

export function ExploreManuscript() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative flex items-center justify-center"
      style={{
        background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_MID} 55%, ${BG_BTM} 100%)`,
      }}
    >
      {/* Soft glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: "85%",
          height: "85%",
          background: "radial-gradient(circle, rgba(212,162,74,0.10) 0%, rgba(212,162,74,0) 60%)",
        }}
      />
      {/* Watermark star */}
      <div className="absolute opacity-[0.05]">
        <RubElHizb size={400} />
      </div>

      {/* Frame */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 540 675"
        preserveAspectRatio="none"
      >
        <rect x="20" y="20" width="500" height="635" fill="none" stroke={ACCENT} strokeOpacity={0.2} />
        {/* Corner brackets */}
        <g stroke={ACCENT} strokeOpacity={0.55} strokeLinecap="round">
          <line x1="40" y1="40" x2="62" y2="40" /><line x1="40" y1="40" x2="40" y2="62" />
          <line x1="500" y1="40" x2="478" y2="40" /><line x1="500" y1="40" x2="500" y2="62" />
          <line x1="40" y1="635" x2="62" y2="635" /><line x1="40" y1="635" x2="40" y2="613" />
          <line x1="500" y1="635" x2="478" y2="635" /><line x1="500" y1="635" x2="500" y2="613" />
        </g>
        <CornerStar x={40} y={40} size={9} />
        <CornerStar x={500} y={40} size={9} />
        <CornerStar x={40} y={635} size={9} />
        <CornerStar x={500} y={635} size={9} />
      </svg>

      {/* Content */}
      <div className="relative flex flex-col items-center text-center px-14 py-14 h-full w-full">
        {/* Masthead */}
        <div className="flex flex-col items-center pt-2">
          <RubElHizb size={22} />
          <div className="flex items-center mt-3" style={{ color: TEXT }}>
            <span className="font-bold text-[10px] tracking-[0.4em]">NUUR</span>
            <span className="mx-3 w-[3px] h-[3px] rounded-full" style={{ backgroundColor: ACCENT }} />
            <span className="text-[9px] tracking-[0.32em]" style={{ color: TEXT_MUTED }}>HADITH</span>
            <span className="mx-3 w-[3px] h-[3px] rounded-full" style={{ backgroundColor: ACCENT }} />
            <span className="text-[9px] tracking-[0.18em]" style={{ color: TEXT_MUTED }}>TIRMIDHI · 3895</span>
          </div>
          <div className="mt-4">
            <Rule width={260} />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <p
            className="font-['Amiri_Quran'] text-center"
            style={{ color: TEXT, fontSize: 32, lineHeight: 1.85, direction: "rtl" }}
          >
            {ARABIC}
          </p>
          <div className="my-6">
            <svg width="80" height="10" viewBox="0 0 80 10">
              <line x1="0" y1="5" x2="34" y2="5" stroke={ACCENT} strokeOpacity="0.5" />
              <circle cx="40" cy="5" r="2.4" fill={ACCENT} />
              <line x1="46" y1="5" x2="80" y2="5" stroke={ACCENT} strokeOpacity="0.5" />
            </svg>
          </div>
          <p
            className="font-['Inter'] text-center px-2"
            style={{ color: TEXT, fontSize: 16, lineHeight: 1.5 }}
          >
            {TRANSLATION}
          </p>
        </div>

        {/* Footer */}
        <div className="w-full flex flex-col items-center pb-2">
          <Rule width={260} />
          <div className="mt-4 w-full flex items-center justify-between">
            <span className="text-[10px] tracking-wide" style={{ color: TEXT_MUTED }}>
              Jami at-Tirmidhi · 3895
            </span>
            <div className="flex items-center">
              <span className="font-bold text-[10px] tracking-[0.4em]" style={{ color: ACCENT }}>NUUR</span>
              <span className="ml-2"><RubElHizb size={11} /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
