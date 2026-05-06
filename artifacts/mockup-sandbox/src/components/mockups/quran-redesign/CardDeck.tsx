import React from 'react';
import { Search, Play, Bookmark, Moon, Sun, Sparkles } from 'lucide-react';

const BG = '#0B0B10';
const SURFACE = '#13131A';
const SURFACE_2 = '#1A1A24';
const GOLD = '#C9933A';
const GOLD_DIM = '#C9933A44';
const TEXT = '#F0F0F5';
const TEXT_DIM = '#8A8A99';

type Surah = {
  n: number;
  ar: string;
  en: string;
  meaning: string;
  verses: number;
  juz: number;
  type: 'M' | 'd';
};

const SURAHS: Surah[] = [
  { n: 1, ar: 'ٱلْفَاتِحَة', en: 'Al-Fātiḥah', meaning: 'The Opening', verses: 7, juz: 1, type: 'M' },
  { n: 2, ar: 'ٱلْبَقَرَة', en: 'Al-Baqarah', meaning: 'The Cow', verses: 286, juz: 1, type: 'd' },
  { n: 3, ar: 'آلِ عِمْرَان', en: 'Āl ʿImrān', meaning: 'Family of Imran', verses: 200, juz: 3, type: 'd' },
  { n: 4, ar: 'ٱلنِّسَاء', en: 'An-Nisāʾ', meaning: 'The Women', verses: 176, juz: 4, type: 'd' },
  { n: 5, ar: 'ٱلْمَائِدَة', en: 'Al-Māʾidah', meaning: 'The Table Spread', verses: 120, juz: 6, type: 'd' },
  { n: 6, ar: 'ٱلْأَنْعَام', en: 'Al-Anʿām', meaning: 'The Cattle', verses: 165, juz: 7, type: 'M' },
  { n: 7, ar: 'ٱلْأَعْرَاف', en: 'Al-Aʿrāf', meaning: 'The Heights', verses: 206, juz: 8, type: 'M' },
  { n: 8, ar: 'ٱلْأَنْفَال', en: 'Al-Anfāl', meaning: 'The Spoils of War', verses: 75, juz: 9, type: 'd' },
  { n: 9, ar: 'ٱلتَّوْبَة', en: 'At-Tawbah', meaning: 'The Repentance', verses: 129, juz: 10, type: 'd' },
  { n: 10, ar: 'يُونُس', en: 'Yūnus', meaning: 'Jonah', verses: 109, juz: 11, type: 'M' },
  { n: 11, ar: 'هُود', en: 'Hūd', meaning: 'Hud', verses: 123, juz: 11, type: 'M' },
  { n: 12, ar: 'يُوسُف', en: 'Yūsuf', meaning: 'Joseph', verses: 111, juz: 12, type: 'M' },
  { n: 13, ar: 'ٱلرَّعْد', en: 'Ar-Raʿd', meaning: 'The Thunder', verses: 43, juz: 13, type: 'd' },
  { n: 14, ar: 'إِبْرَاهِيم', en: 'Ibrāhīm', meaning: 'Abraham', verses: 52, juz: 13, type: 'M' },
  { n: 18, ar: 'ٱلْكَهْف', en: 'Al-Kahf', meaning: 'The Cave', verses: 110, juz: 15, type: 'M' },
  { n: 36, ar: 'يس', en: 'Yā-Sīn', meaning: 'Ya Sin', verses: 83, juz: 22, type: 'M' },
  { n: 67, ar: 'ٱلْمُلْك', en: 'Al-Mulk', meaning: 'The Sovereignty', verses: 30, juz: 29, type: 'M' },
];

