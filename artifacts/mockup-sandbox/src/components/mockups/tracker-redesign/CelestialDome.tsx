import React, { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Sparkles, BookOpen, Bookmark } from 'lucide-react';

const BG = '#0A1612';
const SURFACE = '#10231C';
const SURFACE_2 = '#0D1C17';
const BORDER = '#1F3A30';
const GOLD = '#D4A017';
const TEXT = '#E8EAE6';
const TEXT_DIM = '#7A8B82';

const PRAYERS = [
  { id: 'fajr',    en: 'Fajr',    ar: 'الفجر',   color: '#6366f1', time: '05:42', angle: 200 },
  { id: 'dhuhr',   en: 'Dhuhr',   ar: 'الظهر',  color: '#f59e0b', time: '12:18', angle: 270 },
  { id: 'asr',     en: 'Asr',     ar: 'العصر',  color: '#10b981', time: '15:31', angle: 305 },
  { id: 'maghrib', en: 'Maghrib', ar: 'المغرب', color: '#f97316', time: '18:04', angle: 340 },
  { id: 'isha',    en: 'Isha',    ar: 'العشاء', color: '#8b5cf6', time: '19:32', angle: 0 },
];

// 14-day moon-phase chain
const MOON_DAYS = Array.from({ length: 14 }, (_, i) => ({
  day: i + 1,
  full: i < 13, // 13 of last 14 fully completed
}));

