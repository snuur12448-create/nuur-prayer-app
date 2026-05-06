import React from 'react';
import { Check, ChevronRight, Flame } from 'lucide-react';

const BG = '#0B0B14';
const TEXT = '#F4EFE4';
const TEXT_DIM = '#9A9482';
const TEXT_MUTE = '#615C50';
const SURFACE = '#161623';
const SURFACE_HI = '#1F1F30';
const BORDER = '#2A2A3D';
const GOLD = '#C9A227';

const FAJR = '#5B6CFF';
const DHUHR = '#F59E0B';
const ASR = '#10B981';
const MAGHRIB = '#F97316';
const ISHA = '#8B5CF6';

type Prayer = {
  key: string;
  name: string;
  time: string;
  hour: number;
  color: string;
  done: boolean;
};

const DAY_START = 5;
const DAY_END = 22;
const SPAN = DAY_END - DAY_START;

const PRAYERS: Prayer[] = [
  { key: 'fajr',    name: 'Fajr',    time: '05:42', hour: 5 + 42 / 60,  color: FAJR,    done: true  },
  { key: 'dhuhr',   name: 'Dhuhr',   time: '12:48', hour: 12 + 48 / 60, color: DHUHR,   done: true  },
  { key: 'asr',     name: 'Asr',     time: '16:14', hour: 16 + 14 / 60, color: ASR,     done: true  },
  { key: 'maghrib', name: 'Maghrib', time: '19:31', hour: 19 + 31 / 60, color: MAGHRIB, done: false },
  { key: 'isha',    name: 'Isha',    time: '21:02', hour: 21 + 2 / 60,  color: ISHA,    done: false },
];

const NOW_HOUR = 17.5;

const ARC_W = 358;
const ARC_H = 240;
const PAD_X = 22;

const P0 = { x: PAD_X, y: ARC_H - 24 };
const P1 = { x: ARC_W / 2, y: -40 };
const P2 = { x: ARC_W - PAD_X, y: ARC_H - 24 };

function bezier(t: number) {
  const u = 1 - t;
  const x = u * u * P0.x + 2 * u * t * P1.x + t * t * P2.x;
  const y = u * u * P0.y + 2 * u * t * P1.y + t * t * P2.y;
  return { x, y };
}

function tFromHour(h: number) {
  return Math.max(0, Math.min(1, (h - DAY_START) / SPAN));
}

const WEEK = [
  { d: 'W', n: 5 },
  { d: 'T', n: 5 },
  { d: 'F', n: 4 },
  { d: 'S', n: 5 },
  { d: 'S', n: 5 },
  { d: 'M', n: 3 },
  { d: 'T', n: 3 },
];

const MONTH: number[] = [
  5, 5, 4, 3, 5, 2, 5,
  5, 4, 5, 5, 5, 3, 4,
  0, 5, 5, 4, 5, 5, 5,
  4, 5, 5, 4, 5, 3, 3,
];

