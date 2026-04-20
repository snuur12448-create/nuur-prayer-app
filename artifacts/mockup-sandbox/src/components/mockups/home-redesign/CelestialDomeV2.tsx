import React from 'react';
import { MapPin, Bell, BookOpen, Share2, Compass, BookMarked, Sparkles, Check, Moon } from 'lucide-react';

const BG = '#0A1612';
const SURFACE = '#10231C';
const BORDER = '#1F3A30';
const GOLD = '#D4A017';
const GOLD_SOFT = 'rgba(212,160,23,0.14)';
const TEXT = '#E8EAE6';
const TEXT_DIM = '#8A9A91';

// Time anchors (minutes of day)
const SUNRISE_MIN = 6 * 60 + 58;
const SUNSET_MIN  = 18 * 60 + 1;
const FAJR_MIN    = 5 * 60 + 42;
const DHUHR_MIN   = 12 * 60 + 18;
const ASR_MIN     = 15 * 60 + 31;
const MAGHRIB_MIN = 18 * 60 + 4;
const ISHA_MIN    = 19 * 60 + 32;

type Status = 'past' | 'now' | 'next' | 'upcoming';

export type SceneKey = 'asr' | 'fajr' | 'isha';

export interface SceneConfig {
  key: SceneKey;
  nowMin: number;
  nowLabel: string;          // "15:24"
  /* SKY */
  skyGradient: string;
  underHeroGradient: string;
  starBoost: number;         // 1 = baseline, 2.5 = night
  /* CELESTIAL BODY */
  body: 'sun' | 'moon' | 'none';
  bodyAngleDeg: number | null;   // along the dome (-180 left horizon → 0 right horizon, -90 zenith)
  /* STATUSES */
  arcStatus: Record<'dhuhr' | 'asr' | 'maghrib', Status>;
  nightStatus: Record<'fajr' | 'isha', Status>;
  /* NOW + NEXT card */
  nowPrayer: { en: string; ar: string; sub: string };  // sub = "started 15:31 · ends 18:04"
  next: { label: string; en: string; ar: string; at: string; h: number; m: number };
  /* Daylight / Night progress bar */
  bar: {
    left: string;
    right: string;
    centre: string;
    pct: number;
    accent: string;          // gradient on the filled portion
    track: string;           // track colour
  };
  /* Sunrise tick on the horizon */
  sunriseTick: { show: boolean; emphasis?: 'normal' | 'next' };  // 'next' = highlighted
  /* Date pill */
  dateLabel: string;
}

/* ───────────────  THREE SCENE PRESETS  ─────────────── */
export const ASR_SCENE: SceneConfig = {
  key: 'asr',
  nowMin: 15 * 60 + 24,
  nowLabel: '15:24',
  skyGradient: 'linear-gradient(180deg, #1A1530 0%, #3A1F2E 30%, #7A3826 65%, #B85A2D 90%, #C26835 100%)',
  underHeroGradient: 'linear-gradient(180deg, #C26835 0%, rgba(10,22,18,0) 100%)',
  starBoost: 1,
  body: 'sun',
  bodyAngleDeg: -180 + ((15 * 60 + 24 - SUNRISE_MIN) / (SUNSET_MIN - SUNRISE_MIN)) * 180,
  arcStatus: { dhuhr: 'past', asr: 'now', maghrib: 'next' },
  nightStatus: { fajr: 'past', isha: 'upcoming' },
  nowPrayer: { en: 'Asr', ar: 'العصر', sub: 'started 15:31 · ends 18:04' },
  next: { label: 'UNTIL MAGHRIB', en: 'Maghrib', ar: 'المغرب', at: '18:04', h: 2, m: 40 },
  bar: {
    left: '06:58', right: '18:01', centre: '76% OF DAYLIGHT', pct: 0.76,
    accent: 'linear-gradient(90deg, rgba(255,228,181,0.4), #FFF1C4)',
    track: 'rgba(255,228,181,0.18)',
  },
  sunriseTick: { show: true },
  dateLabel: '2 SHAWWĀL · 1447',
};

