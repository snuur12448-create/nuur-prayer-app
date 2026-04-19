import React, { useState, useCallback, useEffect } from 'react';
import { RotateCcw, Settings, Check } from 'lucide-react';

export default function Manuscript() {
  const [count, setCount] = useState(7);
  const target = 33;
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTap = useCallback(() => {
    if (count < target) {
      setCount((c) => c + 1);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
  }, [count, target]);

  const reset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCount(0);
  };

  const isComplete = count >= target;

  return (
    <div 
      className="relative flex flex-col w-full h-[100dvh] max-h-[844px] max-w-[390px] mx-auto bg-[#0B1510] text-[#E8EAE6] overflow-hidden select-none font-sans"
      onClick={handleTap}
    >
      <style>{`
        @keyframes manuscript-shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .calligraphy-shimmer {
          background: linear-gradient(90deg, #D4AF37 0%, #FFFAEB 30%, #D4AF37 60%);
          background-size: 300% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: manuscript-shimmer 0.6s ease-out;
        }
        .calligraphy-idle {
          color: #D4AF37;
          text-shadow: 0 4px 24px rgba(212, 175, 55, 0.15);
        }
      `}</style>

      {/* Decorative Frame */}
      <div className="absolute inset-4 border border-[#D4AF37]/20 pointer-events-none z-0" />
      
      {/* Corner Brackets */}
      <svg className="absolute top-4 left-4 w-6 h-6 pointer-events-none z-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 24V0H24" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.4"/>
        <circle cx="2" cy="2" r="1.5" fill="#D4AF37" fillOpacity="0.8"/>
      </svg>
      <svg className="absolute top-4 right-4 w-6 h-6 pointer-events-none z-0" style={{ transform: 'scaleX(-1)' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 24V0H24" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.4"/>
        <circle cx="2" cy="2" r="1.5" fill="#D4AF37" fillOpacity="0.8"/>
      </svg>
      <svg className="absolute bottom-4 left-4 w-6 h-6 pointer-events-none z-0" style={{ transform: 'scaleY(-1)' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 24V0H24" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.4"/>
        <circle cx="2" cy="2" r="1.5" fill="#D4AF37" fillOpacity="0.8"/>
      </svg>
      <svg className="absolute bottom-4 right-4 w-6 h-6 pointer-events-none z-0" style={{ transform: 'scale(-1, -1)' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 24V0H24" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.4"/>
        <circle cx="2" cy="2" r="1.5" fill="#D4AF37" fillOpacity="0.8"/>
      </svg>

      {/* Header */}
      <div className="flex justify-between items-start p-8 relative z-10">
        <div className="flex flex-col gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); /* next dhikr logic */ }}
            className="w-10 h-10 rounded-full border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]/70 hover:bg-[#D4AF37]/10 transition-colors"
          >
            <Settings size={18} strokeWidth={1.5} />
          </button>
          <button 
            onClick={reset}
            className="w-10 h-10 rounded-full border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]/70 hover:bg-[#D4AF37]/10 transition-colors"
          >
            <RotateCcw size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Medallion */}
        <div className={\`w-16 h-16 rounded-full border border-[#D4AF37] flex flex-col items-center justify-center transition-all duration-500 \${isComplete ? 'bg-[#D4AF37] text-[#0B1510] shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-[#0B1510] text-[#D4AF37]'}\`}>
          <span className="text-sm font-medium opacity-80 leading-tight">
            {count}
          </span>
          <div className={\`w-6 h-[1px] my-0.5 \${isComplete ? 'bg-[#0B1510]/30' : 'bg-[#D4AF37]/30'}\`} />
          <span className="text-xs font-medium opacity-60 leading-tight">
            {target}
          </span>
        </div>
      </div>

      {/* Main Calligraphy Area */}
      <div className="flex-grow flex flex-col items-center justify-center px-6 relative z-0 mt-[-40px]">
        <div className="relative w-full text-center">
          <h1 
            dir="rtl"
            className={\`font-['Amiri_Quran'] text-[80px] leading-[1.4] pb-4 \${isAnimating ? 'calligraphy-shimmer' : 'calligraphy-idle'} transition-colors duration-300\`}
            style={{ textShadow: isAnimating ? 'none' : '0 4px 24px rgba(212, 175, 55, 0.15)' }}
          >
            سُبْحَانَ اللَّهِ
          </h1>
        </div>

        {/* Decorative Divider */}
        <div className="my-8 opacity-70">
          <svg width="240" height="12" viewBox="0 0 240 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="6" cy="6" r="2" fill="#D4AF37" fillOpacity="0.6"/>
            <line x1="16" y1="6" x2="110" y2="6" stroke="#D4AF37" strokeOpacity="0.3"/>
            <path d="M120 3L123 6L120 9L117 6L120 3Z" fill="#D4AF37" fillOpacity="0.9"/>
            <line x1="130" y1="6" x2="224" y2="6" stroke="#D4AF37" strokeOpacity="0.3"/>
            <circle cx="234" cy="6" r="2" fill="#D4AF37" fillOpacity="0.6"/>
          </svg>
        </div>

        {/* Translations */}
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-[#E8EAE6]/90 font-serif italic text-lg tracking-wide">
            SubhanAllah
          </p>
          <p className="text-[#E8EAE6]/50 text-sm font-light uppercase tracking-[0.2em]">
            Glory be to Allah
          </p>
        </div>

        {/* Completion Ornament */}
        <div className={\`mt-12 flex flex-col items-center transition-all duration-700 \${isComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}\`}>
          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-2">
            <Check size={16} className="text-[#D4AF37]" strokeWidth={2} />
          </div>
          <span className="text-[#D4AF37] text-xs uppercase tracking-[0.15em] font-medium opacity-80">
            Tasbeeh Complete
          </span>
        </div>
      </div>
      
      {/* Invisible Tap Target ensures entire bottom area is clickable easily */}
      <div className="absolute inset-0 z-[-1]" />
    </div>
  );
}