export default function DayArc() {
  const completed = PRAYERS.filter(p => p.done).length;
  const total = PRAYERS.length;
  const nowPos = bezier(tFromHour(NOW_HOUR));

  return (
    <div
      className="w-full min-h-[844px] max-h-[844px] max-w-[390px] mx-auto overflow-hidden"
      style={{ backgroundColor: BG, color: TEXT, fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}
    >
      <div className="w-full h-full overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex flex-col">
            <span className="text-[11px] tracking-[0.18em] uppercase" style={{ color: TEXT_MUTE }}>
              Tue · Nov 11
            </span>
            <span className="text-[12px] mt-0.5" style={{ color: TEXT_DIM, fontFamily: 'ui-serif, Georgia, serif', fontStyle: 'italic' }}>
              21 Jumādā al-Ūlā 1447
            </span>
          </div>
          <button
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 cursor-pointer transition-colors hover:brightness-125"
            style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GOLD }} />
            <span className="text-[11px] font-semibold tracking-wide" style={{ color: TEXT }}>
              {completed} of {total} today
            </span>
          </button>
        </div>

        {/* HERO ARC */}
        <div className="relative mx-4 mt-2 rounded-3xl overflow-hidden" style={{ height: 340, border: `1px solid ${BORDER}` }}>
          {/* Sky gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, #1A1B3A 0%, #2D2A52 18%, #6B5A2E 42%, #C76A3A 70%, #5B2A6B 88%, #161028 100%)',
            }}
          />
          {/* Vertical haze */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(11,11,20,0.55) 0%, rgba(11,11,20,0.05) 35%, rgba(11,11,20,0.0) 60%, rgba(11,11,20,0.85) 100%)',
            }}
          />
          {/* Stars */}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                'radial-gradient(circle at 8% 18%, #F4EFE4 0.6px, transparent 1px), radial-gradient(circle at 90% 22%, #F4EFE4 0.5px, transparent 1px), radial-gradient(circle at 78% 10%, #F4EFE4 0.7px, transparent 1px), radial-gradient(circle at 14% 32%, #F4EFE4 0.4px, transparent 1px)',
              backgroundSize: '100% 100%',
            }}
          />

          {/* Sunrise / Sunset labels */}
          <div className="absolute top-4 left-4 text-[9px] uppercase tracking-[0.22em]" style={{ color: '#E9D9B7' }}>
            Sunrise
          </div>
          <div className="absolute top-4 right-4 text-[9px] uppercase tracking-[0.22em]" style={{ color: '#C8B5E8' }}>
            Night
          </div>

          {/* Arc SVG */}
          <svg
            width={ARC_W}
            height={ARC_H}
            viewBox={`0 0 ${ARC_W} ${ARC_H}`}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: 56 }}
          >
            <defs>
              <linearGradient id="arcStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={FAJR} stopOpacity="0.85" />
                <stop offset="35%" stopColor={DHUHR} stopOpacity="0.75" />
                <stop offset="65%" stopColor={ASR} stopOpacity="0.75" />
                <stop offset="85%" stopColor={MAGHRIB} stopOpacity="0.85" />
                <stop offset="100%" stopColor={ISHA} stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="arcFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F4EFE4" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#F4EFE4" stopOpacity="0" />
              </linearGradient>
              {PRAYERS.map(p => (
                <radialGradient key={`g-${p.key}`} id={`glow-${p.key}`}>
                  <stop offset="0%" stopColor={p.color} stopOpacity="0.9" />
                  <stop offset="60%" stopColor={p.color} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={p.color} stopOpacity="0" />
                </radialGradient>
              ))}
            </defs>

            {/* Soft fill below arc */}
            <path
              d={`M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y}, ${P2.x} ${P2.y} L ${P2.x} ${ARC_H} L ${P0.x} ${ARC_H} Z`}
              fill="url(#arcFill)"
            />

            {/* Tick marks for hours */}
            {Array.from({ length: SPAN + 1 }).map((_, i) => {
              const t = i / SPAN;
              const p = bezier(t);
              const major = i % 3 === 0;
              return (
                <circle
                  key={`tick-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={major ? 1.2 : 0.6}
                  fill={TEXT}
                  opacity={major ? 0.35 : 0.18}
                />
              );
            })}

            {/* Arc stroke */}
            <path
              d={`M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y}, ${P2.x} ${P2.y}`}
              fill="none"
              stroke="url(#arcStroke)"
              strokeWidth={1.5}
              strokeLinecap="round"
            />

            {/* Now marker — vertical thread + arrow */}
            <g>
              <line
                x1={nowPos.x}
                y1={nowPos.y - 18}
                x2={nowPos.x}
                y2={ARC_H - 6}
                stroke={GOLD}
                strokeWidth="0.8"
                strokeDasharray="2 3"
                opacity="0.7"
              />
              <circle cx={nowPos.x} cy={nowPos.y} r="14" fill={GOLD} opacity="0.12" />
              <circle cx={nowPos.x} cy={nowPos.y} r="6" fill={BG} stroke={GOLD} strokeWidth="1.5" />
              <circle cx={nowPos.x} cy={nowPos.y} r="2" fill={GOLD} />
            </g>

            {/* Prayer nodes */}
            {PRAYERS.map(p => {
              const pos = bezier(tFromHour(p.hour));
              return (
                <g key={p.key} className="cursor-pointer">
                  {/* glow */}
                  <circle cx={pos.x} cy={pos.y} r={p.done ? 22 : 14} fill={`url(#glow-${p.key})`} />
                  {p.done ? (
                    <>
                      <circle cx={pos.x} cy={pos.y} r="7" fill={p.color} />
                      <circle cx={pos.x} cy={pos.y} r="3" fill="#fff" opacity="0.6" />
                    </>
                  ) : (
                    <circle cx={pos.x} cy={pos.y} r="6" fill={BG} stroke={p.color} strokeWidth="1.6" />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Prayer labels under arc — absolute positioned by t */}
          <div className="absolute left-0 right-0" style={{ top: 56 + ARC_H + 4, height: 50 }}>
            {PRAYERS.map(p => {
              const pos = bezier(tFromHour(p.hour));
              const arcLeft = (390 - ARC_W) / 2;
              return (
                <div
                  key={p.key}
                  className="absolute flex flex-col items-center"
                  style={{ left: arcLeft + pos.x - 28, width: 56 }}
                >
                  <span
                    className="text-[10px] uppercase tracking-[0.16em] font-semibold"
                    style={{ color: p.done ? TEXT : TEXT_DIM }}
                  >
                    {p.name}
                  </span>
                  <span className="text-[10px] mt-0.5 tabular-nums" style={{ color: TEXT_MUTE }}>
                    {p.time}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Now display — centered inside the dome */}
          <div
            className="absolute left-0 right-0 flex flex-col items-center pointer-events-none"
            style={{ top: 150 }}
          >
            <span className="text-[9px] uppercase tracking-[0.28em]" style={{ color: GOLD }}>
              Now
            </span>
            <span
              className="text-[40px] font-semibold tabular-nums leading-none mt-1"
              style={{ color: TEXT, textShadow: '0 2px 18px rgba(0,0,0,0.55)' }}
            >
              17:30
            </span>
            <span className="text-[10px] mt-2 tracking-wide" style={{ color: '#E9D9B7' }}>
              Maghrib in 2h 01m
            </span>
          </div>
        </div>

        {/* NEXT PRAYER CARD */}
        <div
          className="mx-4 mt-4 rounded-2xl p-4 cursor-pointer transition-transform hover:scale-[1.01]"
          style={{
            backgroundColor: SURFACE,
            border: `1px solid ${MAGHRIB}33`,
            boxShadow: `0 0 24px ${MAGHRIB}1A inset`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.22em]" style={{ color: TEXT_MUTE }}>
                Next prayer
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[22px] font-bold leading-none" style={{ color: MAGHRIB }}>
                  Maghrib
                </span>
                <span className="text-[12px]" style={{ color: TEXT_DIM }}>
                  in
                </span>
                <span className="text-[18px] font-semibold tabular-nums leading-none" style={{ color: TEXT }}>
                  2h 01m
                </span>
              </div>
              <span className="text-[11px] mt-1.5 tabular-nums" style={{ color: TEXT_DIM }}>
                at 19:31
              </span>
            </div>
            <button
              className="flex items-center gap-1.5 rounded-full px-3.5 py-2 cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: MAGHRIB, color: '#1A0F08' }}
            >
              <Check size={14} strokeWidth={3} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Mark prayed</span>
            </button>
          </div>
        </div>

        {/* STREAK STRIP */}
        <div
          className="mx-4 mt-3 rounded-2xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:brightness-110"
          style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#2A1B0E', border: `1px solid ${GOLD}55` }}
          >
            <Flame size={18} color={GOLD} fill={GOLD} fillOpacity={0.25} />
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-semibold" style={{ color: TEXT }}>
                14 day streak
              </span>
              <span className="text-[10px] tabular-nums" style={{ color: TEXT_MUTE }}>
                14 / 30
              </span>
            </div>
            <div className="mt-2 h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: '#23202E' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(14 / 30) * 100}%`,
                  background: `linear-gradient(90deg, ${GOLD}, #E8C25E)`,
                }}
              />
            </div>
          </div>
          <ChevronRight size={16} color={TEXT_MUTE} />
        </div>

        {/* WEEK ROW — micro-arcs */}
        <div className="mx-4 mt-4">
          <div className="flex items-baseline justify-between mb-2 px-1">
            <span className="text-[10px] uppercase tracking-[0.22em]" style={{ color: TEXT_MUTE }}>
              This week
            </span>
            <span className="text-[10px] tabular-nums" style={{ color: TEXT_DIM }}>
              24 / 35
            </span>
          </div>
          <div
            className="rounded-2xl px-2 py-3 flex justify-between"
            style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}
          >
            {WEEK.map((w, i) => {
              const pct = w.n / 5;
              const isToday = i === WEEK.length - 1;
              return (
                <div key={i} className="flex flex-col items-center cursor-pointer group" style={{ width: 42 }}>
                  <svg width="36" height="22" viewBox="0 0 36 22">
                    <path
                      d="M 4 18 Q 18 -2, 32 18"
                      fill="none"
                      stroke={BORDER}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 4 18 Q 18 -2, 32 18"
                      fill="none"
                      stroke={isToday ? GOLD : '#E8C25E'}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeDasharray={`${pct * 38} 100`}
                      opacity={isToday ? 1 : 0.85}
                    />
                    {isToday && <circle cx="32" cy="18" r="2" fill={GOLD} />}
                  </svg>
                  <span
                    className="text-[10px] mt-1 font-semibold"
                    style={{ color: isToday ? GOLD : TEXT_DIM }}
                  >
                    {w.d}
                  </span>
                  <span className="text-[9px] tabular-nums" style={{ color: TEXT_MUTE }}>
                    {w.n}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* MONTH GRID */}
        <div className="mx-4 mt-4 mb-6">
          <div className="flex items-baseline justify-between mb-2 px-1">
            <span className="text-[10px] uppercase tracking-[0.22em]" style={{ color: TEXT_MUTE }}>
              Last 28 days
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[9px]" style={{ color: TEXT_MUTE }}>0</span>
              {[1, 2, 3, 4, 5].map(n => (
                <div
                  key={n}
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: GOLD, opacity: 0.15 + n * 0.17 }}
                />
              ))}
              <span className="text-[9px]" style={{ color: TEXT_MUTE }}>5</span>
            </div>
          </div>
          <div
            className="rounded-2xl p-3"
            style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}
          >
            <div className="grid grid-cols-7 gap-1.5">
              {MONTH.map((c, i) => {
                const isToday = i === MONTH.length - 1;
                return (
                  <div
                    key={i}
                    className="aspect-square rounded-md cursor-pointer hover:scale-110 transition-transform flex items-center justify-center"
                    style={{
                      backgroundColor: c === 0 ? SURFACE_HI : GOLD,
                      opacity: c === 0 ? 1 : 0.18 + (c / 5) * 0.7,
                      border: isToday ? `1.2px solid ${TEXT}` : `1px solid ${c === 0 ? BORDER : 'transparent'}`,
                    }}
                  >
                    {c === 5 && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: BG, opacity: 0.5 }} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