export const FAJR_SCENE: SceneConfig = {
  key: 'fajr',
  nowMin: 5 * 60 + 55,                 // 05:55 — mid-Fajr
  nowLabel: '05:55',
  // Pre-dawn: deep indigo high, faint amber bleed at the eastern horizon
  skyGradient: 'linear-gradient(180deg, #06081C 0%, #0E0F2A 40%, #1A1438 70%, #2D1A3A 90%, #4A2A3E 100%)',
  underHeroGradient: 'linear-gradient(180deg, #4A2A3E 0%, rgba(10,22,18,0) 100%)',
  starBoost: 3,
  body: 'moon',
  bodyAngleDeg: -135,                  // moon up-left of zenith — waning, setting in west
  arcStatus: { dhuhr: 'upcoming', asr: 'upcoming', maghrib: 'upcoming' },
  nightStatus: { fajr: 'now', isha: 'past' },
  nowPrayer: { en: 'Fajr', ar: 'الفجر', sub: 'started 05:42 · ends at sunrise 06:58' },
  next: { label: 'UNTIL SUNRISE', en: 'Sunrise', ar: 'الشروق', at: '06:58', h: 1, m: 3 },
  bar: {
    left: '19:32', right: '06:58', centre: 'NIGHT · 64% TO DAWN', pct: 0.64,
    accent: 'linear-gradient(90deg, rgba(170,180,230,0.35), #C9D4F0)',
    track: 'rgba(170,180,230,0.16)',
  },
  sunriseTick: { show: true, emphasis: 'next' },
  dateLabel: '3 SHAWWĀL · 1447',
};

export const ISHA_SCENE: SceneConfig = {
  key: 'isha',
  nowMin: 21 * 60 + 30,                // 21:30
  nowLabel: '21:30',
  // Deep midnight
  skyGradient: 'linear-gradient(180deg, #02030E 0%, #060820 45%, #0A0E2A 80%, #101638 100%)',
  underHeroGradient: 'linear-gradient(180deg, #101638 0%, rgba(10,22,18,0) 100%)',
  starBoost: 4,
  body: 'moon',
  bodyAngleDeg: -110,                  // moon climbing past zenith, slightly east-of-centre
  arcStatus: { dhuhr: 'past', asr: 'past', maghrib: 'past' },
  nightStatus: { fajr: 'upcoming', isha: 'now' },
  nowPrayer: { en: 'Isha', ar: 'العشاء', sub: 'started 19:32 · last 1/3 of night begins 00:48' },
  next: { label: 'UNTIL FAJR', en: 'Fajr', ar: 'الفجر', at: '05:42', h: 8, m: 12 },
  bar: {
    left: '19:32', right: '05:42', centre: 'NIGHT · 19% ELAPSED', pct: 0.19,
    accent: 'linear-gradient(90deg, rgba(170,180,230,0.35), #C9D4F0)',
    track: 'rgba(170,180,230,0.16)',
  },
  sunriseTick: { show: false },
  dateLabel: '2 SHAWWĀL · 1447',
};

/* ───────────────  SHARED RENDERER  ─────────────── */

const ARC_PRAYERS = [
  { id: 'dhuhr',   en: 'Dhuhr',   ar: 'الظهر',  time: '12:18', angle: -90 },
  { id: 'asr',     en: 'Asr',     ar: 'العصر',  time: '15:31', angle: -45 },
  { id: 'maghrib', en: 'Maghrib', ar: 'المغرب', time: '18:04', angle: 0   },
] as const;

const NIGHT_PRAYERS = [
  { id: 'fajr', en: 'Fajr', ar: 'الفجر',  time: '05:42', side: 'left'  as const, sub: 'pre-dawn'    },
  { id: 'isha', en: 'Isha', ar: 'العشاء', time: '19:32', side: 'right' as const, sub: 'after sunset' },
] as const;