// position around dome arc (semicircle, top is sunrise→sunset)
function arcPos(angle: number, cx: number, cy: number, r: number) {
  // angle: 180=sunrise (left), 270=zenith (top), 360/0=sunset (right)
  const rad = (angle * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

export function CelestialDome() {
  const [done, setDone] = useState<Record<string, boolean>>({
    fajr: true, dhuhr: true, asr: true,
  });
  const completed = Object.values(done).filter(Boolean).length;
  const streak = 47;

  // current "sun" position based on time of day (assume 3:30pm → angle ~310)
  const sunAngle = 310;

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: 'Inter, system-ui, sans-serif' }} className="pb-12">
      {/* ── Header ── */}
      <div className="px-5 pt-14 pb-3 flex items-center justify-between">
        <div>
          <div style={{ color: GOLD, fontSize: 10, letterSpacing: 3, fontWeight: 600 }}>PRAYER · TRACKER</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span style={{ fontSize: 22, fontWeight: 700, color: TEXT, letterSpacing: -0.3 }}>The Dome</span>
            <span style={{ color: GOLD, fontFamily: 'Amiri, serif', fontSize: 16 }}>القُبَّة</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="p-1.5 rounded-full" style={{ background: SURFACE_2, border: `1px solid ${BORDER}` }}>
            <ChevronLeft size={14} color={TEXT_DIM} />
          </button>
          <button className="p-1.5 rounded-full" style={{ background: SURFACE_2, border: `1px solid ${BORDER}` }}>
            <ChevronRight size={14} color={TEXT_DIM} />
          </button>
        </div>
      </div>

      {/* ── Celestial Dome SVG ── */}
      <div className="px-3 mt-2 relative">
        <svg viewBox="0 0 360 200" width="100%" height="200" style={{ overflow: 'visible' }}>
          {/* ground line */}
          <defs>
            <linearGradient id="domeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(212,160,23,0.18)" />
              <stop offset="60%" stopColor="rgba(99,102,241,0.06)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <radialGradient id="sunGrad" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#FFE08A" />
              <stop offset="60%" stopColor="#F77F2E" />
              <stop offset="100%" stopColor="rgba(247,127,46,0)" />
            </radialGradient>
            <filter id="sunGlow"><feGaussianBlur stdDeviation="3" /></filter>
          </defs>

          {/* dome fill */}
          <path d="M 30 180 A 150 150 0 0 1 330 180 Z" fill="url(#domeGrad)" />
          {/* dome arc */}
          <path d="M 30 180 A 150 150 0 0 1 330 180" fill="none" stroke={GOLD + '55'} strokeWidth="1.5" strokeDasharray="2 4" />
          {/* horizon */}
          <line x1="20" y1="180" x2="340" y2="180" stroke={BORDER} strokeWidth="1" />

          {/* tick marks at each prayer */}
          {PRAYERS.map((p) => {
            const pos = arcPos(p.angle, 180, 180, 150);
            const isDone = !!done[p.id];
            return (
              <g key={p.id}>
                <circle cx={pos.x} cy={pos.y} r={isDone ? 9 : 7}
                  fill={isDone ? p.color : SURFACE_2} stroke={p.color} strokeWidth="2"
                  style={{ filter: isDone ? `drop-shadow(0 0 6px ${p.color})` : 'none' }} />
                {isDone && <circle cx={pos.x} cy={pos.y} r="3" fill="#fff" />}
                <text x={pos.x} y={pos.y + 24} textAnchor="middle" fill={TEXT_DIM}
                  style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1 }}>
                  {p.en.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* sun (current time) */}
          {(() => {
            const sp = arcPos(sunAngle, 180, 180, 150);
            return (
              <g>
                <circle cx={sp.x} cy={sp.y} r="22" fill="url(#sunGrad)" filter="url(#sunGlow)" />
                <circle cx={sp.x} cy={sp.y} r="10" fill="#FFE08A" />
                <text x={sp.x} y={sp.y - 28} textAnchor="middle" fill={GOLD}
                  style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>NOW · 15:24</text>
              </g>
            );
          })()}
        </svg>

        {/* date strip */}
        <div className="mt-2 text-center">
          <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Saturday, April 19</div>
          <div style={{ fontSize: 11, color: GOLD, fontFamily: 'Amiri, serif', marginTop: 1 }}>2 Shawwāl 1447 AH</div>
        </div>
      </div>

      {/* ── Streak: moon-phase chain ── */}
      <div className="mt-5 px-5">
        <div className="rounded-2xl p-4" style={{
          background: `linear-gradient(135deg, ${SURFACE} 0%, ${SURFACE_2} 100%)`,
          border: `1px solid ${BORDER}`,
        }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div style={{ color: TEXT_DIM, fontSize: 9, letterSpacing: 2, fontWeight: 600 }}>STREAK</div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span style={{ fontSize: 30, fontWeight: 800, color: TEXT, letterSpacing: -0.8, fontVariantNumeric: 'tabular-nums' }}>{streak}</span>
                <span style={{ fontSize: 11, color: TEXT_DIM, fontWeight: 500 }}>days</span>
              </div>
            </div>
            <div className="text-right">
              <div style={{ color: GOLD, fontSize: 11, fontWeight: 600 }}>✦ Crescent of Shawwāl</div>
              <div style={{ color: TEXT_DIM, fontSize: 10, marginTop: 1 }}>13 to 60-day milestone</div>
            </div>
          </div>

          {/* Moon-phase chain */}
          <div className="flex justify-between gap-1">
            {MOON_DAYS.map((m) => (
              <div key={m.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="relative rounded-full" style={{ width: 14, height: 14 }}>
                  {m.full ? (
                    <div className="rounded-full" style={{
                      width: 14, height: 14,
                      background: `radial-gradient(circle at 35% 35%, #FFF8E7 0%, ${GOLD} 70%, #B8860B 100%)`,
                      boxShadow: `0 0 5px ${GOLD}88`,
                    }} />
                  ) : (
                    <div className="rounded-full" style={{
                      width: 14, height: 14,
                      background: BORDER,
                      border: `1px solid ${TEXT_DIM}33`,
                    }} />
                  )}
                </div>
                <span style={{ fontSize: 7, color: TEXT_DIM, fontVariantNumeric: 'tabular-nums' }}>{m.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Prayer rows (compact, since dome is the visual) ── */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-2.5">
          <span style={{ color: TEXT, fontSize: 13, fontWeight: 700 }}>Today · {completed}/5</span>
          <span style={{ color: TEXT_DIM, fontSize: 11 }}>tap dome or row</span>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          {PRAYERS.map((p, i) => {
            const isDone = !!done[p.id];
            return (
              <button key={p.id}
                onClick={() => setDone({ ...done, [p.id]: !isDone })}
                className="w-full flex items-center gap-3 px-4 py-2.5"
                style={{ borderBottom: i < PRAYERS.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                <div className="rounded-full flex items-center justify-center" style={{
                  width: 22, height: 22,
                  background: isDone ? p.color : 'transparent',
                  border: `2px solid ${isDone ? p.color : BORDER}`,
                }}>
                  {isDone && <Check size={12} color="#fff" strokeWidth={3.5} />}
                </div>
                <div className="flex-1 text-left flex items-baseline gap-2">
                  <span style={{ fontSize: 14, fontWeight: 600, color: isDone ? p.color : TEXT }}>{p.en}</span>
                  <span style={{ fontSize: 12, color: TEXT_DIM, fontFamily: 'Amiri, serif' }}>{p.ar}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_DIM, fontVariantNumeric: 'tabular-nums' }}>{p.time}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Auxiliary entries ── */}
      <div className="px-5 mt-4 space-y-2">
        <button className="w-full rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <div className="rounded-xl flex items-center justify-center" style={{ width: 32, height: 32, background: GOLD + '18', border: `1px solid ${GOLD}33` }}>
            <BookOpen size={14} color={GOLD} />
          </div>
          <div className="flex-1 text-left">
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>Sunnah prayers</div>
            <div style={{ fontSize: 10, color: TEXT_DIM }}>Rawātib, Ḍuḥā, Tahajjud</div>
          </div>
          <ChevronRight size={14} color={TEXT_DIM} />
        </button>
        <button className="w-full rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <div className="rounded-xl flex items-center justify-center" style={{ width: 32, height: 32, background: GOLD + '18', border: `1px solid ${GOLD}33` }}>
            <Bookmark size={14} color={GOLD} />
          </div>
          <div className="flex-1 text-left">
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>Make-up prayers</div>
            <div style={{ fontSize: 10, color: TEXT_DIM }}>A quiet ledger for qaḍā</div>
          </div>
          <ChevronRight size={14} color={TEXT_DIM} />
        </button>
      </div>

      <div className="flex items-center gap-3 mt-6 px-12">
        <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
        <Sparkles size={11} color={GOLD} />
        <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
      </div>
    </div>
  );
}

export default CelestialDome;
