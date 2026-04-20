import React, { useState } from 'react';
import { ChevronRight, Bookmark, Volume2 } from 'lucide-react';

// 99 stars positioned across a starfield. We mark which is "tonight" (23) and which are "carried" (1..22).
type Star = { i: number; x: number; y: number; s: number };

const STARS: Star[] = generateStars(99);

function generateStars(n: number): Star[] {
  // Pseudo-random but deterministic placement clustered in a constellation feel.
  const rand = mulberry32(7);
  const out: Star[] = [];
  for (let i = 0; i < n; i++) {
    const x = 6 + rand() * 88;
    const y = 6 + rand() * 86;
    const s = 0.4 + rand() * 1.4;
    out.push({ i: i + 1, x, y, s });
  }
  return out;
}
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAME = {
  n: 23,
  ar: "الرَّافِعُ",
  tr: "Ar-Rāfi'",
  mn: "The Exalter",
  whisper: "He who lifts the unseen ranks no eye can measure.",
};

export function Flashcard() {
  const [revealed, setRevealed] = useState(false);
  const tonight = STARS[NAME.n - 1];

  return (
    <div className="min-h-screen w-full bg-[#0F0E14] flex items-center justify-center font-sans">
      <div className="w-[390px] h-[844px] relative bg-[#0F0E14] flex flex-col overflow-hidden border border-white/[0.03]">
        {/* deep night gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0E14] via-[#11101A] to-[#0A0910] pointer-events-none" />

        {/* starfield */}
        <div className="absolute inset-0">
          {STARS.map((st) => {
            const carried = st.i < NAME.n;
            const isTonight = st.i === NAME.n;
            return (
              <div
                key={st.i}
                className="absolute rounded-full"
                style={{
                  left: `${st.x}%`,
                  top: `${st.y}%`,
                  width: `${st.s * 2}px`,
                  height: `${st.s * 2}px`,
                  background: isTonight ? '#F4E4C0' : carried ? '#C9933A' : '#E8E6E1',
                  opacity: isTonight ? 1 : carried ? 0.55 : 0.18,
                  boxShadow: isTonight
                    ? '0 0 14px rgba(244,228,192,0.9), 0 0 28px rgba(201,147,58,0.5)'
                    : carried ? `0 0 ${st.s * 3}px rgba(201,147,58,0.5)` : undefined,
                }}
              />
            );
          })}
          {/* tonight halo */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${tonight.x}%`,
              top: `${tonight.y}%`,
              width: '120px',
              height: '120px',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(201,147,58,0.18), transparent 70%)',
            }}
          />
        </div>

        {/* header */}
        <div className="pt-14 px-8 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-6 h-[1px] bg-gradient-to-r from-transparent to-[#C9933A]/40" />
            <span className="text-[#C9933A] text-[10px] tracking-[0.3em] uppercase font-bold">Constellation</span>
          </div>
          <span className="text-[#E8E6E1]/40 text-[10px] tracking-[0.18em]">23 / 99</span>
        </div>

        {/* spacer to let the starfield breathe */}
        <div className="flex-1" />

        {/* parchment card lifting from the bottom */}
        <div className="px-5 pb-10 relative z-10">
          <div className="relative rounded-[28px] bg-gradient-to-b from-[#16141D] to-[#11101A] border border-[#C9933A]/15 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.04)]">
            {/* gold seam top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C9933A]/60 to-transparent" />

            <div className="px-7 pt-8 pb-6 flex flex-col items-center">
              <div className="text-[#C9933A]/60 text-[10px] tracking-[0.3em] uppercase font-bold">
                The Twenty-third
              </div>

              <div className="mt-4 text-[#C9933A] font-['Amiri',serif] text-[68px] leading-none text-center">
                {NAME.ar}
              </div>

              {/* hairline */}
              <div className="my-5 w-16 h-[1px] bg-[#C9933A]/25" />

              <div className="flex items-baseline gap-2.5">
                <div className="text-[#E8E6E1] text-[22px] font-['Playfair_Display',serif] font-medium">
                  {NAME.tr}
                </div>
                <button className="text-[#C9933A]/50 hover:text-[#C9933A]">
                  <Volume2 size={13} />
                </button>
              </div>

              {/* veiled meaning — tap to lift */}
              <button
                onClick={() => setRevealed(!revealed)}
                className="mt-4 min-h-[78px] w-full px-3 flex flex-col items-center justify-center"
              >
                {revealed ? (
                  <div className="text-center animate-in fade-in duration-500">
                    <div className="text-[#E8E6E1]/85 text-[14px] font-['Playfair_Display',serif] italic">
                      {NAME.mn}
                    </div>
                    <div className="text-[#E8E6E1]/45 text-[12px] mt-2 leading-relaxed font-['Playfair_Display',serif] italic max-w-[260px] mx-auto">
                      "{NAME.whisper}"
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-32 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#C9933A]/50 to-transparent" />
                    <div className="text-[#E8E6E1]/35 text-[10px] tracking-[0.3em] uppercase">
                      Recall · then lift the veil
                    </div>
                  </div>
                )}
              </button>
            </div>

            {/* footer actions in parchment */}
            <div className="px-7 pb-7 pt-3 border-t border-[#C9933A]/[0.08] flex items-center justify-between">
              <button className="flex items-center gap-2 text-[#E8E6E1]/45 hover:text-[#E8E6E1]/80 text-[11px] tracking-[0.18em] uppercase">
                <Bookmark size={12} /> Hold
              </button>
              <div className="text-[#E8E6E1]/30 text-[10px] tracking-[0.2em] uppercase">
                Tomorrow's star awaits
              </div>
              <button className="flex items-center gap-1.5 text-[#C9933A] hover:text-[#F4E4C0] text-[11px] tracking-[0.18em] uppercase font-semibold">
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
