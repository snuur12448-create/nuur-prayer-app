import React from 'react';
import { Search, Bookmark, ChevronRight } from 'lucide-react';

const PARCHMENT = '#F4E9CC';
const PARCHMENT_2 = '#EADBB2';
const INK = '#2A1F0F';
const INK_SOFT = '#5A4A2E';
const GOLD = '#A87B25';
const GOLD_BRIGHT = '#C9933A';

type Surah = {
  n: number; ar: string; en: string; meaning: string; verses: number; juz: number; type: 'M' | 'd';
};

const SURAHS: Surah[] = [
  { n: 1, ar: 'ٱلْفَاتِحَة', en: 'Al-Fātiḥah', meaning: 'The Opening', verses: 7, juz: 1, type: 'M' },
  { n: 2, ar: 'ٱلْبَقَرَة', en: 'Al-Baqarah', meaning: 'The Cow', verses: 286, juz: 1, type: 'd' },
  { n: 3, ar: 'آلِ عِمْرَان', en: 'Āl ʿImrān', meaning: 'Family of Imran', verses: 200, juz: 3, type: 'd' },
  { n: 4, ar: 'ٱلنِّسَاء', en: 'An-Nisāʾ', meaning: 'The Women', verses: 176, juz: 4, type: 'd' },
  { n: 5, ar: 'ٱلْمَائِدَة', en: 'Al-Māʾidah', meaning: 'The Table Spread', verses: 120, juz: 6, type: 'd' },
];

// Eight-pointed star rosette used for surah numbers
function Rosette({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-11 h-11 flex items-center justify-center">
      <svg viewBox="0 0 44 44" className="absolute inset-0 w-full h-full">
        <g transform="translate(22 22)">
          <polygon
            points="0,-20 5,-5 20,0 5,5 0,20 -5,5 -20,0 -5,-5"
            fill={GOLD}
            opacity="0.18"
          />
          <polygon
            points="0,-18 4,-4 18,0 4,4 0,18 -4,4 -18,0 -4,-4"
            fill="none"
            stroke={GOLD}
            strokeWidth="0.7"
            opacity="0.85"
          />
          <circle r="9.5" fill={PARCHMENT_2} stroke={GOLD} strokeWidth="0.5" />
        </g>
      </svg>
      <span className="relative font-['Amiri'] font-bold text-[13px]" style={{ color: INK }}>
        {children}
      </span>
    </div>
  );
}

function Ornament() {
  return (
    <div className="flex items-center gap-2 py-2 opacity-70">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${GOLD}88, transparent)` }} />
      <svg width="22" height="10" viewBox="0 0 22 10" fill="none">
        <path d="M0 5 Q5 0 11 5 T22 5" stroke={GOLD} strokeWidth="0.6" />
        <circle cx="11" cy="5" r="1.4" fill={GOLD} />
      </svg>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${GOLD}88, transparent)` }} />
    </div>
  );
}