export function CardDeck() {
  return (
    <div
      className="relative w-full h-[100dvh] max-h-[844px] max-w-[390px] mx-auto overflow-hidden font-sans"
      style={{ background: BG, color: TEXT }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Amiri:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap');
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* Status bar */}
      <div className="flex justify-between items-center px-6 pt-3 pb-2 text-[11px]" style={{ color: TEXT_DIM, zIndex: 10, position: 'relative' }}>
        <span className="font-medium">9:41</span>
        <div className="flex gap-1 items-center"><span>•••</span><span>􀙇</span></div>
      </div>

      <div className="h-full overflow-y-auto no-scrollbar pb-24">
        {/* Header */}
        <div className="px-5 pt-3 pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-[24px] font-bold tracking-tight">Quran</h1>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: SURFACE }}>
              <Bookmark size={16} color={TEXT_DIM} />
            </div>
          </div>
        </div>

        {/* Card Deck (horizontal scroll snapping) */}
        <div className="px-5 pb-6">
          <div className="relative w-full h-[220px]">
            {/* Background card (Daily Verse) */}
            <div
              className="absolute top-4 left-4 right-4 h-[190px] rounded-3xl p-4 overflow-hidden"
              style={{ background: SURFACE_2, transform: 'rotate(4deg) scale(0.95)', opacity: 0.85, border: `1px solid ${GOLD}33` }}
            >
              <div className="text-[9px] uppercase tracking-[0.25em] font-semibold" style={{ color: GOLD, opacity: 0.7 }}>Daily Verse</div>
              <div className="font-['Amiri_Quran'] text-[14px] leading-snug mt-2 text-right" dir="rtl" style={{ color: TEXT, opacity: 0.55 }}>
                وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا
              </div>
            </div>
            {/* Background card (Today's Rec) */}
            <div
              className="absolute top-2 left-2 right-2 h-[200px] rounded-3xl p-4 overflow-hidden"
              style={{ background: SURFACE, transform: 'rotate(-2deg) scale(0.98)', opacity: 0.95, border: `1px solid ${GOLD}55` }}
            >
              <div className="text-[10px] uppercase tracking-[0.25em] font-semibold" style={{ color: GOLD }}>For Today · Friday</div>
              <div className="font-['Amiri_Quran'] text-[26px] mt-1" style={{ color: TEXT }}>ٱلْكَهْف</div>
              <div className="text-[12px]" style={{ color: TEXT_DIM }}>Al-Kahf · The Cave · 110 ayat</div>
            </div>
            
            {/* Foreground card (Continue Reading) */}
            <div 
              className="absolute inset-0 rounded-3xl p-5 overflow-hidden flex flex-col justify-between"
              style={{ 
                background: `linear-gradient(135deg, ${SURFACE_2} 0%, ${BG} 100%)`,
                border: `1px solid ${GOLD}66`,
                boxShadow: `0 10px 30px -10px ${GOLD}33`,
              }}
            >
              <div 
                className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full opacity-20 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)` }}
              />
              
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-1" style={{ color: GOLD }}>
                    Continue Reading
                  </div>
                  <h2 className="text-[22px] font-bold mb-0.5">Al-Baqarah</h2>
                  <p className="text-[13px]" style={{ color: TEXT_DIM }}>Ayah 142 of 286</p>
                </div>
                
                {/* Circular Progress + Surah Num */}
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="absolute inset-0 transform -rotate-90">
                    <circle cx="18" cy="18" r="16" fill="none" stroke={GOLD_DIM} strokeWidth="3" />
                    <circle 
                      cx="18" cy="18" r="16" 
                      fill="none" stroke={GOLD} strokeWidth="3" 
                      strokeDasharray="100.5" strokeDashoffset="51" /* ~49% */
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="font-['Amiri_Quran'] text-[18px]">٢</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium">49%</span>
                  <span className="text-[12px]" style={{ color: TEXT_DIM }}>· ~45 min left</span>
                </div>
                
                <button 
                  className="h-10 px-5 rounded-full flex items-center gap-2 font-semibold text-[13px]"
                  style={{ background: GOLD, color: BG }}
                >
                  <Play size={14} fill={BG} strokeWidth={0} />
                  Resume
                </button>
              </div>
            </div>
          </div>
          
          {/* Card pagination dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            <div className="w-4 h-1.5 rounded-full" style={{ background: GOLD }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: SURFACE_2 }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: SURFACE_2 }} />
          </div>
        </div>

        {/* Segmented Control */}
        <div className="px-5 mb-5">
          <div className="flex p-1 rounded-xl" style={{ background: SURFACE }}>
            <div className="flex-1 py-1.5 rounded-lg text-center text-[13px] font-semibold" style={{ background: SURFACE_2, color: TEXT, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              Surah
            </div>
            <div className="flex-1 py-1.5 rounded-lg text-center text-[13px] font-medium" style={{ color: TEXT_DIM }}>
              Juz
            </div>
            <div className="flex-1 py-1.5 rounded-lg text-center text-[13px] font-medium" style={{ color: TEXT_DIM }}>
              Hizb
            </div>
          </div>
        </div>

        {/* Compact Grid */}
        <div className="px-5">
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold" style={{ color: TEXT_DIM }}>All 114 Surahs</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {SURAHS.map((s) => (
              <div 
                key={s.n}
                className="relative rounded-2xl p-3 flex flex-col justify-between aspect-[1.2/1]"
                style={{ background: SURFACE, border: `1px solid ${SURFACE_2}` }}
              >
                {/* Number Badge */}
                <div 
                  className="absolute top-3 left-3 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
                  style={{ background: `${GOLD}1A`, color: GOLD }}
                >
                  {s.n}
                </div>
                
                {/* Meccan/Medinan dot */}
                <div className="absolute top-4 right-3 w-1.5 h-1.5 rounded-full" style={{ background: s.type === 'M' ? GOLD : TEXT_DIM, opacity: 0.6 }} />
                
                {/* Arabic Name */}
                <div className="mt-1 text-center font-['Amiri_Quran'] text-[24px] leading-tight" style={{ color: TEXT, textShadow: `0 2px 10px ${GOLD}22` }}>
                  {s.ar}
                </div>
                
                {/* English Name, Meaning & Verses */}
                <div className="text-center mt-auto">
                  <div className="text-[13px] font-semibold leading-tight">{s.en}</div>
                  <div className="text-[9px] italic mt-0.5 truncate" style={{ color: TEXT_DIM, opacity: 0.85 }}>{s.meaning}</div>
                  <div className="text-[9px] mt-1 flex items-center justify-center gap-1.5" style={{ color: TEXT_DIM }}>
                    <span>{s.verses} ayat</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>Juz {s.juz}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Search Pill */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px]">
        <div 
          className="h-14 rounded-full flex items-center px-5 gap-3 backdrop-blur-md"
          style={{ 
            background: `${SURFACE}CC`, 
            border: `1px solid ${GOLD}33`,
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
          }}
        >
          <Search size={18} color={GOLD} />
          <span className="text-[14px]" style={{ color: TEXT_DIM }}>Search surah, verse, or topic...</span>
        </div>
      </div>
      
    </div>
  );
}

export default CardDeck;