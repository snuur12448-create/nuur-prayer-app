import React from 'react';
import { Search, ChevronRight, Play, Compass, Star, Bookmark } from 'lucide-react';

const BG = '#050B14';
const SURFACE = '#0A1220';
const BORDER = '#1A2438';
const GOLD = '#C9933A';
const GOLD_SOFT = '#A67C33';
const SILVER = '#CBD5E1';
const TEXT = '#F8FAFC';
const TEXT_DIM = '#94A3B8';

type Surah = { n: number; ar: string; en: string; meaning: string; verses: number; juz: number; type: 'M' | 'd' };

const SURAHS: Surah[] = [
  { n: 1, ar: 'ٱلْفَاتِحَة', en: 'Al-Fātiḥah', meaning: 'The Opening', verses: 7, juz: 1, type: 'M' },
  { n: 2, ar: 'ٱلْبَقَرَة', en: 'Al-Baqarah', meaning: 'The Cow', verses: 286, juz: 1, type: 'd' },
  { n: 3, ar: 'آلِ عِمْرَان', en: 'Āl ʿImrān', meaning: 'Family of Imran', verses: 200, juz: 3, type: 'd' },
  { n: 4, ar: 'ٱلنِّسَاء', en: 'An-Nisāʾ', meaning: 'The Women', verses: 176, juz: 4, type: 'd' },
  { n: 5, ar: 'ٱلْمَائِدَة', en: 'Al-Māʾidah', meaning: 'The Table', verses: 120, juz: 6, type: 'd' },
  { n: 6, ar: 'ٱلْأَنْعَام', en: 'Al-Anʿām', meaning: 'The Cattle', verses: 165, juz: 7, type: 'M' },
  { n: 7, ar: 'ٱلْأَعْرَاف', en: 'Al-Aʿrāf', meaning: 'The Heights', verses: 206, juz: 8, type: 'M' },
  { n: 8, ar: 'ٱلْأَنْفَال', en: 'Al-Anfāl', meaning: 'The Spoils of War', verses: 75, juz: 9, type: 'd' },
  { n: 9, ar: 'ٱلتَّوْبَة', en: 'At-Tawbah', meaning: 'The Repentance', verses: 129, juz: 10, type: 'd' },
  { n: 10, ar: 'يُونُس', en: 'Yūnus', meaning: 'Jonah', verses: 109, juz: 11, type: 'M' },
  { n: 11, ar: 'هُود', en: 'Hūd', meaning: 'Hud', verses: 123, juz: 11, type: 'M' },
  { n: 12, ar: 'يُوسُف', en: 'Yūsuf', meaning: 'Joseph', verses: 111, juz: 12, type: 'M' },
  { n: 18, ar: 'ٱلْكَهْف', en: 'Al-Kahf', meaning: 'The Cave', verses: 110, juz: 15, type: 'M' },
  { n: 36, ar: 'يس', en: 'Yā-Sīn', meaning: 'Ya Sin', verses: 83, juz: 22, type: 'M' },
  { n: 67, ar: 'ٱلْمُلْك', en: 'Al-Mulk', meaning: 'The Sovereignty', verses: 30, juz: 29, type: 'M' },
];

function StarSvg({ type, verses }: { type: 'M' | 'd'; verses: number }) {
  // Meccan = solid glowing star, Medinan = ringed star
  // Size scales with verse count: min 12px, max 24px
  const size = Math.max(12, Math.min(24, 10 + (verses / 286) * 14));
  
  if (type === 'M') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0 drop-shadow-[0_0_4px_rgba(201,147,58,0.8)]">
        <path d="M12 1L14.5 9.5L23 12L14.5 14.5L12 23L9.5 14.5L1 12L9.5 9.5L12 1Z" fill={GOLD} />
        <circle cx="12" cy="12" r="2" fill="#FFF" />
      </svg>
    );
  }
  
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0">
      <circle cx="12" cy="12" r="8" fill="none" stroke={SILVER} strokeWidth="1.5" />
      <path d="M12 4L13.5 9.5L19 12L13.5 14.5L12 20L10.5 14.5L5 12L10.5 9.5L12 4Z" fill={SILVER} />
    </svg>
  );
}

