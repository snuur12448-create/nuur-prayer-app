import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Settings, ChevronRight } from 'lucide-react';

export default function Pulse() {
  const [count, setCount] = useState(7);
  const target = 33;
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleTap = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    // Only increment if not clicking a button
    if ((e.target as HTMLElement).closest('button')) return;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const newRipple = {
      id: Date.now(),
      x: clientX,
      y: clientY,
    };

    setRipples((prev) => [...prev, newRipple]);
    setCount((prev) => (prev < target ? prev + 1 : prev));

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1000);
  }, [target]);

  const handleReset = () => setCount(0);

  const progress = count / target;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div 
      className="relative flex flex-col items-center justify-between min-h-[100dvh] w-full overflow-hidden select-none touch-manipulation cursor-pointer"
      style={{ backgroundColor: '#07140B' }} // Deep emerald almost black
      onClick={handleTap}
      onTouchStart={handleTap}
    >
      <style>{`
        @keyframes subtlePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        @keyframes rippleExpand {
          0% { transform: scale(0); opacity: 0.5; }
          100% { transform: scale(4); opacity: 0; }
        }
        @keyframes countFadeIn {
          0% { opacity: 0.5; transform: translateY(2px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-subtle-pulse {
          animation: subtlePulse 4s ease-in-out infinite;
        }
        .ripple {
          animation: rippleExpand 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>

      {/* Ripples */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="ripple absolute w-32 h-32 bg-white/5 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}

      {/* Top Bar */}
      <div className="w-full flex justify-between items-center p-6 z-10">
        <button 
          onClick={handleReset}
          className="p-3 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 transition-colors active:scale-95"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
        <button className="p-3 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 transition-colors active:scale-95">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 pointer-events-none">
        
        {/* Pulsing Circle & Dhikr */}
        <div className="relative flex items-center justify-center w-[300px] h-[300px] mb-12">
          {/* Background subtle glow */}
          <div className="absolute inset-0 bg-[#0A1A0E] rounded-full shadow-[0_0_80px_rgba(212,160,23,0.05)] animate-subtle-pulse" />
          
          {/* Circular Progress */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            {/* Track */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              className="stroke-white/5"
              strokeWidth="2"
              fill="none"
            />
            {/* Fill */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              className="stroke-[#D4A017] transition-all duration-500 ease-out"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>

          {/* Dhikr Content */}
          <div className="relative flex flex-col items-center justify-center animate-subtle-pulse">
            <span className="font-['Amiri_Quran'] text-5xl text-white/90 leading-normal tracking-wide drop-shadow-sm mb-2 text-center">
              سُبْحَانَ اللَّهِ
            </span>
            <span className="text-white/40 text-sm tracking-[0.2em] uppercase font-light">
              SubhanAllah
            </span>
          </div>
        </div>

        {/* Counter */}
        <div className="flex flex-col items-center mt-4">
          <div className="flex items-baseline gap-2" key={count}>
            <span className="text-5xl font-light text-[#D4A017] tracking-tight tabular-nums" style={{ animation: 'countFadeIn 0.3s ease-out forwards' }}>
              {count}
            </span>
            <span className="text-2xl text-white/30 font-light">/</span>
            <span className="text-2xl text-white/30 font-light tabular-nums">{target}</span>
          </div>
        </div>
      </div>

      {/* Bottom Area / Next Dhikr */}
      <div className="w-full p-8 z-10 flex justify-center pb-12">
        <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/90 transition-all active:scale-95 text-sm tracking-wide font-medium">
          Next Dhikr
          <ChevronRight className="w-4 h-4 opacity-50" />
        </button>
      </div>

    </div>
  );
}
