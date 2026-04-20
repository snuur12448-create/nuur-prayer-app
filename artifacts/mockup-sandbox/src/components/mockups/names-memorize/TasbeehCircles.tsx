import React from 'react';
import { Volume2 } from 'lucide-react';

// Vertical misbaha (prayer beads) — 99 beads on a thread, one beadway per third.
const TOTAL = 99;
const CURRENT = 23;
const NAME = {
  n: 23,
  ar: "الرَّافِعُ",
  tr: "Ar-Rāfi'",
  mn: "The Exalter",
};

// We'll only render visible window of beads vertically — large bead at center is current.
// Show ~13 beads stacked on the thread, current in the middle.
const WINDOW = 13;
const HALF = Math.floor(WINDOW / 2);

export function TasbeehCircles() {
  // beads near current
  const beads = Array.from({ length: WINDOW }).map((_, idx) => {
    const beadIndex = CURRENT - HALF + idx; // 1-indexed
    return { beadIndex };
  });

  return (
    <div className="min-h-screen w-full bg-[#0F0E14] flex items-center justify-center font-sans">
      <div className="w-[390px] h-[844px] relative bg-[#0F0E14] flex flex-col overflow-hidden border border-white/[0.03]">
        {/* candle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-[#C9933A] opacity-[0.06] blur-[110px] rounded-full pointer-events-none" />

        {/* header */}
        <div className="pt-14 px-8 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-6 h-[1px] bg-gradient-to-r from-transparent to-[#C9933A]/40" />
            <span className="text-[#C9933A] text-[10px] tracking-[0.3em] uppercase font-bold">Misbaha</span>
          </div>
          <span className="text-[#E8E6E1]/40 text-[10px] tracking-[0.18em]">{CURRENT} / {TOTAL}</span>
        </div>

        {/* the misbaha + name */}
        <div className="flex-1 relative z-10 flex">
          {/* thread of beads on the left */}
          <div className="w-[110px] relative flex flex-col items-center justify-center">
            {/* gold thread */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-[#C9933A]/35 to-transparent" />

            {/* imam tassel at top */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-[#C9933A]/40" />
              <div className="w-[1px] h-3 bg-[#C9933A]/30" />
              <div className="w-2 h-6 rounded-b-full bg-gradient-to-b from-[#C9933A]/50 to-[#C9933A]/10" />
            </div>

            <div className="flex flex-col gap-[14px] items-center py-20">
              {beads.map(({ beadIndex }, i) => {
                const valid = beadIndex >= 1 && beadIndex <= TOTAL;
                if (!valid) return <div key={i} className="w-3 h-3 opacity-0" />;
                const done = beadIndex < CURRENT;
                const current = beadIndex === CURRENT;
                const distance = Math.abs(i - HALF);
                const size = current ? 18 : 11 - distance * 0.6;
                const isThirdMarker = beadIndex % 33 === 0;
                return (
                  <div key={i} className="relative" style={{ width: size, height: size }}>
                    <div
                      className="rounded-full"
                      style={{
                        width: size,
                        height: size,
                        background: current
                          ? 'radial-gradient(circle at 35% 30%, #F4E4C0, #C9933A 70%)'
                          : done
                          ? 'radial-gradient(circle at 35% 30%, #C9933A 0%, #6B4F1F 90%)'
                          : 'radial-gradient(circle at 35% 30%, #2A2635 0%, #15131C 90%)',
                        boxShadow: current
                          ? '0 0 18px rgba(244,228,192,0.6), 0 0 36px rgba(201,147,58,0.35), inset 0 1px 0 rgba(255,255,255,0.4)'
                          : 'inset 0 1px 0 rgba(255,255,255,0.05)',
                        border: isThirdMarker && !current ? '1px solid rgba(201,147,58,0.5)' : undefined,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* name as a flame on the right */}
          <button className="flex-1 flex flex-col items-center justify-center pr-8 active:scale-[0.98] transition-transform">
            <div className="text-[#C9933A]/55 text-[10px] tracking-[0.3em] uppercase font-bold mb-3">
              The {ordinal(CURRENT)}
            </div>

            <div
              className="text-[#C9933A] font-['Amiri',serif] text-[78px] leading-none text-center select-none"
              style={{ filter: 'drop-shadow(0 0 18px rgba(201,147,58,0.4))' }}
            >
              {NAME.ar}
            </div>

            <div className="my-6 w-20 h-[1px] bg-gradient-to-r from-transparent via-[#C9933A]/40 to-transparent" />

            <div className="flex items-baseline gap-2.5">
              <div className="text-[#E8E6E1] text-[22px] font-['Playfair_Display',serif] font-medium">
                {NAME.tr}
              </div>
              <Volume2 size={13} className="text-[#C9933A]/50" />
            </div>
            <div className="text-[#E8E6E1]/55 text-[12px] font-['Playfair_Display',serif] italic mt-1">
              {NAME.mn}
            </div>

            <div className="mt-12 text-[#E8E6E1]/35 text-[10px] tracking-[0.3em] uppercase">
              Tap · recite · advance
            </div>
          </button>
        </div>

        {/* footer */}
        <div className="px-8 pb-12 pt-4 relative z-10">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[#E8E6E1]/35 text-[10px] tracking-[0.25em] uppercase">First third</div>
              <div className="text-[#E8E6E1]/70 text-[14px] font-['Playfair_Display',serif] italic mt-1">
                Twenty-third of ninety-nine
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#E8E6E1]/35 text-[10px] tracking-[0.25em] uppercase">Up next</div>
              <div className="text-[#C9933A] font-['Amiri',serif] text-[18px] mt-1">الْمُعِزُّ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ordinal(n: number) {
  const names = [
    'first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth',
    'eleventh','twelfth','thirteenth','fourteenth','fifteenth','sixteenth','seventeenth','eighteenth','nineteenth','twentieth',
    'twenty-first','twenty-second','twenty-third','twenty-fourth','twenty-fifth',
  ];
  return names[n - 1] ?? `${n}th`;
}
