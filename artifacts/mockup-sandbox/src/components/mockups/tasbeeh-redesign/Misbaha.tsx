import React, { useState, useEffect, useRef } from "react";
import { Settings2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// 33 beads per cycle
const TARGET = 33;
const TOTAL_BEADS = TARGET * 3; // Render a few cycles for visual continuity

export function Misbaha() {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const cycleCount = Math.floor(count / TARGET);
  const currentInCycle = count % TARGET;

  const handleTap = () => {
    // Add haptic feedback if supported (web API)
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    setCount((c) => c + 1);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 150);
  };

  const reset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCount(0);
  };

  const openSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    // No-op for mockup
  };

  // Render beads
  // We'll place them in a vertical column, and translate the column up as count increases.
  const BEAD_SPACING = 36;
  
  // Calculate offset so the current bead is always in the center
  const yOffset = -(count * BEAD_SPACING);

  return (
    <div 
      className="relative w-full min-h-screen bg-[#0A1A0E] text-slate-200 overflow-hidden flex flex-col font-sans select-none"
      onClick={handleTap}
    >
      {/* Top Header / Info Area */}
      <div className="z-20 pt-16 px-6 flex flex-col items-center pointer-events-none">
        <h1 className="font-['Amiri_Quran'] text-5xl text-white mb-2 leading-relaxed text-center drop-shadow-lg">
          سُبْحَانَ اللَّهِ
        </h1>
        <p className="text-[#D4A017] tracking-widest text-sm uppercase opacity-90 mb-1">
          SubhanAllah
        </p>
        <p className="text-white/60 text-xs">Glory be to Allah</p>
      </div>

      {/* Misbaha Bead String */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        
        {/* Glow behind the active bead */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#D4A017]/20 blur-3xl rounded-full mix-blend-screen" />
        
        {/* The String (vertical line) */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-transparent via-[#D4A017]/20 to-transparent" />

        {/* Beads Container */}
        <div 
          className="relative transition-transform duration-300 ease-out flex flex-col items-center"
          style={{ 
            transform: `translateY(${yOffset}px)`,
            paddingTop: '50vh', // Start first bead at center
            paddingBottom: '50vh', // Pad end
          }}
        >
          {Array.from({ length: TOTAL_BEADS }).map((_, i) => {
            const isCompleted = i < count;
            const isActive = i === count;
            const isMarker = (i + 1) % TARGET === 0;

            let sizeClass = "w-6 h-6"; // normal bead
            if (isMarker) sizeClass = "w-8 h-8"; // marker bead every 33
            if (isActive) sizeClass = isMarker ? "w-10 h-10" : "w-8 h-8";

            return (
              <div 
                key={i}
                className={cn(
                  "relative flex items-center justify-center rounded-full transition-all duration-300 z-10",
                  sizeClass,
                  "my-[4px]" // spacing matches BEAD_SPACING (size + margin approx)
                )}
                style={{ height: 28 }} // Fixed height cell for consistent translation
              >
                <div 
                  className={cn(
                    "rounded-full transition-all duration-300 shadow-lg",
                    isCompleted ? "bg-[#D4A017] shadow-[#D4A017]/40" : "bg-[#1A2F22] border border-[#2A4232]",
                    isActive && "scale-125 bg-gradient-to-b from-[#F5D061] to-[#D4A017] shadow-[0_0_20px_rgba(212,160,23,0.4)] border-none ring-2 ring-[#0A1A0E] ring-offset-2 ring-offset-[#D4A017]",
                    isMarker && !isActive && !isCompleted && "bg-[#2A4232] border-[#D4A017]/30",
                    isMarker && "rotate-45 rounded-sm" // Give marker beads a slight diamond shape for distinction
                  )}
                  style={{
                    width: isActive ? (isMarker ? 32 : 28) : (isMarker ? 24 : 16),
                    height: isActive ? (isMarker ? 32 : 28) : (isMarker ? 24 : 16),
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Area - Controls & Count */}
      <div className="mt-auto z-20 pb-12 px-8 flex justify-between items-end pointer-events-none">
        
        {/* Reset Button */}
        <button 
          onClick={reset}
          className="pointer-events-auto w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Counter Display */}
        <div className="flex flex-col items-center justify-center bg-[#0A1A0E]/60 backdrop-blur-xl border border-white/5 rounded-3xl py-4 px-8 shadow-2xl">
          <div className="flex items-baseline space-x-1">
            <span className={cn(
              "text-5xl font-light tabular-nums tracking-tighter transition-all duration-150 text-white",
              isAnimating && "scale-110 text-[#D4A017]"
            )}>
              {currentInCycle}
            </span>
            <span className="text-xl text-white/40 tabular-nums">/{TARGET}</span>
          </div>
          {cycleCount > 0 && (
            <div className="text-[#D4A017] text-xs font-medium tracking-wider uppercase mt-1">
              {cycleCount} {cycleCount === 1 ? 'Cycle' : 'Cycles'}
            </div>
          )}
        </div>

        {/* Next/Settings Button */}
        <button 
          onClick={openSettings}
          className="pointer-events-auto w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md"
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      {/* Interaction overlay to make it clear the whole screen is tappable */}
      <div 
        className={cn(
          "absolute inset-0 bg-[#D4A017]/5 pointer-events-none transition-opacity duration-300",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}

export default Misbaha;
