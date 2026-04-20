import React from 'react';
import { ChevronLeft, ChevronRight, Check, Flame, Volume2, BookOpen } from 'lucide-react';

const NAMES = [
  { n: 22, ar: "الْخَافِضُ", tr: "Al-Khāfid",  pr: "al-KHAA-fid",  mn: "The Abaser" },
  { n: 23, ar: "الرَّافِعُ", tr: "Ar-Rāfi'",   pr: "ar-raa-FEE'",  mn: "The Exalter",
    desc: "He who lifts the hearts, the believers, and the righteous in station and honour — quietly, when no one else can.",
    verse: "And We raise some of them above others in degrees.", ref: "Az-Zukhruf 43:32" },
  { n: 24, ar: "الْمُعِزُّ", tr: "Al-Mu'izz",  pr: "al-mu-IZZ",    mn: "The Honourer" },
];

export function OneADay() {
  const today = NAMES[1];

  return (
    <div className="min-h-screen w-full bg-[#0F0E14] flex items-center justify-center font-sans">
      <div className="w-[390px] h-[844px] relative bg-[#0F0E14] flex flex-col overflow-hidden border border-white/[0.03]">
        {/* candle glow */}
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-[#C9933A] opacity-[0.05] blur-[90px] rounded-full pointer-events-none" />

        {/* header */}
        <div className="pt-14 px-6 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center">
              <Flame size={14} className="text-[#C9933A]" />
            </div>
            <div className="leading-tight">
              <div className="text-white text-[13px] font-semibold">12 day streak</div>
              <div className="text-white/40 text-[10px] tracking-wider uppercase">Day 23 of 99</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[#C9933A] text-[10px] tracking-[0.18em] uppercase font-bold">Mon · 20 Apr</div>
            <div className="text-white/30 text-[10px] mt-0.5">3 Dhū al-Qa'dah</div>
          </div>
        </div>

        {/* progress dots — 99 in 11 rows */}
        <div className="px-6 mt-5 relative z-10">
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: 'repeat(33, minmax(0, 1fr))' }}>
            {Array.from({ length: 99 }).map((_, i) => (
              <div
                key={i}
                className={`h-[5px] rounded-full ${
                  i < 22 ? 'bg-[#C9933A]/60' : i === 22 ? 'bg-[#C9933A] shadow-[0_0_6px_rgba(201,147,58,0.8)]' : 'bg-white/[0.06]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* hero card */}
        <div className="flex-1 px-6 pt-8 flex flex-col relative z-10">
          <div className="text-center">
            <div className="text-[#C9933A]/70 text-[10px] tracking-[0.3em] uppercase font-bold mb-3">Today's Name</div>
            <div className="text-[#C9933A] font-['Amiri'] text-[64px] leading-none mb-4">{today.ar}</div>
            <div className="text-white text-2xl font-['Playfair_Display',serif] font-medium">{today.tr}</div>
            <div className="text-white/30 text-[11px] tracking-[0.15em] mt-1">{today.pr}</div>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9933A]/20 bg-[#C9933A]/[0.04]">
              <span className="text-[#C9933A] text-[12px] font-medium">{today.mn}</span>
            </div>
          </div>

          {/* reflection */}
          <div className="mt-7 p-5 rounded-2xl bg-white/[0.025] border border-white/[0.04]">
            <div className="text-white/70 text-[13px] leading-relaxed font-['Playfair_Display',serif] italic">
              "{today.desc}"
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-start gap-2">
              <BookOpen size={12} className="text-[#C9933A]/60 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-white/50 text-[12px] leading-snug">{today.verse}</div>
                <div className="text-white/30 text-[10px] mt-1 tracking-wide">— {today.ref}</div>
              </div>
            </div>
          </div>

          {/* listen + reflected */}
          <div className="mt-5 flex gap-3">
            <button className="flex-1 h-12 rounded-xl bg-white/[0.04] border border-white/[0.05] flex items-center justify-center gap-2 text-white/70 text-[13px] font-medium hover:bg-white/[0.07]">
              <Volume2 size={14} /> Listen
            </button>
            <button className="flex-1 h-12 rounded-xl bg-[#C9933A] text-[#0F0E14] flex items-center justify-center gap-2 text-[13px] font-bold shadow-[0_4px_20px_rgba(201,147,58,0.25)]">
              <Check size={15} strokeWidth={3} /> I reflected
            </button>
          </div>
        </div>

        {/* bottom prev/next chips */}
        <div className="px-6 pb-10 pt-5 flex items-center justify-between relative z-10">
          <button className="flex items-center gap-2 text-white/40 hover:text-white/70">
            <ChevronLeft size={14} />
            <div className="text-left leading-tight">
              <div className="text-[9px] uppercase tracking-wider">Yesterday</div>
              <div className="text-[12px] font-['Amiri']">{NAMES[0].ar}</div>
            </div>
          </button>
          <div className="w-1 h-1 rounded-full bg-[#C9933A]/40" />
          <button className="flex items-center gap-2 text-white/30">
            <div className="text-right leading-tight">
              <div className="text-[9px] uppercase tracking-wider">Tomorrow</div>
              <div className="text-[12px] font-['Amiri']">·····</div>
            </div>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
