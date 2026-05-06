import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

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
const ARABIC = '"Amiri Quran", "Scheherazade New", "Noto Naskh Arabic", serif';

type Prayer = { key: string; en: string; ar: string; time: string; prayed: boolean; next?: boolean };
const PRAYERS: Prayer[] = [
  { key: 'fajr', en: 'Fajr', ar: 'ٱلْفَجْر', time: '05:42', prayed: true },
  { key: 'dhuhr', en: 'Dhuhr', ar: 'ٱلظُّهْر', time: '12:48', prayed: true },
  { key: 'asr', en: 'Asr', ar: 'ٱلْعَصْر', time: '16:14', prayed: true },
  { key: 'maghrib', en: 'Maghrib', ar: 'ٱلْمَغْرِب', time: '19:31', prayed: false, next: true },
  { key: 'isha', en: 'Isha', ar: 'ٱلْعِشَاء', time: '21:02', prayed: false },
];

const WEEK = [
  { d: 'W', n: 5 }, { d: 'T', n: 5 }, { d: 'F', n: 4 },
  { d: 'S', n: 5 }, { d: 'S', n: 5 }, { d: 'M', n: 3 }, { d: 'T', n: 3, today: true },
];

const MONTH = [5,5,4,3,5,2,5, 5,4,5,5,5,3,4, 0,5,5,4,5,5,5, 4,5,5,4,5,3,3];
const TODAY_IDX = 27;

function Floret({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} stroke={GOLD} strokeWidth="0.8" fill="none" opacity="0.7">
      <circle cx="0" cy="0" r="2.2" fill={GOLD} opacity="0.9" />
      <path d="M0 -8 Q 3 -3 0 0 Q -3 -3 0 -8 Z" fill={GOLD} opacity="0.5" />
      <path d="M0 8 Q 3 3 0 0 Q -3 3 0 8 Z" fill={GOLD} opacity="0.5" />
      <path d="M-8 0 Q -3 3 0 0 Q -3 -3 -8 0 Z" fill={GOLD} opacity="0.5" />
      <path d="M8 0 Q 3 3 0 0 Q 3 -3 8 0 Z" fill={GOLD} opacity="0.5" />
    </g>
  );
}

function Lamp({ lit, glow }: { lit: boolean; glow?: boolean }) {
  return (
    <svg width="22" height="26" viewBox="0 0 22 26" style={{ overflow: 'visible' }}>
      {glow && (
        <circle cx="11" cy="15" r="13" fill={GOLD} opacity="0.18">
          <animate attributeName="opacity" values="0.10;0.32;0.10" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="r" values="11;15;11" dur="2.4s" repeatCount="indefinite" />
        </circle>
      )}
      {lit && !glow && (
        <circle cx="11" cy="15" r="9" fill={GOLD} opacity="0.18" />
      )}
      {/* chain */}
      <line x1="11" y1="0" x2="11" y2="5" stroke={lit ? GOLD : TEXT_MUTE} strokeWidth="0.6" opacity="0.6" />
      {/* cap */}
      <path d="M7 5 L15 5 L13.5 8 L8.5 8 Z" fill={lit ? GOLD_DARK : 'none'} stroke={lit ? GOLD : TEXT_MUTE} strokeWidth="0.7" />
      {/* bulb */}
      <path d="M8 8 Q 5 13 7 18 Q 11 22 15 18 Q 17 13 14 8 Z"
        fill={lit ? GOLD : 'none'}
        stroke={lit ? GOLD_LIGHT : TEXT_MUTE}
        strokeWidth="0.7"
      />
      {/* flame dot */}
      {lit && <circle cx="11" cy="14" r="1.6" fill={GOLD_LIGHT} />}
      {/* tassel */}
      <line x1="11" y1="22" x2="11" y2="25" stroke={lit ? GOLD : TEXT_MUTE} strokeWidth="0.5" opacity="0.5" />
    </svg>
  );
}

