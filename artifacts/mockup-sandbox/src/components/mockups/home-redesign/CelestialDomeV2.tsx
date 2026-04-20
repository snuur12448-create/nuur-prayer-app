import React from 'react';
import { MapPin, Bell, BookOpen, Share2, Compass, BookMarked, Sparkles, Check } from 'lucide-react';

const BG = '#0A1612';
const SURFACE = '#10231C';
const SURFACE_2 = '#0D1C17';
const BORDER = '#1F3A30';
const GOLD = '#D4A017';
const GOLD_SOFT = 'rgba(212,160,23,0.14)';
const TEXT = '#E8EAE6';
const TEXT_DIM = '#8A9A91';

// Daytime prayers (Dhuhr, Asr, Maghrib) sit ON the arc.
// Fajr (pre-dawn) and Isha (post-sunset) live BELOW the horizon — night-side of the day.
const ARC_PRAYERS = [
  { id: 'dhuhr',   en: 'Dhuhr',   ar: 'الظهر',  time: '12:18', angle: -90, status: 'past' },
  { id: 'asr',     en: 'Asr',     ar: 'العصر',  time: '15:31', angle: -45, status: 'now' },
  { id: 'maghrib', en: 'Maghrib', ar: 'المغرب', time: '18:04', angle: 0,   status: 'next' },
];
const NIGHT_PRAYERS = [
  { id: 'fajr', en: 'Fajr', ar: 'الفجر',  time: '05:42', side: 'left' as const,  status: 'past' },
  { id: 'isha', en: 'Isha', ar: 'العشاء', time: '19:32', side: 'right' as const, status: 'upcoming' },
];

// Day progress (sunrise to sunset)
const SUNRISE_MIN = 6 * 60 + 58;     // 06:58
const SUNSET_MIN  = 18 * 60 + 1;     // 18:01
const NOW_MIN     = 15 * 60 + 24;    // 15:24
const dayPct = (NOW_MIN - SUNRISE_MIN) / (SUNSET_MIN - SUNRISE_MIN);

// Sun on dome — interpolate angle smoothly via dayPct
function sunAngleAt(pct: number) {
  // Map 0..1 → -180..0 (left horizon → right horizon along arc apex)
  return -180 + pct * 180;
}