export function CelestialDomeScene({ scene }: { scene: SceneConfig }) {
  const W = 390;
  const HERO_H = 410;
  const cx = W / 2;
  const cy = 280;
  const R = 138;

  const bodyDeg = scene.bodyAngleDeg ?? -90;
  const bodyRad = (bodyDeg * Math.PI) / 180;
  const bodyX = cx + R * Math.cos(bodyRad);
  const bodyY = cy + R * Math.sin(bodyRad);
  const isDay = scene.body === 'sun';
  const ink = isDay ? '#FFE4B5' : '#C9D4F0';
  const inkSoft = (a: number) => isDay ? `rgba(255,228,181,${a})` : `rgba(201,212,240,${a})`;

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: 'Inter, system-ui, sans-serif' }} className="pb-12">

      {/* ────────  SKY DOME HERO  ──────── */}
      <div style={{ position: 'relative', height: HERO_H, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: scene.skyGradient }} />

        {/* Stars — denser for night scenes */}
        {[...Array(Math.round(14 * scene.starBoost))].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: 10 + (i * 13.7) % (cy - 30),
            left: ((i * 47) % W),
            width: 1.5 + ((i % 3) === 0 ? 0.6 : 0),
            height: 1.5 + ((i % 3) === 0 ? 0.6 : 0),
            borderRadius: '50%',
            background: `rgba(220,232,255,${0.35 + (i % 3) * 0.18})`,
            opacity: scene.body === 'sun' ? 0.55 : 1,
          }} />
        ))}

        {/* Top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '50px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(10px)' }}>
            <MapPin size={11} color={ink} />
            <span style={{ fontSize: 11, fontWeight: 600, color: ink, letterSpacing: 0.3 }}>Karachi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: inkSoft(0.8), fontWeight: 500, letterSpacing: 1 }}>{scene.dateLabel}</span>
            <button style={{ padding: 7, borderRadius: 999, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(10px)', border: 'none' }}>
              <Bell size={12} color={ink} />
            </button>
          </div>
        </div>

        {/* Dome SVG */}
        <svg width={W} height={HERO_H} style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <linearGradient id={`arcGrad-${scene.key}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={inkSoft(0.18)} />
              <stop offset="50%" stopColor={inkSoft(0.5)} />
              <stop offset="100%" stopColor={inkSoft(0.18)} />
            </linearGradient>
            <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#FFF1C4" stopOpacity="1" />
              <stop offset="40%" stopColor="#FFC97A" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#FFB347" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#E8EEFF" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#A8B4DC" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#A8B4DC" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Dome arc */}
          <path
            d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
            fill="none" stroke={`url(#arcGrad-${scene.key})`} strokeWidth="1.4" strokeDasharray="2 5"
          />

          {/* Horizon */}
          <line x1={16} y1={cy} x2={W - 16} y2={cy} stroke={inkSoft(0.32)} strokeWidth="1" />

          {/* Sunrise tick (left) */}
          {scene.sunriseTick.show && (() => {
            const isNext = scene.sunriseTick.emphasis === 'next';
            const a = isNext ? 0.95 : 0.6;
            return (
              <g>
                <circle cx={cx - R} cy={cy - 4} r={isNext ? 3 : 2.2} fill={inkSoft(a)} />
                {isNext && <circle cx={cx - R} cy={cy - 4} r="7" fill="none" stroke={inkSoft(0.4)} strokeWidth="1" />}
                <text x={cx - R} y={cy - 22} textAnchor="middle" fill={inkSoft(0.55)}
                  style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: 1.2 }}>
                  SUNRISE
                </text>
                <text x={cx - R} y={cy - 11} textAnchor="middle" fill={inkSoft(0.7)}
                  style={{ fontSize: 9, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  06:58
                </text>
              </g>
            );
          })()}

          {/* Daytime arc prayers */}
          {ARC_PRAYERS.map((p) => {
            const status: Status = scene.arcStatus[p.id as 'dhuhr' | 'asr' | 'maghrib'];
            const r = (p.angle * Math.PI) / 180;
            const x = cx + R * Math.cos(r);
            const y = cy + R * Math.sin(r);
            const past = status === 'past';
            const now = status === 'now';
            const upcoming = status === 'upcoming';

            const bodyOnMe = scene.body === 'sun' && Math.abs(bodyDeg - p.angle) < 8;
            const apex = p.angle === -90;
            const above = apex || bodyOnMe;
            const labelDy = above ? -22 : 22;
            const timeDy = above ? -10 : 33;
            const anchor: 'start' | 'middle' | 'end' = p.angle <= -120 ? 'start' : (p.angle >= -10 ? 'end' : 'middle');
            const dx = anchor === 'start' ? 7 : (anchor === 'end' ? -7 : 0);

            // dim upcoming prayers when sun isn't around (night scenes)
            const groupOpacity = past ? 0.55 : (upcoming && scene.body !== 'sun' ? 0.35 : 1);

            return (
              <g key={p.id} opacity={groupOpacity}>
                <circle cx={x} cy={y} r={now ? 7 : 5}
                  fill={now ? ink : (past ? inkSoft(0.85) : 'transparent')}
                  stroke={ink} strokeWidth={now ? 2 : 1.5} />
                {past && <text x={x} y={y + 2.5} textAnchor="middle" fill={isDay ? '#7A3826' : '#101638'} style={{ fontSize: 7, fontWeight: 900 }}>✓</text>}
                {now && <circle cx={x} cy={y} r="11" fill="none" stroke={ink} strokeWidth="1" opacity="0.45" />}

                <text x={x + dx} y={y + labelDy} textAnchor={anchor} fill={inkSoft(0.95)}
                  style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.3 }}>
                  {p.en.toUpperCase()}
                </text>
                <text x={x + dx} y={y + timeDy} textAnchor={anchor} fill={inkSoft(0.65)}
                  style={{ fontSize: 9, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                  {p.time}
                </text>
                {p.id === 'maghrib' && (
                  <text x={x + dx} y={y + timeDy + 11} textAnchor={anchor} fill={inkSoft(0.42)}
                    style={{ fontSize: 8, fontWeight: 500, fontStyle: 'italic', letterSpacing: 0.4 }}>
                    sunset
                  </text>
                )}
              </g>
            );
          })}

          {/* Night-side prayers (Fajr / Isha) */}
          {NIGHT_PRAYERS.map((p) => {
            const status: Status = scene.nightStatus[p.id as 'fajr' | 'isha'];
            const isLeft = p.side === 'left';
            const x = isLeft ? 28 : W - 28;
            const y = cy + 70;
            const past = status === 'past';
            const now = status === 'now';
            const anchor: 'start' | 'end' = isLeft ? 'start' : 'end';

            // crescent base + cut-out
            const moonFill = now ? '#FFE4B5' : 'rgba(180,200,230,0.92)';
            const cutFill = now ? '#3A1F2E' : 'rgba(20,20,40,0.95)';
            const moonR = now ? 8.5 : 7;
            const cutR = now ? 7.5 : 6;

            return (
              <g key={p.id} opacity={past ? 0.5 : 0.95}>
                {now && <circle cx={x} cy={y} r="13" fill="none" stroke="#FFE4B5" strokeWidth="1" opacity="0.55" />}
                <circle cx={x} cy={y} r={moonR} fill={moonFill} stroke="none" />
                <circle cx={x + (isLeft ? 3 : -3)} cy={y - 1} r={cutR} fill={cutFill} stroke="none" />
                {past && <text x={x + (isLeft ? -2 : 2)} y={y + 2.5} textAnchor="middle" fill="#1A1530" style={{ fontSize: 7, fontWeight: 900 }}>✓</text>}

                <line x1={x} y1={y - 8} x2={x} y2={cy + 2} stroke={now ? 'rgba(255,228,181,0.45)' : 'rgba(180,200,230,0.3)'} strokeWidth="1" strokeDasharray="1 3" />

                <text x={isLeft ? x + 14 : x - 14} y={y - 3} textAnchor={anchor}
                  fill={now ? 'rgba(255,228,181,1)' : 'rgba(210,222,238,0.95)'}
                  style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.3 }}>
                  {p.en.toUpperCase()}
                </text>
                <text x={isLeft ? x + 14 : x - 14} y={y + 9} textAnchor={anchor}
                  fill={now ? 'rgba(255,228,181,0.75)' : 'rgba(210,222,238,0.65)'}
                  style={{ fontSize: 9, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                  {p.time}
                </text>
                <text x={isLeft ? x + 14 : x - 14} y={y + 21} textAnchor={anchor} fill="rgba(210,222,238,0.4)"
                  style={{ fontSize: 8, fontWeight: 500, fontStyle: 'italic', letterSpacing: 0.3 }}>
                  {now ? 'in progress' : p.sub}
                </text>
              </g>
            );
          })}

          {/* THE BODY — sun OR moon */}
          {scene.body === 'sun' && (
            <>
              <circle cx={bodyX} cy={bodyY} r="32" fill="url(#sunGlow)" />
              <circle cx={bodyX} cy={bodyY} r="11" fill="#FFF1C4" />
              <text x={bodyX + 18} y={bodyY + 3} fill="#FFF1C4" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, fontVariantNumeric: 'tabular-nums' }}>
                {scene.nowLabel}
              </text>
            </>
          )}
          {scene.body === 'moon' && (
            <>
              <circle cx={bodyX} cy={bodyY} r="28" fill="url(#moonGlow)" />
              {/* Crescent moon: bright disc + offset shadow disc */}
              <circle cx={bodyX} cy={bodyY} r="13" fill="#E8EEFF" />
              <circle cx={bodyX + (scene.key === 'fajr' ? 6 : -5)} cy={bodyY - 1.5} r="11" fill={scene.skyGradient.includes('#02030E') ? '#02030E' : '#0E0F2A'} />
              <text x={bodyX + 22} y={bodyY + 3} fill="#E8EEFF" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, fontVariantNumeric: 'tabular-nums' }}>
                {scene.nowLabel}
              </text>
            </>
          )}
        </svg>
      </div>

      {/* ────────  Progress hairline  ──────── */}
      <div style={{ padding: '10px 22px 16px', background: scene.underHeroGradient }}>
        <div style={{ position: 'relative', height: 2, background: scene.bar.track, borderRadius: 1 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: 2, width: `${scene.bar.pct * 100}%`, background: scene.bar.accent, borderRadius: 1 }} />
          <div style={{
            position: 'absolute', left: `${scene.bar.pct * 100}%`, top: -3, width: 8, height: 8, borderRadius: '50%',
            background: isDay ? '#FFF1C4' : '#C9D4F0',
            transform: 'translateX(-50%)',
            boxShadow: isDay ? '0 0 10px rgba(255,241,196,0.9)' : '0 0 10px rgba(201,212,240,0.85)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, color: inkSoft(0.6), fontWeight: 600, letterSpacing: 1 }}>
          <span>{scene.bar.left}</span>
          <span>{scene.bar.centre}</span>
          <span>{scene.bar.right}</span>
        </div>
      </div>

      {/* ────────  NOW / NEXT  ──────── */}
      <div style={{ padding: '6px 20px 14px' }}>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 22, padding: '16px 16px 14px', position: 'relative', overflow: 'hidden', boxShadow: '0 12px 28px rgba(0,0,0,0.4)' }}>
          <div style={{ position: 'absolute', right: -50, top: -50, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,160,23,0.13), transparent 70%)' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: GOLD, fontWeight: 700 }}>● NOW · IN PROGRESS</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: TEXT, letterSpacing: -0.3 }}>{scene.nowPrayer.en}</span>
                <span style={{ fontSize: 16, color: GOLD, fontFamily: 'serif' }}>{scene.nowPrayer.ar}</span>
              </div>
              <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 2 }}>{scene.nowPrayer.sub}</div>
            </div>
            <button style={{ padding: '8px 12px', borderRadius: 12, background: GOLD, border: 'none', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 4px 12px rgba(212,160,23,0.3)' }}>
              <Check size={13} color="#0A1612" strokeWidth={3} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0A1612', letterSpacing: 0.3 }}>Mark prayed</span>
            </button>
          </div>

          <div style={{ height: 1, background: BORDER, margin: '14px 0 12px' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: TEXT_DIM, fontWeight: 700 }}>{scene.next.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 11, color: TEXT_DIM }}>at</span>
                <span style={{ fontSize: 14, color: TEXT, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{scene.next.at}</span>
                <span style={{ fontSize: 11, color: TEXT_DIM, fontFamily: 'serif' }}>· {scene.next.ar}</span>
              </div>
            </div>
            <div style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 38, fontWeight: 400, letterSpacing: -1,
              color: TEXT, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
            }}>
              {scene.next.h}<span style={{ color: GOLD, fontSize: 22, padding: '0 4px 0 2px' }}>h</span>{scene.next.m.toString().padStart(2, '0')}<span style={{ color: GOLD, fontSize: 22, padding: '0 0 0 2px' }}>m</span>
            </div>
          </div>

          <div style={{ height: 1, background: BORDER, margin: '14px 0 12px' }} />

          {/* Rosebud progress */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {(scene.key === 'fajr' ? [false, false, false, false, false] : scene.key === 'isha' ? [true, true, true, true, false] : [true, true, false, false, false]).map((filled, i) => (
                <div key={i} style={{
                  width: 11, height: 11, borderRadius: '50%',
                  background: filled ? GOLD : 'transparent',
                  border: `1.5px solid ${filled ? 'rgba(212,160,23,0.7)' : BORDER}`,
                  boxShadow: filled ? '0 0 5px rgba(212,160,23,0.55)' : 'none',
                  position: 'relative',
                }}>
                  {filled && <div style={{ position: 'absolute', top: 2, left: 3, width: 2.5, height: 2.5, borderRadius: '50%', background: '#FFEEC2' }} />}
                </div>
              ))}
              <span style={{ fontSize: 11, color: TEXT_DIM, fontWeight: 600, marginLeft: 4 }}>
                {scene.key === 'fajr' ? '0 of 5 today' : scene.key === 'isha' ? '4 of 5 today' : '2 of 5 today'}
              </span>
            </div>
            <span style={{ fontSize: 10, color: GOLD, fontWeight: 600, letterSpacing: 0.5 }}>↗ View tracker</span>
          </div>
        </div>
      </div>

      {/* ────────  Verse of the day  ──────── */}
      <div style={{ padding: '6px 20px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 10, letterSpacing: 2, color: TEXT_DIM, fontWeight: 700 }}>VERSE OF THE DAY</span>
          <span style={{ fontSize: 10, color: GOLD, fontFamily: 'serif' }}>آية اليوم</span>
        </div>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 22, padding: '20px 18px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(212,160,23,0.07), transparent 55%)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.25)' }} />
              <span style={{ color: GOLD, fontSize: 14, fontFamily: 'serif' }}>﷽</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.25)' }} />
            </div>
            <div style={{ fontFamily: '"Amiri Quran", serif', fontSize: 22, lineHeight: 2, textAlign: 'right', color: TEXT, marginBottom: 12, direction: 'rtl' as const }}>
              وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: '#C5CFC8', fontStyle: 'italic', textAlign: 'center', marginBottom: 14, padding: '0 6px' }}>
              "And whoever fears Allah — He will make for him a way out."
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
              <span style={{ fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: 1 }}>SŪRAH AṬ-ṬALĀQ · 65:2</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ padding: '6px 10px', borderRadius: 8, background: GOLD_SOFT, border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BookOpen size={11} color={GOLD} />
                  <span style={{ fontSize: 10, color: GOLD, fontWeight: 700 }}>Read</span>
                </button>
                <button style={{ padding: 7, borderRadius: 8, background: GOLD_SOFT, border: 'none' }}>
                  <Share2 size={11} color={GOLD} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ────────  Quick actions  ──────── */}
      <div style={{ padding: '0 20px 14px', display: 'flex', gap: 10 }}>
        {(scene.key === 'isha'
          ? [{ Icon: Moon, label: 'Tahajjud' }, { Icon: BookMarked, label: 'Quran' }, { Icon: Sparkles, label: 'Adhkar' }]
          : [{ Icon: Compass, label: 'Qibla' }, { Icon: BookMarked, label: 'Quran' }, { Icon: Sparkles, label: 'Adhkar' }]
        ).map(({ Icon, label }) => (
          <div key={label} style={{ flex: 1, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '13px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <Icon size={18} color={GOLD} />
            <span style={{ fontSize: 11, color: TEXT, fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '8px 60px 14px' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.22)' }} />
        <span style={{ color: GOLD, fontSize: 13, fontFamily: 'serif' }}>۞</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.22)' }} />
      </div>
    </div>
  );
}

export function CelestialDomeV2() {
  return <CelestialDomeScene scene={ASR_SCENE} />;
}

export default CelestialDomeV2;