export default function Constellation() {
  return (
    <div 
      className="relative w-full h-[100dvh] max-h-[844px] max-w-[390px] mx-auto overflow-hidden font-sans"
      style={{ backgroundColor: BG, color: TEXT }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Amiri+Quran&family=Cinzel:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
        
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-amiri { font-family: 'Amiri', serif; }
        .font-quran { font-family: 'Amiri Quran', serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        
        .twinkle {
          animation: twinkle 4s ease-in-out infinite alternate;
        }
        .twinkle-delay-1 { animation-delay: 1s; }
        .twinkle-delay-2 { animation-delay: 2s; }
        
        @keyframes twinkle {
          0% { opacity: 0.3; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1.1); }
        }
      `}} />

      {/* Background stars */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg width="100%" height="400" xmlns="http://www.w3.org/2000/svg">
          <g fill={SILVER} opacity="0.5">
            <circle cx="40" cy="80" r="1" className="twinkle" />
            <circle cx="120" cy="40" r="1.5" className="twinkle twinkle-delay-1" />
            <circle cx="280" cy="90" r="1" className="twinkle twinkle-delay-2" />
            <circle cx="340" cy="150" r="2" fill={GOLD} className="twinkle" />
            <circle cx="90" cy="200" r="1.5" className="twinkle twinkle-delay-1" />
            <circle cx="220" cy="250" r="1" className="twinkle" />
            <circle cx="50" cy="300" r="1.5" className="twinkle twinkle-delay-2" />
            <circle cx="310" cy="320" r="1" className="twinkle" />
          </g>
          <g stroke="rgba(203, 213, 225, 0.15)" strokeWidth="0.5" fill="none">
            <path d="M120 40 L340 150 L280 90 Z" />
            <path d="M40 80 L120 40 L90 200 Z" />
          </g>
        </svg>
      </div>

      <div className="relative h-full overflow-y-auto font-inter">
        {/* Status bar */}
        <div className="flex justify-between items-center px-6 pt-3 pb-2 text-[11px]" style={{ color: TEXT_DIM }}>
          <span className="font-medium">9:41</span>
          <div className="flex gap-1 items-center">
            <span>•••</span>
            <span>􀙇</span>
          </div>
        </div>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="font-cinzel text-3xl font-semibold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
              Nuur
            </h1>
            <p className="font-cinzel text-[10px] uppercase tracking-[0.4em] mt-1" style={{ color: GOLD }}>
              The Starlit Path
            </p>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.05)', border: `1px solid ${BORDER}` }}>
            <Bookmark size={18} style={{ color: GOLD_SOFT }} />
          </div>
        </div>

        {/* Search */}
        <div className="px-6 pb-6">
          <div 
            className="flex items-center gap-3 rounded-full px-5 py-3 backdrop-blur-md"
            style={{ background: 'rgba(10, 18, 32, 0.6)', border: `1px solid rgba(201, 147, 58, 0.3)` }}
          >
            <Search size={16} style={{ color: GOLD_SOFT }} />
            <span className="text-[13px] font-cinzel tracking-wider" style={{ color: TEXT_DIM }}>
              Find a star…
            </span>
          </div>
        </div>

        {/* Continue Reading - Comet Card */}
        <div className="px-6 pb-6">
          <div 
            className="relative rounded-[24px] p-5 overflow-hidden group"
            style={{ 
              background: `linear-gradient(160deg, rgba(20, 30, 50, 0.8) 0%, rgba(5, 11, 20, 0.9) 100%)`,
              border: `1px solid rgba(201, 147, 58, 0.4)`,
              boxShadow: `0 8px 32px -8px rgba(201, 147, 58, 0.15)`
            }}
          >
            {/* Comet tail effect */}
            <div 
              className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none opacity-40 blur-2xl"
              style={{ background: GOLD }}
            />
            
            <div className="flex items-start justify-between relative z-10 mb-4">
              <div>
                <p className="font-cinzel text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: GOLD_SOFT }}>
                  Continue Journey
                </p>
                <div className="flex items-baseline gap-3">
                  <h2 className="font-cinzel text-xl font-bold text-white">Al-Baqarah</h2>
                  <span className="font-quran text-2xl" style={{ color: GOLD }}>ٱلْبَقَرَة</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md" style={{ background: 'rgba(201, 147, 58, 0.15)' }}>
                <Play size={16} fill={GOLD} strokeWidth={0} className="ml-1" />
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-center text-xs mb-2" style={{ color: SILVER }}>
                <span>Ayah 142 of 286</span>
                <span className="font-cinzel">49%</span>
              </div>
              <div className="h-[2px] w-full rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full relative" style={{ width: '49%', background: `linear-gradient(90deg, transparent, ${GOLD})` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_2px_rgba(201,147,58,0.8)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tonight's Reading Strip */}
        <div className="pb-6">
          <div className="px-6 flex items-center justify-between mb-4">
            <h3 className="font-cinzel text-xs uppercase tracking-widest text-white">Tonight's Sky</h3>
            <span className="text-[10px] uppercase tracking-wider" style={{ color: TEXT_DIM }}>Fri, Ramadan 12</span>
          </div>
          
          <div className="flex overflow-x-auto hide-scrollbar px-6 gap-3 pb-2" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <div 
              className="shrink-0 w-64 rounded-[20px] p-4 relative overflow-hidden"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[rgba(201,147,58,0.1)] to-transparent pointer-events-none" />
              <div className="flex items-center gap-2 mb-2">
                <Star size={12} fill={GOLD} strokeWidth={0} />
                <span className="font-cinzel text-[9px] uppercase tracking-widest" style={{ color: GOLD }}>Friday Sunnah</span>
              </div>
              <h4 className="font-cinzel text-base font-semibold text-white mb-0.5">Al-Kahf</h4>
              <p className="text-[11px]" style={{ color: TEXT_DIM }}>Light between two Fridays</p>
            </div>

            <div 
              className="shrink-0 w-48 rounded-[20px] p-4 relative overflow-hidden"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Compass size={12} style={{ color: SILVER }} />
                <span className="font-cinzel text-[9px] uppercase tracking-widest" style={{ color: SILVER }}>Before Sleep</span>
              </div>
              <h4 className="font-cinzel text-base font-semibold text-white mb-0.5">Al-Mulk</h4>
              <p className="text-[11px]" style={{ color: TEXT_DIM }}>Protection</p>
            </div>
          </div>
        </div>

        {/* Surah List / Constellation Map */}
        <div className="px-6 pb-24">
          <div className="flex items-center justify-between mb-4 border-b pb-4" style={{ borderColor: BORDER }}>
            <h3 className="font-cinzel text-xs uppercase tracking-widest text-white">The 114 Surahs</h3>
            <div className="flex gap-4">
              <span className="text-xs tracking-wider" style={{ color: GOLD }}>Juz 1</span>
              <span className="text-xs tracking-wider" style={{ color: TEXT_DIM }}>Hizb 1</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {SURAHS.map((s, i) => (
              <div 
                key={s.n}
                className="flex items-center gap-4 py-3 group cursor-pointer"
              >
                <div className="w-8 flex justify-center">
                  <StarSvg type={s.type} verses={s.verses} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-cinzel font-semibold text-[15px] text-white group-hover:text-[#C9933A] transition-colors">
                      {s.n}. {s.en}
                    </span>
                    <span className="font-quran text-[18px] text-white opacity-90">
                      {s.ar}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-amiri italic" style={{ color: TEXT_DIM }}>{s.meaning}</span>
                    <span style={{ color: BORDER }}>•</span>
                    <span style={{ color: SILVER }}>{s.verses} stars</span>
                    <span style={{ color: BORDER }}>•</span>
                    <span style={{ color: s.type === 'M' ? GOLD_SOFT : SILVER }}>
                      {s.type === 'M' ? 'Meccan' : 'Medinan'}
                    </span>
                  </div>
                </div>

                <ChevronRight size={14} style={{ color: BORDER }} className="group-hover:text-[#C9933A] transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Dock padding */}
        <div className="h-20" />
      </div>
      
      {/* Bottom fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: `linear-gradient(to top, ${BG}, transparent)` }}
      />
    </div>
  );
}
