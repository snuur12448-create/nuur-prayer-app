import React from 'react';
import { Flame, Check, Circle, ChevronRight } from 'lucide-react';

const BG = '#000000';
const SURFACE = '#0E0E12';
const SURFACE_2 = '#15151B';
const TEXT = '#FFFFFF';
const DIM = '#6B7280';
const DIM_2 = '#3F3F46';
const GOLD = '#FFD66B';
const BORDER = '#1F1F26';

const FAJR = '#5B6CFF';
const DHUHR = '#F59E0B';
const ASR = '#10B981';
const MAGHRIB = '#F97316';
const ISHA = '#8B5CF6';

type Prayer = {
  key: string;
  name: string;
  time: string;
  color: string;
  done: boolean;
};

const PRAYERS: Prayer[] = [
  { key: 'fajr', name: 'Fajr', time: '05:42', color: FAJR, done: true },
  { key: 'dhuhr', name: 'Dhuhr', time: '12:48', color: DHUHR, done: true },
  { key: 'asr', name: 'Asr', time: '16:14', color: ASR, done: true },
  { key: 'maghrib', name: 'Maghrib', time: '19:31', color: MAGHRIB, done: false },
  { key: 'isha', name: 'Isha', time: '21:02', color: ISHA, done: false },
];

const WEEK = [
  { d: 'M', count: 5 },
  { d: 'T', count: 5 },
  { d: 'W', count: 4 },
  { d: 'T', count: 5 },
  { d: 'F', count: 5 },
  { d: 'S', count: 3 },
  { d: 'S', count: 3 },
];

// Stack order for weekly bars (bottom-up)
const STACK_COLORS = [FAJR, DHUHR, ASR, MAGHRIB, ISHA];

