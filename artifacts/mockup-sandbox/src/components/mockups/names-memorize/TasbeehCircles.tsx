import React from 'react';
import { Pause, RotateCcw, Vibrate } from 'lucide-react';

const CURRENT = 23;
const NAME = { n: 23, ar: "الرَّافِعُ", tr: "Ar-Rāfi'", mn: "The Exalter" };

export function TasbeehCircles() {
  // 99 beads arranged on a single ring; we'll render two concentric rings for a tasbeeh feel.
  const OUTER = 33;
  const MIDDLE = 33;
  const INNER = 33;

  function ring(count: number, radius: number, completedTo: number, offset = 0) {
    return Array.from({ length: count }).map((_, i) => {
      const idx = i + offset;
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = 50 + Math.cos(angle) * radius;
      const y = 50 + Math.sin(angle) * radius;
      const done = idx < completedTo;
      const current = idx === completedTo;
      return (
        <circle
          key={`${radius}-${i}`}
          cx={x}
          cy={y}
          r={current ? 1.6 : 1.0}
          className={
            current
              ? 'fill-[#C9933A]'
              : done
              ? 'fill-[#C9933A]/55'
              : 'fill-white/15'
          }
          style={current ? { filter: 'drop-shadow(0 0 2px rgba(201,147,58,0.9))' } : undefined}
        />
      );
    });
  }

  // global completion progress mapping
  const completed = CURRENT - 1; // 22 done, 23rd is current

  return (
    <div className="min-h-screen w-full bg-[#0F0E14] flex items-center justify-center font-sans">
      <div className="w-[390px] h-[844px] relative bg-[#0F0E14] flex flex-col overflow-hidden border border-white/[0.03]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] bg-[#C9933A] opacity-[0.06] blur-[100px] rounded-full pointer-events-none" />

        {/* header */}
        <div className="pt-14 px-6 flex items-center justify-between relative z-10">
          <button className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.05] flex items-center justify-center text-white/60">
            <Pause size={14} />
          </button>
          <div className="text-center">
            <div className="text-[#C9933A] text-[10px] tracking-[0.25em] uppercase font-bold">Loop</div>
            <div className="text-white text-[13px] font-semibold mt-0.5">{CURRENT} / 99</div>
          </div>
          <button className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.05] flex items-center justify-center text-white/60">
            <Vibrate size={14} />
          </button>
        </div>

        {/* tasbeeh ring + center */}
        <div className="flex-1 flex items-center justify-center relative z-10">
          <button className="relative w-[330px] h-[330px] rounded-full flex items-center justify-center group active:scale-[0.98] transition-transform">
            {/* SVG rings */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              {/* faint guide rings */}
              <circle cx="50" cy="50" r="46" className="fill-none stroke-white/[0.04]" strokeWidth="0.2" />
              <circle cx="50" cy="50" r="40" className="fill-none stroke-white/[0.03]" strokeWidth="0.2" />
              <circle cx="50" cy="50" r="34" className="fill-none stroke-white/[0.03]" strokeWidth="0.2" />

              {/* progress arc on outer */}
              <circle
                cx="50" cy="50" r="46"
                className="fill-none stroke-[#C9933A]/60"
                strokeWidth="0.6"
                strokeDasharray={`${(completed / 99) * 2 * Math.PI * 46} ${2 * Math.PI * 46}`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />

              {ring(OUTER, 46, completed, 0)}
              {ring(MIDDLE, 40, completed, OUTER)}
              {ring(INNER, 34, completed, OUTER + MIDDLE)}
            </svg>

            {/* inner disc */}
            <div className="relative w-[210px] h-[210px] rounded-full bg-gradient-to-b from-[#1A1822] to-[#15131C] border border-[#C9933A]/15 shadow-[inset_0_2px_20px_rgba(201,147,58,0.06),0_10px_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center">
              <div className="text-[#C9933A]/50 text-[9px] tracking-[0.3em] uppercase font-bold mb-1">#{NAME.n}</div>
              <div className="text-[#C9933A] font-['Amiri'] text-[58px] leading-none">{NAME.ar}</div>
              <div className="mt-3 text-white text-[15px] font-['Playfair_Display',serif] font-medium">{NAME.tr}</div>
              <div className="text-white/40 text-[11px] mt-0.5">{NAME.mn}</div>
            </div>
          </button>
        </div>

        {/* footer */}
        <div className="px-6 pb-12 relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="text-left">
              <div className="text-white/40 text-[10px] tracking-[0.2em] uppercase">Ring</div>
              <div className="text-white text-[13px] font-semibold mt-0.5">1 of 3 · 22 done</div>
            </div>
            <button className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-[12px]">
              <RotateCcw size={12} /> Restart
            </button>
          </div>
          <div className="text-center text-white/30 text-[11px] tracking-[0.18em] uppercase">
            Tap the bead — recite once, advance
          </div>
        </div>
      </div>
    </div>
  );
}
