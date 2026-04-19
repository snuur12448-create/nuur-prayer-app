import React from 'react';
import { Search, Bookmark } from 'lucide-react';

const BG = '#0A1310';
const SURFACE = '#0F1C18';
const BORDER = '#1B2E27';
const GOLD = '#D4A017';
const GOLD_SOFT = '#9C7A2B';
const TEXT = '#E8EAE6';
const TEXT_DIM = '#6F7F77';
const SPINE_BG = '#070F0C';

type Surah = { n: number; ar: string; en: string; meaning: string; verses: number; juz: number };

const SURAHS: Surah[] = [
  { n: 1, ar: 'ٱلْفَاتِحَة', en: 'Al-Fātiḥah', meaning: 'The Opening', verses: 7, juz: 1 },
  { n: 2, ar: 'ٱلْبَقَرَة', en: 'Al-Baqarah', meaning: 'The Cow', verses: 286, juz: 1 },
  { n: 3, ar: 'آلِ عِمْرَان', en: 'Āl ʿImrān', meaning: 'Family of Imran', verses: 200, juz: 3 },
  { n: 4, ar: 'ٱلنِّسَاء', en: 'An-Nisāʾ', meaning: 'The Women', verses: 176, juz: 4 },
  { n: 5, ar: 'ٱلْمَائِدَة', en: 'Al-Māʾidah', meaning: 'The Table', verses: 120, juz: 6 },
  { n: 6, ar: 'ٱلْأَنْعَام', en: 'Al-Anʿām', meaning: 'The Cattle', verses: 165, juz: 7 },
];

const MAX_VERSES = 286;

const JUZ_NAMES: Record<number, string> = {
  1: 'Alif Lām Mīm',
  3: 'Tilka r-Rusul',
  4: 'Lan Tanālū',
  6: 'Lā Yuḥibbu-llāh',
  7: 'Wa-idhā samiʿū',
};

