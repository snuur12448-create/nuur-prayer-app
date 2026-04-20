import React from 'react';
import { Volume2 } from 'lucide-react';

const NAME = {
  n: 23,
  ar: "الرَّافِعُ",
  tr: "Ar-Rāfi'",
  pr: "ar-raa-FEE'",
  mn: "The Exalter",
  desc: "He who lifts what He wills — the hearts of believers, the stations of the righteous, the unseen ranks no eye can measure.",
  verse: "And We raised him to a high station.",
  ref: "Maryam · 19:57",
};

// progress through the 99 — 23/99 ≈ waxing crescent toward first quarter
const PROGRESS = NAME.n / 99;

export function OneADay() {
  // moon phase: render via an offset overlapping circle (terminator)
  const illum = PROGRESS; // 0..1
  // Position of the dark overlay circle to create a waxing crescent of given illumination
  const offset = (1 - illum * 2) * 80; // when illum=0.232 -> offset ≈ 42 (still crescent)

  return (
    <div className="min-h-screen w-full bg-[#0F0E14] flex items-center justify-center font-sans">
      <div className="w-[390px] h-[844px] relative bg-[#0F0E14] flex flex-col overflow-hidden border border-white/[0.03]">
        {/* candle glow behind the moon */}
        <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[360px] h-[360px] bg-[#C9933A] opacity-[0.08] blur-[100px] rounded-full pointer-events-none" />
        {/* faint stars */}
        <Stars />

        {/* whisper-quiet header */}
        <div className="pt-14 px-8 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-6 h-[1px] bg-gradient-to-r from-transparent to-[#C9933A]/40" />
            <span className="text-[#C9933A] text-[10px] tracking-[0.3em] uppercase font-bold">Tonight</span>
          </div>
          <div className="text-[#E8E6E1]/40 text-[10px] tracking-[0.18em]">3 Dhū al-Qa'dah</div>
        </div>

        {/* the moon — visualizes 23/99 as waxing phase */}
        <div className="relative z-10 mt-10 flex flex-col items-center">
          <div className="relative w-[170px] h-[170px]">
            {/* moon disc */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#F4E4C0] to-[#C9933A] shadow-[0_0_60px_rgba(201,147,58,0.35)]" />
            {/* dark terminator overlay — creates the crescent */}
            <div
              className="absolute inset-0 rounded-full bg-[#0F0E14]"
              style={{ transform: `translateX(-${offset}%)` }}
            />
            {/* re-mask the disc edge */}
            <div className="absolute inset-0 rounded-full ring-1 ring-[#C9933A]/30" />
          </div>
          <div className="mt-5 text-[#E8E6E1]/45 text-[10px] tracking-[0.3em] uppercase">
            Twenty-third of ninety-nine
          </div>
        </div>

        {/* name as calligraphic art */}
        <div className="flex-1 px-8 pt-10 flex flex-col items-center relative z-10">
          <div className="text-[#C9933A] font-['Amiri',serif] text-[80px] leading-none text-center select-none">
            {NAME.ar}
          </div>

          {/* hairline */}
          <div className="my-7 w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C9933A]/40 to-transparent" />

          <div className="flex items-baseline gap-2.5">
            <h1 className="text-[#E8E6E1] text-[26px] font-['Playfair_Display',serif] font-medium tracking-tight">
              {NAME.tr}
            </h1>
            <button className="text-[#C9933A]/50 hover:text-[#C9933A] transition-colors">
              <Volume2 size={14} />
            </button>
          </div>
          <div className="text-[#E8E6E1]/55 text-[13px] font-['Playfair_Display',serif] italic mt-1.5">
            {NAME.mn}
          </div>

          {/* meditation */}
          <p className="mt-9 text-center text-[#E8E6E1]/60 text-[13px] leading-[1.7] font-['Playfair_Display',serif] italic max-w-[290px]">
            {NAME.desc}
          </p>

          {/* verse — like a printed book */}
          <div className="mt-9 text-center">
            <p className="text-[#E8E6E1]/45 text-[12px] leading-relaxed font-['Playfair_Display',serif]">
              "{NAME.verse}"
            </p>
            <p className="text-[#C9933A]/55 text-[10px] tracking-[0.2em] mt-2.5 uppercase">{NAME.ref}</p>
          </div>
        </div>

        {/* single quiet ribbon at bottom */}
        <div className="pb-12 px-8 relative z-10">
          <button className="w-full h-12 rounded-full border border-[#C9933A]/20 bg-[#C9933A]/[0.04] text-[#C9933A] text-[12px] tracking-[0.25em] uppercase font-semibold hover:bg-[#C9933A]/[0.08] transition-colors">
            Carried tonight
          </button>
          <div className="text-center text-[#E8E6E1]/25 text-[10px] tracking-[0.18em] mt-3 uppercase">
            Yesterday · Al-Khāfid &nbsp;·&nbsp; Tomorrow waits
          </div>
        </div>
      </div>
    </div>
  );
}

function Stars() {
  const dots = [
    { x: 18, y: 12, s: 1, o: 0.5 },
    { x: 84, y: 18, s: 0.7, o: 0.35 },
    { x: 12, y: 32, s: 0.6, o: 0.3 },
    { x: 92, y: 38, s: 0.9, o: 0.45 },
    { x: 8,  y: 62, s: 0.5, o: 0.25 },
    { x: 88, y: 70, s: 0.8, o: 0.4 },
    { x: 22, y: 82, s: 0.6, o: 0.3 },
    { x: 78, y: 88, s: 0.7, o: 0.35 },
    { x: 50, y: 8,  s: 0.5, o: 0.3 },
    { x: 30, y: 22, s: 0.4, o: 0.2 },
    { x: 70, y: 28, s: 0.4, o: 0.2 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none">
      {dots.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-[#F4E4C0]"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: `${d.s * 2}px`,
            height: `${d.s * 2}px`,
            opacity: d.o,
            boxShadow: `0 0 ${d.s * 3}px rgba(244,228,192,0.6)`,
          }}
        />
      ))}
    </div>
  );
}
