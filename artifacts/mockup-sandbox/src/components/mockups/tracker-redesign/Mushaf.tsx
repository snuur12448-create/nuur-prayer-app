import React, { useState } from 'react';
import { Check } from 'lucide-react';

const BG = '#0A1A0E';
const TEXT = '#F0EDE5';
const TEXT_DIM = '#8FA99A';
const BORDER = '#1F3526';
const GOLD = '#F4C842';
const GOLD_LIGHT = '#F9D97A';
const GOLD_DARK = '#C99A2A';
const PARCH_TOP = '#F4EDD6';
const PARCH_BOT = '#EBE0BD';
const INK = '#2A251D';
const INK_DIM = '#6E6658';

const SANS = 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const SERIF = 'ui-serif, Georgia, "Iowan Old Style", "Apple Garamond", serif';
const ARABIC = '"Amiri Quran", "Scheherazade New", "Noto Naskh Arabic", serif';

type Prayer = {
  n: number;
  en: string;
  ar: string;
  time: string;
  status: 'kept' | 'due' | 'next';
  statusText: string;
};

const PRAYERS: Prayer[] = [
  { n: 1, en: 'Fajr', ar: 'ٱلْفَجْر', time: '05:42', status: 'kept', statusText: 'kept' },
  { n: 2, en: 'Dhuhr', ar: 'ٱلظُّهْر', time: '12:48', status: 'kept', statusText: 'kept' },
  { n: 3, en: 'Asr', ar: 'ٱلْعَصْر', time: '16:14', status: 'kept', statusText: 'kept' },
  { n: 4, en: 'Maghrib', ar: 'ٱلْمَغْرِب', time: '19:31', status: 'next', statusText: 'due in 2h 01m' },
  { n: 5, en: 'Isha', ar: 'ٱلْعِشَاء', time: '21:02', status: 'due', statusText: 'due' },
];

const WEEK = [5, 5, 4, 5, 5, 3, 3];
const MONTH = [
  5, 5, 4, 3, 5, 2, 5,
  5, 4, 5, 5, 5, 3, 4,
  0, 5, 5, 4, 5, 5, 5,
  4, 5, 5, 4, 5, 3, 3,
];
const TODAY_INDEX = 27;

function Floret({ rotate = 0 }: { rotate?: number }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" style={{ transform: `rotate(${rotate}deg)` }}>
      <defs>
        <linearGradient id={`flg-${rotate}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD_LIGHT} />
          <stop offset="100%" stopColor={GOLD_DARK} />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#flg-${rotate})`} strokeWidth="1">
        <path d="M2 2 L14 2 M2 2 L2 14" />
        <path d="M2 6 Q 6 6 6 2" />
        <circle cx="9" cy="9" r="3" />
        <circle cx="9" cy="9" r="1.2" fill={GOLD_DARK} stroke="none" />
        <path d="M14 2 Q 12 6 14 9" />
        <path d="M2 14 Q 6 12 9 14" />
        <path d="M11 11 L16 16" strokeDasharray="1 2" />
      </g>
    </svg>
  );
}