function JuzRule({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-3 px-1 pt-5 pb-3">
      <span
        className="font-['Amiri'] text-[10px] uppercase tracking-[0.3em]"
        style={{ color: GOLD }}
      >
        Juz {n}
      </span>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${GOLD}55, transparent)` }} />
    </div>
  );
}

export default function Mushaf() {
  return (
    <div
      className="relative w-full h-[100dvh] max-h-[844px] max-w-[390px] mx-auto overflow-hidden font-sans"
      style={{
        background: `radial-gradient(ellipse at top, ${PARCHMENT} 0%, ${PARCHMENT_2} 100%)`,
        color: INK,
      }}
    >
      {/* Subtle paper grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.18] mix-blend-multiply"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, #8a6f3a 0.5px, transparent 1px), radial-gradient(circle at 70% 60%, #8a6f3a 0.5px, transparent 1px)',
          backgroundSize: '7px 7px, 11px 11px',
        }}
      />

      {/* Status bar */}
      <div className="relative flex justify-between items-center px-6 pt-3 pb-2 text-[11px]" style={{ color: INK_SOFT }}>
        <span className="font-medium">9:41</span>
        <div className="flex gap-1 items-center">
          <span>•••</span>
          <span>􀙇</span>
        </div>
      </div>

      {/* Illuminated header */}
      <div className="relative px-6 pt-2">
        <div
          className="relative rounded-b-[28px] pt-3 pb-5 px-4 text-center"
          style={{
            background: `linear-gradient(180deg, ${GOLD}1a 0%, transparent 100%)`,
            borderBottom: `1px solid ${GOLD}55`,
          }}
        >
          {/* Crown ornament */}
          <svg viewBox="0 0 80 14" className="mx-auto mb-1" width="70" height="12">
            <path d="M0 14 Q20 0 40 7 T80 14" stroke={GOLD} strokeWidth="0.7" fill="none" />
            <circle cx="40" cy="3" r="2" fill={GOLD} />
            <circle cx="20" cy="9" r="1.2" fill={GOLD} />
            <circle cx="60" cy="9" r="1.2" fill={GOLD} />
          </svg>
          <h1 className="font-['Amiri_Quran'] text-[34px] leading-[1.05]" style={{ color: INK }}>
            ٱلْقُرْآن ٱلْكَرِيم
          </h1>
          <p className="mt-1 text-[10px] uppercase tracking-[0.35em]" style={{ color: GOLD }}>
            The Noble Recitation
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 pt-4">
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2.5"
          style={{ background: '#00000008', border: `1px solid ${GOLD}33` }}
        >
          <Search size={14} strokeWidth={1.5} style={{ color: INK_SOFT }} />
          <span className="text-[12px] font-['Amiri'] italic" style={{ color: INK_SOFT }}>
            Search 114 surahs · 6,236 ayat
          </span>
        </div>
      </div>

      {/* Continue reading — illuminated panel */}
      <div className="px-6 pt-4">
        <div
          className="relative rounded-2xl p-4"
          style={{
            background: `linear-gradient(135deg, ${GOLD}22 0%, ${GOLD}08 100%)`,
            border: `1px solid ${GOLD}66`,
            boxShadow: `inset 0 0 0 3px ${PARCHMENT}, inset 0 0 0 4px ${GOLD}33`,
          }}
        >
          <div className="flex items-start gap-3">
            <Rosette>٢</Rosette>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] uppercase tracking-[0.3em] mb-0.5" style={{ color: GOLD }}>
                Continue Reading
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-['Amiri'] font-bold text-[16px]" style={{ color: INK }}>
                  Al-Baqarah
                </span>
                <span className="font-['Amiri_Quran'] text-[20px]" style={{ color: INK }}>
                  ٱلْبَقَرَة
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 h-[3px] rounded-full" style={{ background: `${GOLD}22` }}>
                  <div className="h-full rounded-full" style={{ width: '34%', background: GOLD_BRIGHT }} />
                </div>
                <span className="text-[10px] font-medium" style={{ color: INK_SOFT }}>
                  ayah 97 / 286
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ornament divider */}
      <div className="px-6">
        <Ornament />
      </div>

      {/* Surah list */}
      <div className="px-6 overflow-y-auto pb-20" style={{ height: 'calc(100% - 360px)' }}>
        <JuzRule n={1} />
        {SURAHS.slice(0, 2).map((s) => (
          <SurahRow key={s.n} s={s} />
        ))}
        <JuzRule n={3} />
        {SURAHS.slice(2, 3).map((s) => (
          <SurahRow key={s.n} s={s} />
        ))}
        <JuzRule n={4} />
        {SURAHS.slice(3, 4).map((s) => (
          <SurahRow key={s.n} s={s} />
        ))}
        <JuzRule n={6} />
        {SURAHS.slice(4, 5).map((s) => (
          <SurahRow key={s.n} s={s} />
        ))}
      </div>

      {/* Bottom dock cue */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{ background: `linear-gradient(to top, ${PARCHMENT_2}, transparent)` }}
      />
    </div>
  );
}

function SurahRow({ s }: { s: Surah }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Rosette>{toArabicNum(s.n)}</Rosette>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between">
          <span className="font-['Amiri'] font-bold text-[15px]" style={{ color: INK }}>
            {s.en}
          </span>
          <span className="font-['Amiri_Quran'] text-[18px]" style={{ color: INK }}>
            {s.ar}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="font-['Amiri'] italic text-[11px]" style={{ color: INK_SOFT }}>
            {s.meaning}
          </span>
          <span className="text-[9px]" style={{ color: GOLD }}>·</span>
          <span className="text-[10px]" style={{ color: INK_SOFT }}>
            {s.verses} ayat
          </span>
          <span className="text-[9px]" style={{ color: GOLD }}>·</span>
          <span
            className="text-[9px] uppercase tracking-wider px-1.5 py-px rounded"
            style={{
              color: s.type === 'M' ? GOLD : INK_SOFT,
              background: s.type === 'M' ? `${GOLD}1f` : `${INK_SOFT}1a`,
            }}
          >
            {s.type === 'M' ? 'Meccan' : 'Medinan'}
          </span>
        </div>
      </div>
      <ChevronRight size={14} strokeWidth={1.5} style={{ color: GOLD }} />
    </div>
  );
}

function toArabicNum(n: number) {
  return n.toString().split('').map((d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]).join('');
}
