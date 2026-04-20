import React, { useState } from 'react';
import { RotateCcw, X, Check, Volume2, ChevronUp } from 'lucide-react';

const CARD = {
  n: 23,
  ar: "الرَّافِعُ",
  tr: "Ar-Rāfi'",
  pr: "ar-raa-FEE'",
  mn: "The Exalter",
  desc: "The One who raises the believers and the righteous in station and honour. He lifts what He wills, and His exaltation is without end.",
};

export function Flashcard() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#0F0E14] flex items-center justify-center font-sans">
      <div className="w-[390px] h-[844px] relative bg-[#0F0E14] flex flex-col overflow-hidden border border-white/[0.03]">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#C9933A] opacity-[0.05] blur-[90px] rounded-full pointer-events-none" />

        {/* header */}
        <div className="pt-14 px-6 flex items-center justify-between relative z-10">
          <button className="text-white/50 hover:text-white"><X size={20} /></button>
          <div className="text-center">
            <div className="text-white/40 text-[10px] tracking-[0.2em] uppercase">Practice</div>
            <div className="text-white text-[13px] font-semibold mt-0.5">3 of 15 today</div>
          </div>
          <button className="text-white/50 hover:text-white"><RotateCcw size={18} /></button>
        </div>

        {/* progress */}
        <div className="px-6 mt-4 relative z-10">
          <div className="h-[3px] w-full rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#C9933A]/60 to-[#C9933A] rounded-full" style={{ width: '20%' }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-white/30">
            <span>2 known</span>
            <span className="text-[#C9933A]/70">Queue 12 · Review 3</span>
          </div>
        </div>

        {/* card */}
        <div className="flex-1 px-6 flex items-center justify-center relative z-10">
          <button
            onClick={() => setRevealed(!revealed)}
            className="w-full aspect-[5/7] rounded-[28px] bg-gradient-to-b from-[#1A1822] to-[#15131C] border border-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-6 relative overflow-hidden group"
          >
            {/* corner index */}
            <div className="absolute top-5 left-5 text-[#C9933A]/40 text-[11px] tracking-[0.2em] font-bold">#{CARD.n}</div>
            <div className="absolute top-5 right-5">
              <Volume2 size={14} className="text-white/30" />
            </div>

            {/* always: arabic */}
            <div className="text-[#C9933A] font-['Amiri'] text-[88px] leading-none">{CARD.ar}</div>

            {!revealed ? (
              <>
                <div className="mt-10 text-white/30 text-[11px] tracking-[0.25em] uppercase">Tap to reveal</div>
                <div className="mt-2 animate-pulse text-white/40">
                  <ChevronUp size={16} />
                </div>
              </>
            ) : (
              <div className="mt-6 w-full text-center animate-in fade-in duration-300">
                <div className="text-white text-[22px] font-['Playfair_Display',serif] font-medium">{CARD.tr}</div>
                <div className="text-white/30 text-[10px] tracking-[0.18em] mt-1">{CARD.pr}</div>
                <div className="mt-4 inline-block px-3 py-1 rounded-full border border-[#C9933A]/30 bg-[#C9933A]/[0.06]">
                  <span className="text-[#C9933A] text-[12px] font-semibold">{CARD.mn}</span>
                </div>
                <div className="mt-5 px-2 text-white/55 text-[12px] leading-relaxed font-['Playfair_Display',serif] italic">
                  {CARD.desc}
                </div>
              </div>
            )}

            {/* deck shadow */}
            <div className="absolute inset-x-3 -bottom-1.5 h-3 rounded-b-[28px] bg-[#1A1822] -z-10 opacity-70" />
            <div className="absolute inset-x-6 -bottom-3 h-3 rounded-b-[28px] bg-[#15131C] -z-20 opacity-50" />
          </button>
        </div>

        {/* grade buttons */}
        <div className="px-6 pb-12 pt-4 relative z-10">
          {revealed ? (
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <button className="flex-1 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] flex items-center justify-center gap-2 text-white/70 text-[13px] font-semibold">
                <RotateCcw size={14} /> Need review
              </button>
              <button className="flex-1 h-14 rounded-2xl bg-[#C9933A] text-[#0F0E14] flex items-center justify-center gap-2 text-[13px] font-bold shadow-[0_4px_20px_rgba(201,147,58,0.25)]">
                <Check size={15} strokeWidth={3} /> I know it
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-white/30 text-[11px] tracking-[0.15em] uppercase">
                Try to recall the meaning before flipping
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