export default function Spine() {
  const currentJuz = 2;
  const grouped = groupByJuz(SURAHS);

  return (
    <div
      className="relative w-full h-[100dvh] max-h-[844px] max-w-[390px] mx-auto overflow-hidden font-sans"
      style={{ background: BG, color: TEXT }}
    >
      {/* Vertical Juz spine */}
      <div
        className="absolute left-0 top-0 bottom-0 w-9 flex flex-col items-center pt-3 pb-3"
        style={{ background: SPINE_BG, borderRight: `1px solid ${BORDER}` }}
      >
        <div className="text-[8px] uppercase tracking-[0.3em] mb-2" style={{ color: GOLD }}>
          Juz
        </div>
        <div className="flex-1 flex flex-col justify-between w-full items-center pb-2">
          {Array.from({ length: 30 }).map((_, i) => {
            const n = i + 1;
            const active = n === currentJuz;
            const read = n === 1;
            return (
              <div key={n} className="flex items-center gap-1 w-full justify-center">
                <span
                  className="text-[9px] font-mono w-4 text-right"
                  style={{
                    color: active ? GOLD : read ? GOLD_SOFT : TEXT_DIM,
                    fontWeight: active ? 700 : 400,
                  }}
                >
                  {n}
                </span>
                <div
                  className="h-[2px]"
                  style={{
                    width: active ? 14 : read ? 10 : 6,
                    background: active ? GOLD : read ? GOLD_SOFT : `${TEXT_DIM}66`,
                    borderRadius: 1,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Main column */}
      <div className="ml-9 h-full overflow-y-auto">
        {/* Status bar */}
        <div className="flex justify-between items-center px-5 pt-3 pb-2 text-[11px]" style={{ color: TEXT_DIM }}>
          <span className="font-medium">9:41</span>
          <div className="flex gap-1 items-center"><span>•••</span><span>􀙇</span></div>
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-3">
          <div className="flex items-baseline justify-between">
            <h1 className="text-[18px] font-semibold tracking-tight" style={{ color: TEXT }}>
              Library
            </h1>
            <span className="font-['Amiri_Quran'] text-[18px]" style={{ color: TEXT_DIM }}>
              ٱلْقُرْآن
            </span>
          </div>
          <p className="text-[10px] mt-0.5" style={{ color: TEXT_DIM }}>
            114 surahs · 6,236 ayat · 30 juz
          </p>
        </div>

        {/* Search + tabs */}
        <div className="px-5 pb-3">
          <div
            className="flex items-center gap-2 rounded-lg px-3 h-9 mb-2"
            style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
          >
            <Search size={13} strokeWidth={1.5} style={{ color: TEXT_DIM }} />
            <span className="text-[12px]" style={{ color: TEXT_DIM }}>
              Search surah, verse, or juz…
            </span>
          </div>
          <div className="flex gap-1 text-[11px]">
            <Tab active>By Juz</Tab>
            <Tab>1 → 114</Tab>
            <Tab>Bookmarked</Tab>
          </div>
        </div>

        {/* Continue strip */}
        <div className="px-5 pb-3">
          <div
            className="rounded-lg p-3 flex items-center gap-3"
            style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}55` }}
          >
            <div className="w-1 h-9 rounded" style={{ background: GOLD }} />
            <div className="flex-1">
              <p className="text-[9px] uppercase tracking-wider" style={{ color: GOLD }}>
                Continue
              </p>
              <p className="text-[12px] font-semibold leading-tight" style={{ color: TEXT }}>
                Al-Baqarah · Ayah 97
              </p>
            </div>
            <span className="text-[10px] font-mono" style={{ color: GOLD }}>34%</span>
          </div>
        </div>

        {/* Juz-grouped surahs */}
        <div className="pb-24">
          {Object.entries(grouped).map(([juzStr, surahs]) => {
            const juzN = Number(juzStr);
            const isCurrent = juzN === currentJuz;
            return (
              <div key={juzN}>
                {/* Juz header */}
                <div className="px-5 pt-4 pb-2 flex items-baseline gap-2">
                  <span
                    className="font-mono text-[10px] tabular-nums"
                    style={{ color: isCurrent ? GOLD : TEXT_DIM }}
                  >
                    JUZ {String(juzN).padStart(2, '0')}
                  </span>
                  <span className="font-['Amiri'] italic text-[12px]" style={{ color: isCurrent ? TEXT : TEXT_DIM }}>
                    {JUZ_NAMES[juzN] ?? '—'}
                  </span>
                  <div className="flex-1 h-px" style={{ background: BORDER }} />
                </div>

                {surahs.map((s) => {
                  const pct = Math.min(1, s.verses / MAX_VERSES);
                  const isCurrentSurah = s.n === 2;
                  return (
                    <div
                      key={s.n}
                      className="px-5 py-2.5 flex items-center gap-3"
                      style={{
                        borderTop: `1px solid ${BORDER}88`,
                        background: isCurrentSurah ? `${GOLD}08` : 'transparent',
                      }}
                    >
                      <span
                        className="font-mono text-[11px] w-6 text-right tabular-nums"
                        style={{ color: isCurrentSurah ? GOLD : TEXT_DIM }}
                      >
                        {String(s.n).padStart(3, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span
                            className="font-semibold text-[13px] truncate"
                            style={{ color: isCurrentSurah ? TEXT : TEXT }}
                          >
                            {s.en}
                          </span>
                          <span className="font-['Amiri_Quran'] text-[15px] shrink-0" style={{ color: TEXT_DIM }}>
                            {s.ar}
                          </span>
                        </div>
                        {/* Verse-count bar */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-[3px] rounded-full" style={{ background: `${BORDER}` }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pct * 100}%`,
                                background: isCurrentSurah ? GOLD : GOLD_SOFT,
                                opacity: isCurrentSurah ? 1 : 0.55,
                              }}
                            />
                          </div>
                          <span className="text-[9px] font-mono tabular-nums" style={{ color: TEXT_DIM }}>
                            {s.verses}
                          </span>
                        </div>
                      </div>
                      {isCurrentSurah && (
                        <Bookmark size={12} fill={GOLD} strokeWidth={0} />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Tab({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className="px-2.5 h-7 rounded-md inline-flex items-center"
      style={{
        background: active ? `${GOLD}1f` : 'transparent',
        color: active ? GOLD : TEXT_DIM,
        border: `1px solid ${active ? `${GOLD}55` : BORDER}`,
        fontWeight: active ? 600 : 400,
      }}
    >
      {children}
    </span>
  );
}

function groupByJuz(surahs: Surah[]) {
  const out: Record<number, Surah[]> = {};
  for (const s of surahs) {
    (out[s.juz] ||= []).push(s);
  }
  return out;
}