function Ring({
  cx,
  cy,
  r,
  stroke,
  color,
  done,
}: {
  cx: number;
  cy: number;
  r: number;
  stroke: number;
  color: string;
  done: boolean;
}) {
  const c = 2 * Math.PI * r;
  return (
    <g>
      {/* track */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeOpacity={0.14}
        strokeWidth={stroke}
      />
      {/* fill arc */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${done ? c : 0} ${c}`}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ filter: done ? `drop-shadow(0 0 4px ${color}88)` : 'none' }}
      />
    </g>
  );
}

export default function Rings() {
  const sysFont =
    '-apple-system, BlinkMacSystemFont, "Inter", "SF Pro Text", "Segoe UI", Roboto, sans-serif';
  const serifFont =
    '"New York", "Iowan Old Style", "Apple Garamond", Georgia, serif';

  // Ring geometry
  const SIZE = 240;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  // Outer = Fajr, innermost = Isha
  const RING_DEFS = [
    { color: FAJR, done: true, r: 108, stroke: 14 },
    { color: DHUHR, done: true, r: 88, stroke: 14 },
    { color: ASR, done: true, r: 68, stroke: 14 },
    { color: MAGHRIB, done: false, r: 48, stroke: 14 },
    { color: ISHA, done: false, r: 28, stroke: 14 },
  ];

  // Satellite labels positioned around the outer ring
  const satellites = PRAYERS.map((p, i) => {
    const angle = (-90 + i * 72) * (Math.PI / 180); // start at top
    const radius = 130;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    return { ...p, x, y };
  });

  return (
    <div
      className="w-full min-h-[844px] max-h-[844px] max-w-[390px] mx-auto overflow-hidden"
      style={{ backgroundColor: BG, color: TEXT, fontFamily: sysFont }}
    >
      <div className="h-full max-h-[844px] overflow-y-auto no-scrollbar">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80"
            style={{
              background: `linear-gradient(135deg, ${FAJR}, ${ISHA})`,
            }}
          >
            <span className="text-[12px] font-bold" style={{ color: TEXT }}>
              A
            </span>
          </div>
          <div className="flex flex-col">
            <h1
              className="text-[26px] leading-none tracking-tight"
              style={{ fontFamily: serifFont, color: TEXT }}
            >
              Today
            </h1>
          </div>
          <div className="text-right">
            <div
              className="text-[10px] uppercase tracking-[0.2em]"
              style={{ color: DIM }}
            >
              Tue · Nov 11
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: GOLD }}>
              21 Jumādā I · 1447
            </div>
          </div>
        </div>

        {/* HERO RINGS */}
        <div
          className="relative mx-4 mt-2 rounded-2xl overflow-hidden"
          style={{ backgroundColor: SURFACE, height: 300, border: `1px solid ${BORDER}` }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
              {RING_DEFS.map((r, i) => (
                <Ring key={i} cx={cx} cy={cy} {...r} />
              ))}
            </svg>
          </div>

          {/* center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div
              className="text-[44px] leading-none font-bold tracking-tight"
              style={{ color: TEXT }}
            >
              3<span style={{ color: DIM }}>/5</span>
            </div>
            <div
              className="text-[10px] uppercase tracking-[0.3em] mt-2"
              style={{ color: DIM }}
            >
              Prayers
            </div>
          </div>

          {/* satellite labels */}
          {satellites.map((s) => (
            <div
              key={s.key}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{
                left: `calc(50% + ${s.x - cx}px)`,
                top: `calc(50% + ${s.y - cy}px)`,
              }}
            >
              <div
                className="text-[8px] font-bold uppercase tracking-[0.18em]"
                style={{ color: s.done ? s.color : DIM }}
              >
                {s.name}
              </div>
              <div
                className="text-[9px] tabular-nums mt-0.5"
                style={{ color: s.done ? TEXT : DIM_2 }}
              >
                {s.time}
              </div>
            </div>
          ))}
        </div>

        {/* STAT TILES */}
        <div className="grid grid-cols-3 gap-2 px-4 mt-3">
          <div
            className="rounded-xl p-3 cursor-pointer hover:brightness-125"
            style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, height: 96 }}
          >
            <div className="flex items-baseline gap-1">
              <Flame size={16} color={GOLD} fill={GOLD} />
              <span
                className="text-[28px] font-bold leading-none tabular-nums"
                style={{ color: TEXT }}
              >
                14
              </span>
            </div>
            <div
              className="text-[9px] uppercase tracking-[0.2em] mt-3"
              style={{ color: DIM }}
            >
              Day Streak
            </div>
            <div
              className="text-[8px] uppercase tracking-[0.18em] mt-1"
              style={{ color: GOLD }}
            >
              16 to 30
            </div>
          </div>

          <div
            className="rounded-xl p-3 cursor-pointer hover:brightness-125"
            style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, height: 96 }}
          >
            <div
              className="text-[28px] font-bold leading-none tabular-nums"
              style={{ color: TEXT }}
            >
              24<span className="text-[16px]" style={{ color: DIM }}>/35</span>
            </div>
            <div
              className="text-[9px] uppercase tracking-[0.2em] mt-3"
              style={{ color: DIM }}
            >
              This Week
            </div>
            <div className="mt-1 h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: SURFACE_2 }}>
              <div className="h-full" style={{ width: '68%', backgroundColor: ASR }} />
            </div>
          </div>

          <div
            className="rounded-xl p-3 cursor-pointer hover:brightness-125"
            style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, height: 96 }}
          >
            <div className="flex items-baseline gap-1">
              <span
                className="text-[28px] font-bold leading-none tabular-nums"
                style={{ color: TEXT }}
              >
                92
              </span>
              <span className="text-[10px]" style={{ color: DIM }}>/140</span>
            </div>
            <div
              className="text-[9px] uppercase tracking-[0.2em] mt-3"
              style={{ color: DIM }}
            >
              Last 28 Days
            </div>
            <div
              className="text-[8px] uppercase tracking-[0.18em] mt-1"
              style={{ color: ASR }}
            >
              66% rate
            </div>
          </div>
        </div>

        {/* WEEKLY BAR CHART */}
        <div
          className="mx-4 mt-3 rounded-xl p-4"
          style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, height: 156 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="text-[10px] uppercase tracking-[0.25em] font-bold"
              style={{ color: TEXT }}
            >
              This Week
            </div>
            <div
              className="text-[9px] uppercase tracking-[0.2em]"
              style={{ color: DIM }}
            >
              Nov 5 — 11
            </div>
          </div>

          <div className="flex items-end justify-between gap-1.5 h-[88px]">
            {WEEK.map((day, idx) => {
              const isToday = idx === WEEK.length - 1;
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group"
                >
                  <div className="flex-1 w-full flex flex-col-reverse justify-start gap-[1px]">
                    {Array.from({ length: day.count }).map((_, segIdx) => (
                      <div
                        key={segIdx}
                        className="w-full rounded-[2px] group-hover:brightness-125"
                        style={{
                          backgroundColor: STACK_COLORS[segIdx],
                          height: `${100 / 5}%`,
                        }}
                      />
                    ))}
                    {Array.from({ length: 5 - day.count }).map((_, segIdx) => (
                      <div
                        key={`e${segIdx}`}
                        className="w-full rounded-[2px]"
                        style={{
                          backgroundColor: SURFACE_2,
                          height: `${100 / 5}%`,
                        }}
                      />
                    ))}
                  </div>
                  <div
                    className="text-[9px] font-bold uppercase tracking-wider"
                    style={{ color: isToday ? GOLD : DIM }}
                  >
                    {day.d}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PRAYER LIST */}
        <div className="mx-4 mt-3 mb-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <div
              className="text-[10px] uppercase tracking-[0.25em] font-bold"
              style={{ color: TEXT }}
            >
              Today's Log
            </div>
            <div
              className="text-[9px] uppercase tracking-[0.2em]"
              style={{ color: DIM }}
            >
              17:30 now
            </div>
          </div>

          <div
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}
          >
            {PRAYERS.map((p, idx) => {
              const isNext = !p.done && PRAYERS.slice(0, idx).every((x) => x.done);
              return (
                <div
                  key={p.key}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.03]"
                  style={{
                    borderBottom:
                      idx < PRAYERS.length - 1 ? `1px solid ${BORDER}` : 'none',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: p.color,
                        boxShadow: p.done ? `0 0 6px ${p.color}` : 'none',
                      }}
                    />
                    <div className="flex flex-col">
                      <span
                        className="text-[13px] font-semibold uppercase tracking-[0.15em]"
                        style={{ color: p.done ? TEXT : DIM }}
                      >
                        {p.name}
                      </span>
                      {isNext && (
                        <span
                          className="text-[8px] uppercase tracking-[0.2em] mt-0.5"
                          style={{ color: GOLD }}
                        >
                          Next · in 2h 01m
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[12px] tabular-nums"
                      style={{ color: p.done ? TEXT : DIM }}
                    >
                      {p.time}
                    </span>
                    {p.done ? (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: p.color }}
                      >
                        <Check size={14} color={BG} strokeWidth={3} />
                      </div>
                    ) : (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ border: `1.5px dashed ${DIM_2}` }}
                      >
                        <Circle size={6} color={DIM} fill={DIM} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className="w-full mt-3 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:brightness-125"
            style={{ backgroundColor: SURFACE_2, color: TEXT }}
          >
            <span
              className="text-[10px] uppercase tracking-[0.25em] font-bold"
            >
              View Full History
            </span>
            <ChevronRight size={12} color={TEXT} />
          </button>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
