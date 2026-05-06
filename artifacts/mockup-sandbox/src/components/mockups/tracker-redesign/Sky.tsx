import React from 'react';
import { ChevronLeft, ChevronRight, Flame, Check, Star, Moon, TrendingUp } from 'lucide-react';

const BG = '#0A1A0E';
const SURFACE = '#111F14';
const SURFACE_HI = '#172B1B';
const BORDER = '#1F3526';
const TEXT = '#F0EDE5';
const TEXT_DIM = '#8FA99A';
const TEXT_MUTE = '#5C7264';
const GOLD = '#F4C842';
const GOLD_LIGHT = '#F9D97A';
const GOLD_DARK = '#C99A2A';

const SANS = 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const SERIF = 'ui-serif, Georgia, "Iowan Old Style", "Apple Garamond", serif';

const PRAYER = {
  fajr: '#5B6CFF',
  dhuhr: '#F59E0B',
  asr: '#10B981',
  maghrib: '#F97316',
  isha: '#8B5CF6',
};

const COMPLETIONS = [
  5, 5, 4, 3, 5, 2, 5,
  5, 4, 5, 5, 5, 3, 4,
  0, 5, 5, 4, 5, 5, 5,
  4, 5, 5, 4, 5, 3, 3,
];

const SKY_W = 342;
const SKY_H = 380;

const STAR_POS: { x: number; y: number }[] = [
  { x: 28, y: 48 },   { x: 64, y: 28 },   { x: 102, y: 62 },  { x: 145, y: 36 },
  { x: 188, y: 70 },  { x: 232, y: 44 },  { x: 280, y: 60 },  { x: 312, y: 96 },
  { x: 24, y: 102 },  { x: 70, y: 134 },  { x: 122, y: 118 }, { x: 168, y: 152 },
  { x: 220, y: 122 }, { x: 268, y: 148 }, { x: 38, y: 178 },  { x: 96, y: 196 },
  { x: 148, y: 220 }, { x: 198, y: 200 }, { x: 248, y: 232 }, { x: 304, y: 200 },
  { x: 30, y: 252 },  { x: 84, y: 274 },  { x: 138, y: 296 }, { x: 230, y: 282 },
  { x: 286, y: 308 }, { x: 50, y: 322 },  { x: 116, y: 342 }, { x: 200, y: 350 },
];

const MOON_X = 178;
const MOON_Y = 182;

function StarShape({ size, color, glow }: { size: number; color: string; glow: number }) {
  const s = size;
  const path = `M ${s/2} 0 L ${s*0.61} ${s*0.38} L ${s} ${s*0.38} L ${s*0.69} ${s*0.62} L ${s*0.81} ${s} L ${s/2} ${s*0.76} L ${s*0.19} ${s} L ${s*0.31} ${s*0.62} L 0 ${s*0.38} L ${s*0.39} ${s*0.38} Z`;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ overflow: 'visible' }}>
      {glow > 0 && (
        <circle cx={s/2} cy={s/2} r={s*0.9} fill={GOLD} opacity={glow} style={{ filter: 'blur(6px)' }} />
      )}
      <path d={path} fill={color} />
    </svg>
  );
}