export function CelestialDomeV2() {
  const W = 390;
  const HERO_H = 410;
  const cx = W / 2;
  const cy = 280;
  const R = 138;

  const sunDeg = sunAngleAt(dayPct);
  const sunRad = (sunDeg * Math.PI) / 180;
  const sunX = cx + R * Math.cos(sunRad);
  const sunY = cy + R * Math.sin(sunRad);

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: 'Inter, system-ui, sans-serif' }} className="pb-12">

      {/* ─────────────  SKY DOME HERO (no centred clock)  ───────────── */}
      <div style={{ position: 'relative', height: HERO_H, overflow: 'hidden' }}>
        {/* Sky gradient — late-afternoon amber over deep plum */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, #1A1530 0%, #3A1F2E 30%, #7A3826 65%, #B85A2D 90%, #C26835 100%)',
        }} />
        {/* Faint stars top */}
        {[...Array(14)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', top: 16 + (i * 3.7) % 60, left: ((i * 47) % W),
            width: 1.5, height: 1.5, borderRadius: '50%',
            background: `rgba(255,240,210,${0.25 + (i % 3) * 0.12})`,
          }} />
        ))}

        {/* Top bar — calmer, scoped to the hero */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '50px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(10px)' }}>
            <MapPin size={11} color="#FFE4B5" />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#FFE4B5', letterSpacing: 0.3 }}>Karachi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,228,181,0.8)', fontWeight: 500, letterSpacing: 1 }}>2 SHAWWĀL · 1447</span>
            <button style={{ padding: 7, borderRadius: 999, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(10px)', border: 'none' }}>
              <Bell size={12} color="#FFE4B5" />
            </button>
          </div>
        </div>

        {/* The dome */}
        <svg width={W} height={HERO_H} style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <linearGradient id="arcGradV2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,228,181,0.18)" />
              <stop offset="50%" stopColor="rgba(255,228,181,0.5)" />
              <stop offset="100%" stopColor="rgba(255,228,181,0.18)" />
            </linearGradient>
            <radialGradient id="sunGlowV2" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#FFF1C4" stopOpacity="1" />
              <stop offset="40%" stopColor="#FFC97A" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#FFB347" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Dome arc — dotted for elegance */}
          <path
            d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
            fill="none" stroke="url(#arcGradV2)" strokeWidth="1.4" strokeDasharray="2 5"
          />

          {/* Horizon line */}
          <line x1={16} y1={cy} x2={W - 16} y2={cy} stroke="rgba(255,228,181,0.32)" strokeWidth="1" />

          {/* Sunrise tick (left) — tiny, no time clutter (Fajr's row owns the time) */}
          <g>
            <circle cx={cx - R} cy={cy - 4} r="2.2" fill="rgba(255,228,181,0.55)" />
            <text x={cx - R} y={cy - 10} textAnchor="middle" fill="rgba(255,228,181,0.5)"
              style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: 1.2 }}>
              SUNRISE
            </text>
          </g>
          {/* Sunset tick (right) — tiny, no time clutter (Maghrib owns the time) */}
          <g>
            <circle cx={cx + R} cy={cy - 4} r="2.2" fill="rgba(255,228,181,0.55)" />
            <text x={cx + R} y={cy - 10} textAnchor="middle" fill="rgba(255,228,181,0.5)"
              style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: 1.2 }}>
              SUNSET
            </text>
          </g>

          {/* Daytime prayer markers — on the arc */}
          {ARC_PRAYERS.map((p) => {
            const r = (p.angle * Math.PI) / 180;
            const x = cx + R * Math.cos(r);
            const y = cy + R * Math.sin(r);
            const past = p.status === 'past';
            const now = p.status === 'now';

            // Place labels ABOVE the marker when the sun is sitting on it (avoids glow occlusion);
            // otherwise BELOW for arc prayers, ABOVE for the apex.
            const sunOnMe = Math.abs(sunDeg - p.angle) < 8;
            const apex = p.angle === -90;
            const above = apex || sunOnMe;
            const labelDy = above ? -22 : 22;
            const timeDy = above ? -10 : 33;
            const anchor: 'start' | 'middle' | 'end' = p.angle <= -120 ? 'start' : (p.angle >= -10 ? 'end' : 'middle');
            const dx = anchor === 'start' ? 7 : (anchor === 'end' ? -7 : 0);

            return (
              <g key={p.id} opacity={past ? 0.6 : 1}>
                <circle cx={x} cy={y} r={now ? 7 : 5}
                  fill={now ? '#FFE4B5' : (past ? 'rgba(255,228,181,0.85)' : 'transparent')}
                  stroke="#FFE4B5" strokeWidth={now ? 2 : 1.5} />
                {past && <text x={x} y={y + 2.5} textAnchor="middle" fill="#7A3826" style={{ fontSize: 7, fontWeight: 900 }}>✓</text>}
                {now && <circle cx={x} cy={y} r="11" fill="none" stroke="#FFE4B5" strokeWidth="1" opacity="0.45" />}

                <text x={x + dx} y={y + labelDy} textAnchor={anchor} fill="rgba(255,228,181,0.95)"
                  style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.3 }}>
                  {p.en.toUpperCase()}
                </text>
                <text x={x + dx} y={y + timeDy} textAnchor={anchor} fill="rgba(255,228,181,0.65)"
                  style={{ fontSize: 9, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                  {p.time}
                </text>
              </g>
            );
          })}

          {/* Night-side prayers — Fajr (pre-dawn, far-left) & Isha (post-sunset, far-right).
              Sit further into the corners and well below horizon so labels never collide with Maghrib. */}
          {NIGHT_PRAYERS.map((p) => {
            const isLeft = p.side === 'left';
            const x = isLeft ? 28 : W - 28;
            const y = cy + 70;
            const past = p.status === 'past';
            const anchor: 'start' | 'end' = isLeft ? 'start' : 'end';

            return (
              <g key={p.id} opacity={past ? 0.6 : 0.95}>
                {/* Crescent moon glyph — night marker */}
                <circle cx={x} cy={y} r={7} fill="rgba(180,200,230,0.92)" stroke="none" />
                <circle cx={x + (isLeft ? 3 : -3)} cy={y - 1} r={6} fill="rgba(20,20,40,0.95)" stroke="none" />
                {past && <text x={x + (isLeft ? -2 : 2)} y={y + 2.5} textAnchor="middle" fill="#1A1530" style={{ fontSize: 7, fontWeight: 900 }}>✓</text>}

                {/* Dotted connector linking the moon back up to the horizon, so it reads as the same timeline */}
                <line x1={x} y1={y - 8} x2={x} y2={cy + 2} stroke="rgba(180,200,230,0.3)" strokeWidth="1" strokeDasharray="1 3" />

                <text x={isLeft ? x + 14 : x - 14} y={y - 3} textAnchor={anchor} fill="rgba(210,222,238,0.95)"
                  style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.3 }}>
                  {p.en.toUpperCase()}
                </text>
                <text x={isLeft ? x + 14 : x - 14} y={y + 9} textAnchor={anchor} fill="rgba(210,222,238,0.65)"
                  style={{ fontSize: 9, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                  {p.time}
                </text>
                <text x={isLeft ? x + 14 : x - 14} y={y + 21} textAnchor={anchor} fill="rgba(210,222,238,0.4)"
                  style={{ fontSize: 8, fontWeight: 500, fontStyle: 'italic', letterSpacing: 0.3 }}>
                  {isLeft ? 'pre-dawn' : 'after sunset'}
                </text>
              </g>
            );
          })}

          {/* THE SUN — glow + body, position = the time */}
          <circle cx={sunX} cy={sunY} r="32" fill="url(#sunGlowV2)" />
          <circle cx={sunX} cy={sunY} r="11" fill="#FFF1C4" />
          {/* Tiny time caption beside the sun (sun IS the clock) */}
          <text x={sunX + 18} y={sunY + 3} fill="#FFF1C4" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, fontVariantNumeric: 'tabular-nums' }}>
            15:24
          </text>
        </svg>
      </div>

      {/* ────────  Sunrise → Sunset hairline (anchors the sun)  ──────── */}
      <div style={{ padding: '10px 22px 16px', background: 'linear-gradient(180deg, #C26835 0%, rgba(10,22,18,0) 100%)' }}>
        <div style={{ position: 'relative', height: 2, background: 'rgba(255,228,181,0.18)', borderRadius: 1 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: 2, width: `${dayPct * 100}%`, background: 'linear-gradient(90deg, rgba(255,228,181,0.4), #FFF1C4)', borderRadius: 1 }} />
          <div style={{ position: 'absolute', left: `${dayPct * 100}%`, top: -3, width: 8, height: 8, borderRadius: '50%', background: '#FFF1C4', transform: 'translateX(-50%)', boxShadow: '0 0 10px rgba(255,241,196,0.9)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, color: 'rgba(255,228,181,0.6)', fontWeight: 600, letterSpacing: 1 }}>
          <span>06:58</span>
          <span>{Math.round(dayPct * 100)}% OF DAYLIGHT</span>
          <span>18:01</span>
        </div>
      </div>

      {/* ─────────────  NOW / NEXT card  ───────────── */}
      <div style={{ padding: '6px 20px 14px' }}>
        <div style={{
          background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 22,
          padding: '16px 16px 14px', position: 'relative', overflow: 'hidden',
          boxShadow: '0 12px 28px rgba(0,0,0,0.4)',
        }}>
          {/* tiny ambient warmth top-right */}
          <div style={{ position: 'absolute', right: -50, top: -50, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,160,23,0.13), transparent 70%)' }} />

          {/* Now row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: GOLD, fontWeight: 700 }}>● NOW · IN PROGRESS</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: TEXT, letterSpacing: -0.3 }}>Asr</span>
                <span style={{ fontSize: 16, color: GOLD, fontFamily: 'serif' }}>العصر</span>
              </div>
              <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 2 }}>started 15:31 · ends 18:04</div>
            </div>
            <button style={{
              padding: '8px 12px', borderRadius: 12,
              background: GOLD, border: 'none', display: 'flex', alignItems: 'center', gap: 5,
              boxShadow: '0 4px 12px rgba(212,160,23,0.3)',
            }}>
              <Check size={13} color="#0A1612" strokeWidth={3} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0A1612', letterSpacing: 0.3 }}>Mark prayed</span>
            </button>
          </div>

          {/* Hairline */}
          <div style={{ height: 1, background: BORDER, margin: '14px 0 12px' }} />

          {/* Next row — borrows B's serif countdown typography */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: TEXT_DIM, fontWeight: 700 }}>UNTIL MAGHRIB</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 11, color: TEXT_DIM }}>at</span>
                <span style={{ fontSize: 14, color: TEXT, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>18:04</span>
                <span style={{ fontSize: 11, color: TEXT_DIM, fontFamily: 'serif' }}>· المغرب</span>
              </div>
            </div>
            <div style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 38, fontWeight: 400, letterSpacing: -1,
              color: TEXT, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
            }}>
              2<span style={{ color: GOLD, fontSize: 22, padding: '0 4px 0 2px' }}>h</span>40<span style={{ color: GOLD, fontSize: 22, padding: '0 0 0 2px' }}>m</span>
            </div>
          </div>

          {/* Hairline */}
          <div style={{ height: 1, background: BORDER, margin: '14px 0 12px' }} />

          {/* Day rosebud progress (cohesion with Tracker) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {[true, true, false, false, false].map((filled, i) => (
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
              <span style={{ fontSize: 11, color: TEXT_DIM, fontWeight: 600, marginLeft: 4 }}>2 of 5 today</span>
            </div>
            <span style={{ fontSize: 10, color: GOLD, fontWeight: 600, letterSpacing: 0.5 }}>↗ View tracker</span>
          </div>
        </div>
      </div>

      {/* ─────────────  Featured Ayah (second focal point)  ───────────── */}
      <div style={{ padding: '6px 20px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 10, letterSpacing: 2, color: TEXT_DIM, fontWeight: 700 }}>VERSE OF THE DAY</span>
          <span style={{ fontSize: 10, color: GOLD, fontFamily: 'serif' }}>آية اليوم</span>
        </div>
        <div style={{
          background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 22,
          padding: '20px 18px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(212,160,23,0.07), transparent 55%)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.25)' }} />
              <span style={{ color: GOLD, fontSize: 14, fontFamily: 'serif' }}>﷽</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.25)' }} />
            </div>
            <div style={{
              fontFamily: '"Amiri Quran", serif',
              fontSize: 22, lineHeight: 2, textAlign: 'right', color: TEXT, marginBottom: 12,
              direction: 'rtl' as const,
            }}>
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

      {/* ─────────────  Quick actions (from C)  ───────────── */}
      <div style={{ padding: '0 20px 14px', display: 'flex', gap: 10 }}>
        {[
          { Icon: Compass,    label: 'Qibla' },
          { Icon: BookMarked, label: 'Quran' },
          { Icon: Sparkles,   label: 'Adhkar' },
        ].map(({ Icon, label }) => (
          <div key={label} style={{
            flex: 1, background: SURFACE, border: `1px solid ${BORDER}`,
            borderRadius: 16, padding: '13px 12px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
            <Icon size={18} color={GOLD} />
            <span style={{ fontSize: 11, color: TEXT, fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Footer ornament */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '8px 60px 14px' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.22)' }} />
        <span style={{ color: GOLD, fontSize: 13, fontFamily: 'serif' }}>۞</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.22)' }} />
      </div>
    </div>
  );
}

export default CelestialDomeV2;