function Bead({ fill, ring, size = 14 }: { fill: number; ring?: boolean; size?: number }) {
  const pct = fill / 5;
  const r = size / 2;
  return (
    <svg width={size + 4} height={size + 4} viewBox={`0 0 ${size + 4} ${size + 4}`}>
      <circle cx={r + 2} cy={r + 2} r={r} fill={SURFACE_HI} stroke={BORDER} strokeWidth="0.6" />
      {pct > 0 && (
        <circle
          cx={r + 2}
          cy={r + 2}
          r={r - 1.5}
          fill={GOLD}
          opacity={0.25 + pct * 0.65}
        />
      )}
      {pct === 1 && <circle cx={r + 2} cy={r + 2} r={r - 3} fill={GOLD_LIGHT} opacity="0.7" />}
      {ring && <circle cx={r + 2} cy={r + 2} r={r + 1} fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.9" />}
    </svg>
  );
}

export default function Mihrab() {
  const [prayed, setPrayed] = useState<Record<string, boolean>>(
    Object.fromEntries(PRAYERS.map((p) => [p.key, p.prayed]))
  );
  const [view, setView] = useState<'week' | 'month'>('month');

  const W = 358;
  const H = 440;
  const archRadius = W / 2 - 12;
  const archTop = 12;
  const archCenterY = archTop + archRadius;
  const innerOffset = 8;

  // outer arch path
  const outerPath = `
    M 12 ${H - 12}
    L 12 ${archCenterY}
    A ${archRadius} ${archRadius} 0 0 1 ${W - 12} ${archCenterY}
    L ${W - 12} ${H - 12}
    Z
  `;
  const innerR = archRadius - innerOffset;
  const innerPath = `
    M ${12 + innerOffset} ${H - 12 - innerOffset}
    L ${12 + innerOffset} ${archCenterY}
    A ${innerR} ${innerR} 0 0 1 ${W - 12 - innerOffset} ${archCenterY}
    L ${W - 12 - innerOffset} ${H - 12 - innerOffset}
    Z
  `;

  return (
    <div
      className="w-full min-h-[844px] max-h-[844px] max-w-[390px] mx-auto overflow-hidden"
      style={{ backgroundColor: BG, color: TEXT, fontFamily: SANS }}
    >
      <div className="w-full h-[844px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <style>{`
          .no-scroll::-webkit-scrollbar { display: none; }
          @keyframes nuurPulse { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
          @keyframes nuurHalo { 0%,100% { opacity: .15; transform: scale(1) } 50% { opacity: .42; transform: scale(1.18) } }
        `}</style>

        {/* 1) STATUS BAR */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3" style={{ height: 50 }}>
          <div className="flex flex-col">
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: TEXT_MUTE }}>
              TUE · 21 JUMĀDĀ I
            </span>
            <span style={{ fontSize: 11, color: TEXT_DIM, marginTop: 2 }}>Nov 11 · 1447</span>
          </div>
          <div
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-90"
            style={{
              padding: '6px 10px',
              borderRadius: 999,
              border: `1px solid ${GOLD}`,
              background: 'rgba(244,200,66,0.06)',
              boxShadow: '0 0 18px rgba(244,200,66,0.18)',
            }}
          >
            {/* candle icon */}
            <svg width="10" height="14" viewBox="0 0 10 14">
              <path d="M5 0 Q 7 2 5 4 Q 3 2 5 0 Z" fill={GOLD_LIGHT} />
              <rect x="3.5" y="4" width="3" height="9" rx="0.6" fill={GOLD_DARK} stroke={GOLD} strokeWidth="0.4" />
              <circle cx="5" cy="2.5" r="2.3" fill={GOLD} opacity="0.35">
                <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1.6s" repeatCount="indefinite" />
              </circle>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: GOLD }}>
              14&nbsp;DAY&nbsp;LIGHT
            </span>
          </div>
        </div>

        {/* 2) MIHRAB FRAME */}
        <div className="px-4" style={{ marginTop: 4 }}>
          <div
            className="relative mx-auto"
            style={{
              width: W,
              height: H,
              filter: 'drop-shadow(0 8px 32px rgba(244,200,66,0.10))',
            }}
          >
            <svg
              width={W}
              height={H}
              viewBox={`0 0 ${W} ${H}`}
              style={{ position: 'absolute', inset: 0 }}
            >
              <defs>
                <linearGradient id="nicheSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1A2C46" />
                  <stop offset="40%" stopColor="#2A2238" />
                  <stop offset="80%" stopColor="#1A1A1A" />
                  <stop offset="100%" stopColor={BG} />
                </linearGradient>
                <radialGradient id="nicheGlow" cx="0.5" cy="0.78" r="0.6">
                  <stop offset="0%" stopColor={GOLD} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
                </radialGradient>
                <filter id="softBlur"><feGaussianBlur stdDeviation="3" /></filter>
              </defs>

              {/* niche fill */}
              <path d={outerPath} fill="url(#nicheSky)" />
              <path d={outerPath} fill="url(#nicheGlow)" />

              {/* Outer + Inner gold hairlines */}
              <path d={outerPath} fill="none" stroke={GOLD} strokeWidth="1" opacity="0.55" />
              <path d={innerPath} fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.4" />

              {/* Corner florets at rectangle corners */}
              <Floret x={20} y={H - 20} rot={0} />
              <Floret x={W - 20} y={H - 20} rot={0} />
              <Floret x={20} y={archCenterY} rot={0} />
              <Floret x={W - 20} y={archCenterY} rot={0} />

              {/* Apex rosette */}
              <g transform={`translate(${W / 2} ${archTop + 30})`}>
                <circle r="18" fill="none" stroke={GOLD} strokeWidth="0.6" opacity="0.45" />
                <circle r="13" fill="none" stroke={GOLD} strokeWidth="0.6" opacity="0.55" />
                <circle r="9" fill={SURFACE_HI} stroke={GOLD} strokeWidth="0.6" opacity="0.9" />
                {[0, 60, 120, 180, 240, 300].map((a) => (
                  <line
                    key={a}
                    x1="0"
                    y1="-13"
                    x2="0"
                    y2="-18"
                    stroke={GOLD}
                    strokeWidth="0.6"
                    opacity="0.45"
                    transform={`rotate(${a})`}
                  />
                ))}
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  fill={GOLD_LIGHT}
                  style={{ fontFamily: ARABIC, fontSize: 11, fontWeight: 700 }}
                >
                  ٢١
                </text>
              </g>

              {/* dashed gold arc following inner curve, decorative */}
              <path
                d={`M ${12 + innerOffset + 6} ${archCenterY} A ${innerR - 6} ${innerR - 6} 0 0 1 ${W - 12 - innerOffset - 6} ${archCenterY}`}
                fill="none"
                stroke={GOLD}
                strokeWidth="0.6"
                strokeDasharray="2 5"
                opacity="0.35"
              />
            </svg>

            {/* Inside content (HTML overlay) */}
            <div
              className="absolute inset-0 flex flex-col items-center"
              style={{ paddingTop: archTop + 70 }}
            >
              {/* BIG TIME */}
              <div className="flex flex-col items-center" style={{ marginTop: 6 }}>
                <span
                  style={{
                    fontFamily: SERIF,
                    fontSize: 44,
                    fontWeight: 400,
                    letterSpacing: '0.02em',
                    color: TEXT,
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                    textShadow: '0 0 24px rgba(244,200,66,0.18)',
                  }}
                >
                  17:30
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.32em',
                    color: GOLD,
                    marginTop: 6,
                  }}
                >
                  NOW
                </span>
              </div>

              {/* gold hairline divider */}
              <div
                style={{
                  width: 120,
                  height: 1,
                  background: GOLD,
                  opacity: 0.3,
                  marginTop: 12,
                  marginBottom: 6,
                }}
              />

              {/* Lamp lines */}
              <div className="w-full px-6" style={{ marginTop: 6 }}>
                {PRAYERS.map((p) => {
                  const isPrayed = prayed[p.key];
                  const isNext = p.next;
                  return (
                    <div
                      key={p.key}
                      className="cursor-pointer group"
                      onClick={() =>
                        setPrayed((prev) => ({ ...prev, [p.key]: !prev[p.key] }))
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '6px 0',
                        borderBottom: `1px solid ${GOLD}`,
                        borderColor: isPrayed || isNext ? `rgba(244,200,66,${isNext ? 0.55 : 0.4})` : 'rgba(244,200,66,0.12)',
                      }}
                    >
                      <div
                        className="group-hover:opacity-100"
                        style={{
                          width: 26,
                          opacity: isPrayed ? 1 : isNext ? 1 : 0.55,
                          transition: 'opacity 0.2s',
                        }}
                      >
                        <Lamp lit={isPrayed || !!isNext} glow={isNext} />
                      </div>
                      <div className="flex-1 flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: isPrayed ? TEXT : isNext ? GOLD_LIGHT : TEXT_DIM,
                              letterSpacing: '0.02em',
                            }}
                          >
                            {p.en}
                          </span>
                          <span
                            dir="rtl"
                            style={{
                              fontFamily: ARABIC,
                              fontSize: 13,
                              color: TEXT_DIM,
                              opacity: 0.7,
                            }}
                          >
                            {p.ar}
                          </span>
                          {isNext && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                letterSpacing: '0.18em',
                                color: GOLD,
                                marginLeft: 4,
                              }}
                            >
                              IN&nbsp;2H&nbsp;01M
                            </span>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontVariantNumeric: 'tabular-nums',
                            color: isPrayed ? TEXT : isNext ? GOLD_LIGHT : TEXT_MUTE,
                            fontWeight: 500,
                          }}
                        >
                          {p.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 3) WEEK STRIP */}
        <div className="px-6" style={{ marginTop: 18, height: 90 }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: TEXT_MUTE }}>
              THIS WEEK · 24/35
            </span>
            <div
              className="flex items-center cursor-pointer hover:opacity-90"
              style={{
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setView('week')}
                style={{
                  padding: '3px 10px',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  background: view === 'week' ? GOLD : 'transparent',
                  color: view === 'week' ? BG : TEXT_DIM,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                WK
              </button>
              <button
                onClick={() => setView('month')}
                style={{
                  padding: '3px 10px',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  background: view === 'month' ? GOLD : 'transparent',
                  color: view === 'month' ? BG : TEXT_DIM,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                MO
              </button>
            </div>
          </div>
          <div className="flex items-end justify-between" style={{ height: 50 }}>
            {WEEK.map((d, i) => (
              <div key={i} className="flex flex-col items-center cursor-pointer hover:opacity-90" style={{ gap: 4 }}>
                <Bead fill={d.n} ring={d.today} size={d.today ? 20 : 14} />
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    color: d.today ? GOLD : TEXT_MUTE,
                  }}
                >
                  {d.d}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4) MONTH BEAD STRING */}
        <div className="px-6" style={{ marginTop: 6 }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: TEXT_MUTE }}>
              28 DAYS · TASBĪḤ
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: GOLD_DARK }}>
              16 → 30 STREAK
            </span>
          </div>
          <div
            style={{
              padding: '10px 4px',
              borderRadius: 14,
              border: `1px solid ${BORDER}`,
              background: SURFACE,
              position: 'relative',
            }}
          >
            {/* connecting hairline string behind beads */}
            <div
              style={{
                position: 'absolute',
                left: 14,
                right: 14,
                top: 0,
                bottom: 0,
                pointerEvents: 'none',
              }}
            >
              {[0, 1, 2, 3].map((row) => (
                <div
                  key={row}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 18 + row * 30,
                    height: 1,
                    background: GOLD,
                    opacity: 0.15,
                  }}
                />
              ))}
            </div>
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="flex items-center justify-between" style={{ padding: '2px 6px' }}>
                {Array.from({ length: 7 }).map((_, col) => {
                  const i = row * 7 + col;
                  const v = MONTH[i];
                  const today = i === TODAY_IDX;
                  return (
                    <div
                      key={col}
                      className="flex flex-col items-center cursor-pointer hover:opacity-90"
                      style={{ gap: 1 }}
                    >
                      <Bead fill={v} ring={today} size={today ? 16 : 12} />
                      <span style={{ fontSize: 7, color: today ? GOLD : TEXT_MUTE, fontVariantNumeric: 'tabular-nums' }}>
                        {i + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 5) INSIGHT FOOTER */}
        <div className="px-6" style={{ marginTop: 14, marginBottom: 24 }}>
          <div
            className="flex items-center justify-between cursor-pointer hover:opacity-95"
            style={{
              padding: '14px 16px',
              borderRadius: 14,
              border: `1px solid ${BORDER}`,
              background: SURFACE_HI,
              boxShadow: '0 8px 24px rgba(244,200,66,0.06)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: TEXT_MUTE }}>
                  ON&nbsp;TIME
                </span>
                <span style={{ fontSize: 18, fontWeight: 700, color: TEXT, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                  86<span style={{ fontSize: 12, color: TEXT_DIM }}>%</span>
                  <span style={{ fontSize: 10, color: TEXT_DIM, marginLeft: 6, fontWeight: 500 }}>this week</span>
                </span>
              </div>
              {/* sparkline */}
              <svg width="80" height="28" viewBox="0 0 80 28" style={{ marginLeft: 8 }}>
                <polyline
                  points="0,18 12,14 24,16 36,8 48,12 60,6 72,10 80,4"
                  fill="none"
                  stroke={GOLD}
                  strokeWidth="1.2"
                  opacity="0.85"
                />
                <polyline
                  points="0,18 12,14 24,16 36,8 48,12 60,6 72,10 80,4"
                  fill="none"
                  stroke={GOLD}
                  strokeWidth="3"
                  opacity="0.18"
                />
                <circle cx="80" cy="4" r="2" fill={GOLD_LIGHT} />
              </svg>
            </div>
            <button
              className="cursor-pointer hover:opacity-90 flex items-center gap-1"
              style={{
                padding: '7px 12px',
                borderRadius: 999,
                background: 'rgba(244,200,66,0.10)',
                border: `1px solid ${GOLD}`,
                color: GOLD,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.18em',
              }}
            >
              REFLECT
              <ChevronRight size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