export default function Sky() {
  return (
    <div
      className="w-full min-h-[844px] max-h-[844px] max-w-[390px] mx-auto overflow-hidden"
      style={{ backgroundColor: BG, color: TEXT, fontFamily: SANS }}
    >
      <div className="w-full h-[844px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {/* HEADER */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <h1 style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 26, lineHeight: '30px', color: TEXT, letterSpacing: '-0.01em' }}>
              Jumādā al-Ūlā · 1447
            </h1>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', color: TEXT_MUTE, marginTop: 4 }}>
              NOVEMBER 2025
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <button
              className="cursor-pointer hover:bg-white/5 rounded-full transition-colors flex items-center justify-center"
              style={{ width: 32, height: 32, border: `1px solid ${BORDER}` }}
            >
              <ChevronLeft size={14} color={TEXT_DIM} />
            </button>
            <button
              className="cursor-pointer hover:bg-white/5 rounded-full transition-colors flex items-center justify-center"
              style={{ width: 32, height: 32, border: `1px solid ${BORDER}` }}
            >
              <ChevronRight size={14} color={TEXT_DIM} />
            </button>
          </div>
        </div>

        {/* HERO SKY */}
        <div className="px-3 mt-1">
          <div
            className="relative cursor-pointer"
            style={{
              width: '100%',
              height: SKY_H + 32,
              borderRadius: 22,
              background: 'linear-gradient(180deg, #0A0F2E 0%, #1A1B3A 38%, #2D2A52 70%, #1A0F2E 100%)',
              border: `1px solid ${BORDER}`,
              boxShadow: '0 12px 40px rgba(244,200,66,0.10), inset 0 0 60px rgba(0,0,0,0.4)',
              overflow: 'hidden',
            }}
          >
            {/* background stars dust */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  radial-gradient(1px 1px at 12% 8%, rgba(249,217,122,0.9), transparent 60%),
                  radial-gradient(1px 1px at 38% 14%, rgba(255,255,255,0.7), transparent 60%),
                  radial-gradient(1px 1px at 72% 6%, rgba(249,217,122,0.6), transparent 60%),
                  radial-gradient(1px 1px at 89% 22%, rgba(255,255,255,0.7), transparent 60%),
                  radial-gradient(1.2px 1.2px at 6% 32%, rgba(249,217,122,0.7), transparent 60%),
                  radial-gradient(1px 1px at 24% 44%, rgba(255,255,255,0.5), transparent 60%),
                  radial-gradient(1px 1px at 58% 36%, rgba(249,217,122,0.5), transparent 60%),
                  radial-gradient(1px 1px at 86% 48%, rgba(255,255,255,0.6), transparent 60%),
                  radial-gradient(1.2px 1.2px at 16% 60%, rgba(249,217,122,0.6), transparent 60%),
                  radial-gradient(1px 1px at 44% 66%, rgba(255,255,255,0.5), transparent 60%),
                  radial-gradient(1px 1px at 76% 58%, rgba(249,217,122,0.5), transparent 60%),
                  radial-gradient(1.2px 1.2px at 92% 72%, rgba(255,255,255,0.6), transparent 60%),
                  radial-gradient(1px 1px at 8% 78%, rgba(249,217,122,0.6), transparent 60%),
                  radial-gradient(1px 1px at 32% 86%, rgba(255,255,255,0.5), transparent 60%),
                  radial-gradient(1px 1px at 60% 92%, rgba(249,217,122,0.5), transparent 60%),
                  radial-gradient(1px 1px at 80% 84%, rgba(255,255,255,0.6), transparent 60%),
                  radial-gradient(1px 1px at 50% 4%, rgba(255,255,255,0.4), transparent 60%),
                  radial-gradient(1px 1px at 18% 22%, rgba(255,255,255,0.4), transparent 60%),
                  radial-gradient(1px 1px at 66% 28%, rgba(255,255,255,0.4), transparent 60%),
                  radial-gradient(1px 1px at 94% 36%, rgba(255,255,255,0.4), transparent 60%),
                  radial-gradient(1px 1px at 4% 48%, rgba(255,255,255,0.4), transparent 60%),
                  radial-gradient(1px 1px at 36% 56%, rgba(255,255,255,0.4), transparent 60%),
                  radial-gradient(1px 1px at 70% 70%, rgba(255,255,255,0.4), transparent 60%),
                  radial-gradient(1px 1px at 22% 92%, rgba(255,255,255,0.4), transparent 60%),
                  radial-gradient(1px 1px at 48% 76%, rgba(255,255,255,0.4), transparent 60%),
                  radial-gradient(1px 1px at 88% 94%, rgba(255,255,255,0.4), transparent 60%),
                  radial-gradient(1px 1px at 56% 18%, rgba(255,255,255,0.4), transparent 60%),
                  radial-gradient(1px 1px at 14% 68%, rgba(255,255,255,0.4), transparent 60%),
                  radial-gradient(1px 1px at 78% 42%, rgba(255,255,255,0.4), transparent 60%),
                  radial-gradient(1px 1px at 40% 30%, rgba(255,255,255,0.4), transparent 60%)
                `,
              }}
            />

            {/* faint Arabic background */}
            <div
              className="absolute pointer-events-none select-none"
              style={{
                right: 16, top: 70,
                fontFamily: '"Amiri Quran", "Scheherazade New", serif',
                fontSize: 64, color: GOLD_LIGHT, opacity: 0.05,
                letterSpacing: '0.05em',
              }}
              dir="rtl"
            >
              ٱلْيَوْم
            </div>

            {/* top labels */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 z-20">
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-full"
                style={{ background: 'rgba(244,200,66,0.10)', border: '1px solid rgba(244,200,66,0.25)' }}
              >
                <Flame size={10} color={GOLD} />
                <span style={{ fontSize: 10, fontWeight: 600, color: GOLD_LIGHT, letterSpacing: '0.02em' }}>14 day streak</span>
              </div>
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-1 z-20">
              <span style={{ fontSize: 10, fontWeight: 600, color: TEXT_DIM, fontVariantNumeric: 'tabular-nums' }}>
                <span style={{ color: GOLD_LIGHT }}>92</span> / 140
              </span>
              <span style={{ fontSize: 8, fontWeight: 700, color: TEXT_MUTE, letterSpacing: '0.18em', marginLeft: 4 }}>LUNAR</span>
            </div>

            {/* SVG layer with arcs, meteor, stars, moon */}
            <svg
              className="absolute inset-0"
              width="100%" height="100%"
              viewBox={`0 0 ${SKY_W} ${SKY_H}`}
              preserveAspectRatio="xMidYMid meet"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <radialGradient id="moonHalo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={GOLD_LIGHT} stopOpacity="0.55" />
                  <stop offset="50%" stopColor={GOLD} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
                </radialGradient>
                <linearGradient id="meteorGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity="0" />
                  <stop offset="60%" stopColor={GOLD_LIGHT} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={GOLD_LIGHT} stopOpacity="1" />
                </linearGradient>
                <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={GOLD_LIGHT} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
                </radialGradient>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD_LIGHT} />
                  <stop offset="100%" stopColor={GOLD_DARK} />
                </linearGradient>
              </defs>

              {/* meteor trail: from day -14 (index 14) to moon */}
              {(() => {
                const start = STAR_POS[14];
                const cx1 = (start.x + MOON_X) / 2 - 30;
                const cy1 = (start.y + MOON_Y) / 2 + 40;
                return (
                  <path
                    d={`M ${start.x} ${start.y} Q ${cx1} ${cy1} ${MOON_X} ${MOON_Y}`}
                    stroke="url(#meteorGrad)"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                );
              })()}

              {/* dashed gold arc connecting last 7 stars + moon (week) */}
              {(() => {
                const week = STAR_POS.slice(21, 28);
                const pts = [...week, { x: MOON_X, y: MOON_Y }];
                const d = pts
                  .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
                  .join(' ');
                return (
                  <path
                    d={d}
                    stroke={GOLD}
                    strokeWidth="1"
                    strokeDasharray="2 5"
                    fill="none"
                    opacity="0.45"
                  />
                );
              })()}

              {/* 28 stars */}
              {STAR_POS.map((p, i) => {
                const c = COMPLETIONS[i];
                const size = c === 0 ? 3 : 5 + c * 2.2;
                const isZero = c === 0;
                const color = isZero ? TEXT_MUTE : GOLD_LIGHT;
                const glowOpacity = c >= 4 ? 0.35 : c >= 2 ? 0.18 : 0;
                if (isZero) {
                  return (
                    <circle key={i} cx={p.x} cy={p.y} r={1.5} fill={TEXT_MUTE} opacity={0.5} />
                  );
                }
                // 5-point star path centered at p.x, p.y
                const s = size;
                const r = s / 2;
                const points: string[] = [];
                for (let k = 0; k < 10; k++) {
                  const angle = (Math.PI / 5) * k - Math.PI / 2;
                  const rad = k % 2 === 0 ? r : r * 0.42;
                  points.push(`${p.x + Math.cos(angle) * rad},${p.y + Math.sin(angle) * rad}`);
                }
                return (
                  <g key={i} style={{ cursor: 'pointer' }}>
                    {glowOpacity > 0 && (
                      <circle cx={p.x} cy={p.y} r={s * 1.4} fill="url(#starGlow)" opacity={glowOpacity} />
                    )}
                    <polygon points={points.join(' ')} fill={color} />
                  </g>
                );
              })}

              {/* CRESCENT MOON - day 28 (today) at central position */}
              <g style={{ cursor: 'pointer' }}>
                <circle cx={MOON_X} cy={MOON_Y} r={42} fill="url(#moonHalo)" />
                <circle cx={MOON_X} cy={MOON_Y} r={28} fill="url(#moonHalo)" opacity="0.7" />
                {/* crescent: full circle minus offset circle */}
                <defs>
                  <mask id="crescentMask">
                    <rect width={SKY_W} height={SKY_H} fill="black" />
                    <circle cx={MOON_X} cy={MOON_Y} r={18} fill="white" />
                    <circle cx={MOON_X + 7} cy={MOON_Y - 3} r={16} fill="black" />
                  </mask>
                </defs>
                <rect
                  width={SKY_W} height={SKY_H}
                  fill="url(#goldGrad)"
                  mask="url(#crescentMask)"
                />
                {/* day number tag below moon */}
                <text
                  x={MOON_X} y={MOON_Y + 38}
                  textAnchor="middle"
                  style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em' }}
                  fill={GOLD_LIGHT}
                  opacity="0.85"
                >
                  TODAY · 21
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* MOON DETAIL CARD */}
        <div className="px-3 mt-3">
          <div
            className="relative"
            style={{
              borderRadius: 22,
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              padding: 14,
              boxShadow: '0 8px 24px rgba(244,200,66,0.06)',
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: TEXT_MUTE, letterSpacing: '0.22em' }}>
                  TODAY · 3 OF 5 LIT
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  {(['fajr','dhuhr','asr','maghrib','isha'] as const).map((p, i) => {
                    const lit = i < 3;
                    const pulsing = i === 3;
                    const c = PRAYER[p];
                    return (
                      <div
                        key={p}
                        className="cursor-pointer flex flex-col items-center gap-1 hover:scale-110 transition-transform"
                        style={{ width: 38 }}
                      >
                        <div
                          className="relative flex items-center justify-center"
                          style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: lit ? c : 'transparent',
                            border: `1.5px solid ${lit ? c : pulsing ? c : BORDER}`,
                            boxShadow: lit ? `0 0 12px ${c}66` : pulsing ? `0 0 10px ${c}88` : 'none',
                          }}
                        >
                          {lit && <Check size={11} color="#fff" strokeWidth={3} />}
                          {pulsing && (
                            <div
                              className="absolute inset-0 rounded-full"
                              style={{
                                background: c, opacity: 0.4,
                                animation: 'sky-pulse 1.6s ease-in-out infinite',
                              }}
                            />
                          )}
                        </div>
                        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: lit ? TEXT_DIM : pulsing ? c : TEXT_MUTE }}>
                          {p.toUpperCase().slice(0,3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="text-right">
                <div style={{ fontFamily: SANS, fontSize: 26, fontWeight: 700, color: TEXT, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                  17:30
                </div>
                <div style={{ fontSize: 10, color: PRAYER.maghrib, marginTop: 4, fontWeight: 600 }}>
                  Maghrib in 2h 01m
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                className="cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-1.5 px-3 py-2"
                style={{
                  borderRadius: 12,
                  background: 'linear-gradient(180deg, #F9D97A 0%, #C99A2A 100%)',
                  color: '#2A1F08',
                  fontSize: 12, fontWeight: 700,
                  letterSpacing: '0.02em',
                  boxShadow: '0 4px 14px rgba(244,200,66,0.30)',
                }}
              >
                <Check size={13} strokeWidth={3} />
                Mark Maghrib prayed
              </button>
            </div>
          </div>
        </div>

        {/* WEEK GLANCE */}
        <div className="px-3 mt-3">
          <div
            className="flex items-center justify-between"
            style={{
              borderRadius: 14,
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              padding: '12px 12px',
            }}
          >
            <div className="flex flex-col">
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', color: TEXT_MUTE }}>WEEK</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                24 / 35
              </span>
            </div>
            <div className="flex items-end gap-1.5">
              {[
                { d: 'W', n: 5 },
                { d: 'T', n: 5 },
                { d: 'F', n: 4 },
                { d: 'S', n: 5 },
                { d: 'S', n: 5 },
                { d: 'M', n: 3 },
                { d: 'T', n: 3, today: true },
              ].map((day, i) => {
                const pct = day.n / 5;
                const r = 14;
                const circ = Math.PI * r;
                const dash = circ * pct;
                return (
                  <div key={i} className="cursor-pointer flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
                    <div className="relative" style={{ width: 32, height: 18 }}>
                      <svg width="32" height="18" viewBox="0 0 32 18" style={{ overflow: 'visible' }}>
                        <path d={`M 2 16 A ${r} ${r} 0 0 1 30 16`} fill="none" stroke={BORDER} strokeWidth="2.5" strokeLinecap="round" />
                        <path
                          d={`M 2 16 A ${r} ${r} 0 0 1 30 16`}
                          fill="none"
                          stroke={day.today ? GOLD : day.n >= 5 ? GOLD_LIGHT : TEXT_DIM}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray={`${dash} ${circ}`}
                        />
                        {day.today && (
                          <circle cx="16" cy="16" r="3" fill={GOLD} />
                        )}
                      </svg>
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                      color: day.today ? GOLD : TEXT_MUTE,
                    }}>
                      {day.d}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* INSIGHT PILL RAIL */}
        <div className="px-3 mt-3 pb-6">
          <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {[
              { icon: <Star size={11} color={GOLD} fill={GOLD} />, label: 'Fajr streak', value: '12 days' },
              { icon: <Moon size={11} color={GOLD_LIGHT} />, label: 'Best day', value: 'Friday' },
              { icon: <TrendingUp size={11} color={GOLD_LIGHT} />, label: 'This week', value: '+2 vs last' },
            ].map((chip, i) => (
              <div
                key={i}
                className="cursor-pointer hover:bg-white/5 transition-colors flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
                style={{
                  borderRadius: 999,
                  border: `1px solid ${BORDER}`,
                  background: SURFACE_HI,
                  padding: '8px 12px',
                }}
              >
                {chip.icon}
                <span style={{ fontSize: 10, fontWeight: 600, color: TEXT_DIM, letterSpacing: '0.04em' }}>
                  {chip.label} ·
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: TEXT, letterSpacing: '0.04em' }}>
                  {chip.value}
                </span>
              </div>
            ))}
          </div>
          <div
            className="text-center mt-4"
            style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 11, color: TEXT_MUTE, letterSpacing: '0.02em' }}
          >
            "The best of your deeds is prayer."
          </div>
        </div>

        <style>{`
          @keyframes sky-pulse {
            0%, 100% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.4); opacity: 0; }
          }
          .overflow-y-auto::-webkit-scrollbar { display: none; }
          .overflow-x-auto::-webkit-scrollbar { display: none; }
        `}</style>
      </div>
    </div>
  );
}
