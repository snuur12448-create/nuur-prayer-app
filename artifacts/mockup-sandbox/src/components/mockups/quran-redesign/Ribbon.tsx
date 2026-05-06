import React from 'react';
import { Search, Bookmark, ChevronRight } from 'lucide-react';

const BG = '#F4EFE4';
const TEXT = '#2A251D';
const TEXT_LIGHT = '#6E6658';
const GOLD = '#B8860B';
const BORDER = '#E3DBC7';

type Surah = { n: number; ar: string; en: string; meaning: string; verses: number; juz: number; type: 'M' | 'd' };

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
  { n: 15, ar: 'ٱلْحِجْر', en: 'Al-Ḥijr', meaning: 'The Rocky Tract', verses: 99, juz: 14, type: 'M' },
];

const MAX_VERSES = 286;

export default function Ribbon() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Amiri:ital,wght@0,400;0,700;1,400&family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
        
        .font-quran { font-family: 'Amiri Quran', serif; }
        .font-serif-en { font-family: 'Instrument Serif', serif; }
        .font-sans-en { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>
      <div 
        className="relative w-full h-[100dvh] max-h-[844px] max-w-[390px] mx-auto overflow-hidden font-sans-en"
        style={{ backgroundColor: BG, color: TEXT }}
      >
        {/* Noise overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.2] mix-blend-multiply"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, #8a6f3a 0.5px, transparent 1px), radial-gradient(circle at 70% 60%, #8a6f3a 0.5px, transparent 1px)',
            backgroundSize: '8px 8px, 12px 12px',
          }}
        />

        {/* Top pinned folded bookmark ribbon */}
        <div className="absolute top-0 left-6 z-20" style={{ width: '80px' }}>
          <div className="relative pt-12 pb-6 px-3 flex flex-col items-center shadow-lg" style={{ backgroundColor: GOLD }}>
            {/* Bookmark fold geometry on top - using absolute borders to simulate a ribbon folded over */}
            <div className="absolute top-0 left-0 w-full h-2 bg-[#966d08] opacity-80" />
            
            <Bookmark size={14} color={BG} fill={BG} className="mb-2" />
            <span className="font-serif-en italic text-[12px] leading-tight text-center" style={{ color: BG }}>
              Continue
            </span>
            <span className="font-bold text-[14px] leading-tight text-center mt-1 uppercase tracking-widest" style={{ color: BG }}>
              AL-BAQARAH
            </span>
            <span className="text-[10px] mt-1 mb-3" style={{ color: `${BG}cc` }}>
              97 / 286
            </span>
            {/* Slim progress bar inside ribbon */}
            <div className="w-full h-[2px] rounded-full overflow-hidden" style={{ backgroundColor: `${BG}44` }}>
              <div className="h-full rounded-full" style={{ width: '34%', backgroundColor: BG }} />
            </div>

            {/* Bottom ribbon cut */}
            <div 
              className="absolute -bottom-4 left-0 w-full h-4" 
              style={{
                background: `linear-gradient(to bottom right, ${GOLD} 50%, transparent 50%) top left / 50% 100% no-repeat,
                             linear-gradient(to bottom left, ${GOLD} 50%, transparent 50%) top right / 50% 100% no-repeat`
              }}
            />
          </div>
        </div>

        {/* Status bar */}
        <div className="relative z-10 flex justify-between items-center px-6 pt-3 pb-2 text-[11px]" style={{ color: TEXT_LIGHT }}>
          <span className="font-medium">9:41</span>
          <div className="flex gap-1 items-center">
            <span>•••</span>
            <span>􀙇</span>
          </div>
        </div>

        {/* Right edge juz rail */}
        <div className="absolute right-1 top-32 bottom-20 w-6 flex flex-col items-center justify-between z-10 py-4 opacity-50">
          {[1, 5, 10, 15, 20, 25, 30].map(j => (
            <div key={j} className="text-[9px] font-bold" style={{ color: j === 1 ? GOLD : TEXT_LIGHT }}>
              {j}
            </div>
          ))}
        </div>

        <div className="relative h-full overflow-y-auto pl-8 pr-10 pb-32 pt-28 no-scrollbar">
          {/* Header */}
          <div className="mb-8 flex justify-end">
            <h1 className="font-quran text-[42px] leading-none text-right" style={{ color: TEXT }}>
              ٱلْقُرْآن
            </h1>
          </div>

          {/* Today's recommendation editorial pull-quote */}
          <div className="mb-12 border-l border-t-0 border-r-0 border-b-0 pl-4 py-1" style={{ borderColor: GOLD }}>
            <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: GOLD }}>For Today</p>
            <p className="font-serif-en italic text-[24px] leading-snug" style={{ color: TEXT }}>
              "Read Surah Al-Kahf on Friday, for it is a light between the two Fridays."
            </p>
            <div className="flex justify-between items-end mt-4">
              <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: TEXT_LIGHT }}>AL-KAHF · 18</span>
              <span className="font-quran text-[22px] leading-none" style={{ color: TEXT }}>ٱلْكَهْف</span>
            </div>
          </div>

          {/* Search */}
          <div className="mb-10 border-b pb-2 flex items-center gap-3" style={{ borderColor: BORDER }}>
            <Search size={16} color={TEXT_LIGHT} />
            <span className="text-[12px] uppercase tracking-widest" style={{ color: TEXT_LIGHT }}>Search 114 Surahs</span>
          </div>

          {/* Ribbon Index */}
          <div className="flex flex-col">
            {SURAHS.map((s, idx) => {
              const dotsCount = Math.max(1, Math.floor((s.verses / MAX_VERSES) * 30));
              const dots = Array(dotsCount).fill('·').join('');
              
              return (
                <div key={s.n} className="group relative flex items-center justify-between py-6 border-b" style={{ borderColor: BORDER }}>
                  {/* Left section: Info */}
                  <div className="flex flex-col w-[60%]">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-bold" style={{ color: GOLD }}>{s.n.toString().padStart(3, '0')}</span>
                      <h2 className="text-[14px] uppercase tracking-[0.25em] font-bold leading-none" style={{ color: TEXT }}>
                        {s.en}
                      </h2>
                    </div>
                    
                    <div className="flex items-center gap-3 pl-8">
                      <span className="font-serif-en italic text-[16px] leading-none" style={{ color: TEXT_LIGHT }}>
                        {s.meaning}
                      </span>
                    </div>

                    {/* Verse meter */}
                    <div className="flex items-center gap-2 pl-8 mt-3">
                      <div className="flex gap-[2px] opacity-40 overflow-hidden">
                        <span className="text-[10px] leading-none tracking-[2px]" style={{ color: TEXT_LIGHT }}>
                          {dots}
                        </span>
                      </div>
                      <span className="text-[9px] font-medium uppercase" style={{ color: TEXT_LIGHT }}>
                        {s.verses} v
                      </span>
                    </div>
                  </div>

                  {/* Vertical hairline marking type */}
                  <div className="absolute left-[65%] top-1/2 -translate-y-1/2 h-10 border-l border-dashed opacity-30" style={{ borderColor: s.type === 'M' ? GOLD : TEXT_LIGHT }} />
                  <span className="absolute left-[65%] top-1/2 -translate-y-1/2 -translate-x-full pr-2 text-[8px] uppercase tracking-widest opacity-40 rotate-180" style={{ writingMode: 'vertical-rl', color: s.type === 'M' ? GOLD : TEXT_LIGHT }}>
                    {s.type === 'M' ? 'Meccan' : 'Medinan'}
                  </span>

                  {/* Right section: Enormous Arabic */}
                  <div className="flex-1 flex justify-end">
                    <span 
                      className="font-quran text-[40px] leading-none text-right" 
                      style={{ color: TEXT }}
                    >
                      {s.ar}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <style>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </>
  );
}