function Rosette({ digit, filled, size = 44 }: { digit: number; filled: boolean; size?: number }) {
  const s = size;
  const id = `ros-${digit}-${filled ? 'f' : 'o'}`;
  return (
    <svg width={s} height={s} viewBox="0 0 44 44" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD_LIGHT} />
          <stop offset="100%" stopColor={GOLD_DARK} />
        </linearGradient>
      </defs>
      {filled && <circle cx="22" cy="22" r="20" fill={`url(#${id})`} opacity="0.18" />}
      <circle cx="22" cy="22" r="19" fill="none" stroke={GOLD_DARK} strokeWidth="0.7" />
      <circle cx="22" cy="22" r="16" fill={filled ? `url(#${id})` : 'none'} stroke={GOLD_DARK} strokeWidth="0.8" />
      <circle cx="22" cy="22" r="13" fill="none" stroke={filled ? PARCH_TOP : GOLD_DARK} strokeWidth="0.5" strokeDasharray={filled ? '0' : '1 2'} />
      {/* radial ticks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * Math.PI) / 6;
        const x1 = 22 + Math.cos(a) * 19;
        const y1 = 22 + Math.sin(a) * 19;
        const x2 = 22 + Math.cos(a) * 21;
        const y2 = 22 + Math.sin(a) * 21;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={GOLD_DARK} strokeWidth="0.6" />;
      })}
      <text
        x="22"
        y="27"
        textAnchor="middle"
        fontFamily={SERIF}
        fontStyle="italic"
        fontSize="14"
        fontWeight="600"
        fill={filled ? PARCH_TOP : GOLD_DARK}
      >
        {digit}
      </text>
    </svg>
  );
}

function HeaderRosette() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38">
      <defs>
        <linearGradient id="hr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD_LIGHT} />
          <stop offset="100%" stopColor={GOLD_DARK} />
        </linearGradient>
      </defs>
      <circle cx="19" cy="19" r="17" fill="none" stroke={GOLD_DARK} strokeWidth="0.7" />
      <circle cx="19" cy="19" r="13" fill="none" stroke={GOLD_DARK} strokeWidth="0.6" />
      <circle cx="19" cy="19" r="6" fill="url(#hr)" />
      <circle cx="19" cy="19" r="2" fill={PARCH_TOP} />
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i * Math.PI) / 8;
        const x1 = 19 + Math.cos(a) * 13.5;
        const y1 = 19 + Math.sin(a) * 13.5;
        const x2 = 19 + Math.cos(a) * 17;
        const y2 = 19 + Math.sin(a) * 17;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={GOLD_DARK} strokeWidth="0.5" />;
      })}
    </svg>
  );
}

function DottedLeader() {
  return (
    <div
      style={{
        height: 1,
        backgroundImage: `radial-gradient(circle, ${GOLD_DARK} 0.6px, transparent 0.7px)`,
        backgroundSize: '6px 1px',
        backgroundRepeat: 'repeat-x',
        opacity: 0.55,
      }}
    />
  );
}

function Sparkline({ data }: { data: number[] }) {
  const w = 88;
  const h = 22;
  const max = 5;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={GOLD_DARK} strokeWidth="1.2" />
      {data.map((v, i) => (
        <circle key={i} cx={i * step} cy={h - (v / max) * h} r="1.4" fill={GOLD_DARK} />
      ))}
    </svg>
  );
}

export default function Mushaf() {
  const [view, setView] = useState<'today' | 'week' | 'month'>('today');
  const [hovered, setHovered] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(TODAY_INDEX);

  return (
    <div
      className="w-full min-h-[844px] max-h-[844px] max-w-[390px] mx-auto overflow-hidden"
      style={{ backgroundColor: BG, color: TEXT, fontFamily: SANS }}
    >
      <div className="w-full h-[844px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <style>{`
          .no-sb::-webkit-scrollbar { display: none; }
          .small-caps { font-variant-caps: all-small-caps; letter-spacing: 0.18em; }
          .tnum { font-variant-numeric: tabular-nums; }
        `}</style>

        {/* Top status / view switcher */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <span className="text-[10px] font-bold tracking-[0.18em]" style={{ color: TEXT_DIM }}>
            TRACKER · 17:30
          </span>
          <div
            className="flex items-center gap-1 rounded-full px-1 py-1"
            style={{ backgroundColor: '#111F14', border: `1px solid ${BORDER}` }}
          >
            {(['today', 'week', 'month'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="cursor-pointer transition-all rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-[0.16em] uppercase hover:opacity-100"
                style={{
                  backgroundColor: view === v ? GOLD : 'transparent',
                  color: view === v ? INK : TEXT_DIM,
                  opacity: view === v ? 1 : 0.7,
                  border: 'none',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Parchment Mushaf card */}
        <div className="px-4 pt-1">
          <div
            className="relative"
            style={{
              borderRadius: 22,
              padding: 18,
              background: `linear-gradient(180deg, ${PARCH_TOP} 0%, ${PARCH_BOT} 100%)`,
              boxShadow: '0 12px 32px rgba(244,200,66,0.10), 0 0 0 1px rgba(201,154,42,0.25)',
            }}
          >
            {/* Subtle parchment grain */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: 22,
                opacity: 0.15,
                backgroundImage:
                  'radial-gradient(circle at 22% 28%, #b59653 0.5px, transparent 1px), radial-gradient(circle at 73% 64%, #b59653 0.5px, transparent 1px)',
                backgroundSize: '11px 11px, 13px 13px',
                mixBlendMode: 'multiply',
              }}
            />

            {/* Outer + Inner gold double-line frame */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: 8,
                left: 8,
                right: 8,
                bottom: 8,
                border: `1px solid ${GOLD_DARK}`,
                borderRadius: 16,
              }}
            />
            <div
              className="absolute pointer-events-none"
              style={{
                top: 12,
                left: 12,
                right: 12,
                bottom: 12,
                border: `0.6px solid ${GOLD_DARK}`,
                borderRadius: 13,
                opacity: 0.7,
              }}
            />

            {/* Corner florets */}
            <div className="absolute pointer-events-none" style={{ top: 4, left: 4 }}>
              <Floret rotate={0} />
            </div>
            <div className="absolute pointer-events-none" style={{ top: 4, right: 4 }}>
              <Floret rotate={90} />
            </div>
            <div className="absolute pointer-events-none" style={{ bottom: 4, right: 4 }}>
              <Floret rotate={180} />
            </div>
            <div className="absolute pointer-events-none" style={{ bottom: 4, left: 4 }}>
              <Floret rotate={270} />
            </div>

            {/* Inside frame content */}
            <div className="relative px-4 pt-4 pb-3">
              {/* HEADER */}
              <div className="flex flex-col items-center pb-3">
                <HeaderRosette />
                <div
                  className="mt-2 text-center"
                  style={{ fontFamily: SERIF, fontStyle: 'italic', color: INK, fontSize: 17, lineHeight: 1.2 }}
                >
                  Tuesday · the eleventh of November
                </div>
                <div className="small-caps mt-1 text-[10px]" style={{ color: INK_DIM }}>
                  21 Jumādā al-Ūlā · 1447
                </div>
              </div>

              {/* gold rule */}
              <div style={{ height: 1, backgroundColor: GOLD_DARK, opacity: 0.5 }} />
              <div style={{ height: 2 }} />
              <div style={{ height: 0.6, backgroundColor: GOLD_DARK, opacity: 0.3 }} />

              {/* SURAH OF PRAYERS */}
              <div className="pt-2">
                {PRAYERS.map((p, i) => {
                  const filled = p.status === 'kept';
                  const isNext = p.status === 'next';
                  const dim = !filled;
                  return (
                    <div key={p.n}>
                      <div
                        className="flex items-center gap-3 py-2.5 group cursor-pointer"
                        onMouseEnter={() => setHovered(p.n)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          opacity: hovered !== null && hovered !== p.n ? 0.85 : 1,
                          transition: 'opacity 200ms',
                        }}
                      >
                        {/* Rosette (tappable) */}
                        <div
                          className="relative flex-shrink-0"
                          style={{
                            transform: hovered === p.n ? 'scale(1.06)' : 'scale(1)',
                            transition: 'transform 200ms',
                            filter: isNext ? `drop-shadow(0 0 6px rgba(244,200,66,0.55))` : 'none',
                          }}
                        >
                          <Rosette digit={p.n} filled={filled} size={42} />
                          {filled && (
                            <div
                              className="absolute inset-0 flex items-center justify-center pointer-events-none"
                              style={{ paddingTop: 1 }}
                            >
                              <Check size={11} color={PARCH_TOP} strokeWidth={3} />
                            </div>
                          )}
                        </div>

                        {/* Center content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between">
                            <span
                              style={{
                                fontFamily: SERIF,
                                fontStyle: 'italic',
                                fontWeight: 600,
                                fontSize: 18,
                                color: dim ? INK_DIM : INK,
                                letterSpacing: 0.2,
                              }}
                            >
                              {p.en}
                            </span>
                            <span
                              dir="rtl"
                              style={{
                                fontFamily: ARABIC,
                                fontSize: 22,
                                lineHeight: 1,
                                color: dim ? INK_DIM : INK,
                              }}
                            >
                              {p.ar}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <span
                              className="tnum"
                              style={{
                                fontFamily: SANS,
                                fontSize: 11,
                                color: dim ? INK_DIM : INK,
                                letterSpacing: 0.5,
                              }}
                            >
                              {p.time}
                            </span>
                            <span
                              style={{
                                fontFamily: SERIF,
                                fontStyle: 'italic',
                                fontSize: 11,
                                color: isNext ? GOLD_DARK : INK_DIM,
                                fontWeight: isNext ? 600 : 400,
                              }}
                            >
                              {p.statusText}
                            </span>
                          </div>
                        </div>
                      </div>
                      {i < PRAYERS.length - 1 && <DottedLeader />}
                    </div>
                  );
                })}
              </div>

              {/* Footer divider */}
              <div className="mt-2" style={{ height: 0.6, backgroundColor: GOLD_DARK, opacity: 0.3 }} />
              <div style={{ height: 2 }} />
              <div style={{ height: 1, backgroundColor: GOLD_DARK, opacity: 0.5 }} />

              {/* ILLUMINATED FOOTER */}
              <div className="grid grid-cols-3 pt-3 pb-1" style={{ gap: 0 }}>
                {/* Col 1: Streak */}
                <div className="px-2 flex flex-col items-center text-center" style={{ borderRight: `0.6px solid ${GOLD_DARK}` }}>
                  <span className="small-caps text-[8.5px]" style={{ color: INK_DIM }}>Streak</span>
                  <span style={{ fontFamily: SERIF, fontStyle: 'italic', color: INK, fontSize: 22, lineHeight: 1.1, marginTop: 2 }}>
                    fourteen
                  </span>
                  {/* tiny ribbon ornament */}
                  <svg width="34" height="8" viewBox="0 0 34 8" className="my-1">
                    <path d="M2 4 L17 1 L32 4 L17 7 Z" fill="none" stroke={GOLD_DARK} strokeWidth="0.7" />
                    <circle cx="17" cy="4" r="1.2" fill={GOLD_DARK} />
                  </svg>
                  <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 9.5, color: INK_DIM }}>
                    to thirty: sixteen
                  </span>
                </div>

                {/* Col 2: This week */}
                <div className="px-2 flex flex-col items-center text-center" style={{ borderRight: `0.6px solid ${GOLD_DARK}` }}>
                  <span className="small-caps text-[8.5px]" style={{ color: INK_DIM }}>This week</span>
                  <span className="tnum" style={{ fontFamily: SERIF, color: INK, fontSize: 22, lineHeight: 1.1, marginTop: 2, fontWeight: 600 }}>
                    24<span style={{ fontStyle: 'italic', color: INK_DIM, fontWeight: 400 }}> / 35</span>
                  </span>
                  <div className="mt-1.5">
                    <Sparkline data={WEEK} />
                  </div>
                  <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 9.5, color: INK_DIM, marginTop: 2 }}>
                    Wed → Tue
                  </span>
                </div>

                {/* Col 3: Last 28 days */}
                <div className="px-2 flex flex-col items-center text-center">
                  <span className="small-caps text-[8.5px]" style={{ color: INK_DIM }}>Last 28 days</span>
                  <div className="grid grid-cols-7 gap-[2px] mt-1.5">
                    {MONTH.map((v, i) => {
                      const fill =
                        v === 0 ? 'transparent'
                          : v <= 1 ? 'rgba(42,37,29,0.18)'
                          : v <= 2 ? 'rgba(42,37,29,0.36)'
                          : v <= 3 ? 'rgba(42,37,29,0.55)'
                          : v <= 4 ? 'rgba(42,37,29,0.75)'
                          : INK;
                      const isToday = i === TODAY_INDEX;
                      const isSel = i === selectedDay;
                      return (
                        <div
                          key={i}
                          onClick={() => setSelectedDay(i)}
                          className="cursor-pointer"
                          style={{
                            width: 9,
                            height: 9,
                            backgroundColor: fill,
                            border: isToday ? `1px solid ${GOLD_DARK}` : isSel ? `1px solid ${GOLD_DARK}` : `0.5px solid rgba(42,37,29,0.25)`,
                            boxShadow: isToday ? `0 0 4px rgba(244,200,66,0.6)` : 'none',
                            transition: 'transform 150ms',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        />
                      );
                    })}
                  </div>
                  <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 9.5, color: INK_DIM, marginTop: 4 }}>
                    avg 4.4 · best Fajr
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AYAH PULL-QUOTE on dark BG */}
        <div className="px-7 pt-5 pb-6 cursor-pointer group">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div style={{ flex: 1, height: 0.6, backgroundColor: GOLD, opacity: 0.3 }} />
            <span className="small-caps text-[9px]" style={{ color: GOLD, opacity: 0.7 }}>Hadith</span>
            <div style={{ flex: 1, height: 0.6, backgroundColor: GOLD, opacity: 0.3 }} />
          </div>
          <div
            dir="rtl"
            className="text-center"
            style={{
              fontFamily: ARABIC,
              fontSize: 19,
              lineHeight: '36px',
              color: GOLD_LIGHT,
              opacity: 0.85,
            }}
          >
            إِنَّ خَيْرَ أَعْمَالِكُمْ ٱلصَّلَاةُ
          </div>
          <div
            className="text-center mt-1 group-hover:opacity-100 transition-opacity"
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontSize: 12,
              color: TEXT_DIM,
              opacity: 0.85,
            }}
          >
            "The best of your deeds is prayer."
          </div>
        </div>
      </div>
    </div>
  );
}
